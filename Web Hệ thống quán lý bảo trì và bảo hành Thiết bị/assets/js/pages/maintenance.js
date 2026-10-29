/**
 * Maintenance Page Logic - Hệ thống quản lý Bảo Trì & Bảo Hành
 */

let maintenanceState = {
  currentTab: 'tickets',
  currentPage: 1,
  pageSize: 10,
  search: '',
  status: '',
  type: '',
  dateFrom: '',
  dateTo: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  totalItems: 0,
  totalPages: 0,
  devices: [],
  technicians: [],
  editingTicketId: null,
  viewingTicketId: null,
  statusTicketId: null
};

const statusLabels = {
  pending: 'Đang chờ',
  in_progress: 'Đang sửa',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy'
};

const statusColors = {
  pending: 'warning',
  in_progress: 'info',
  completed: 'success',
  cancelled: 'secondary'
};

const typeLabels = {
  maintenance: 'Bảo trì',
  warranty: 'Bảo hành'
};

const priorityLabels = {
  low: 'Thấp',
  medium: 'Trung bình',
  high: 'Cao',
  critical: 'Khẩn cấp'
};

const priorityColors = {
  low: 'secondary',
  medium: 'info',
  high: 'warning',
  critical: 'danger'
};

window.pageInit = async function() {
  if (!API.auth.isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }

  // Load reference data
  await Promise.all([
    loadDevicesForSelect(),
    loadTechnicians()
  ]);

  // Setup event listeners
  setupEventListeners();

  // Check URL for action
  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get('action');
  const type = urlParams.get('type') || 'maintenance';

  if (action === 'create') {
    // Open create modal after a short delay
    setTimeout(() => openTicketModal(null, type), 300);
  }

  // Load initial data
  await loadTickets();
};

async function loadDevicesForSelect() {
  try {
    const data = await API.devices.getList({ limit: 1000, status: 'active' });
    maintenanceState.devices = data.items || data || [];

    const deviceSelect = document.getElementById('ticket-device');
    if (deviceSelect) {
      deviceSelect.innerHTML = '<option value="">Chọn thiết bị</option>' +
        maintenanceState.devices.map(d => `<option value="${d.id}">${App.escapeHtml(d.code)} - ${App.escapeHtml(d.name)}</option>`).join('');
    }
  } catch (err) {
    console.error('Failed to load devices:', err);
  }
}

async function loadTechnicians() {
  try {
    // Assuming there's an API to get technicians (users with technician role)
    const data = await API.users.getList({ role: 'technician', limit: 100 });
    maintenanceState.technicians = data.items || data || [];

    const techSelect = document.getElementById('ticket-technician');
    if (techSelect) {
      techSelect.innerHTML = '<option value="">Chọn kỹ thuật viên</option>' +
        maintenanceState.technicians.map(t => `<option value="${t.id}">${App.escapeHtml(t.fullName || t.username)}</option>`).join('');
    }
  } catch (err) {
    console.error('Failed to load technicians:', err);
  }
}

async function loadTickets() {
  const container = document.getElementById('tickets-table-container');
  App.showLoading(container, 'skeleton');

  try {
    const params = {
      page: maintenanceState.currentPage,
      limit: maintenanceState.pageSize,
      search: maintenanceState.search,
      status: maintenanceState.status,
      type: maintenanceState.type,
      startDate: maintenanceState.dateFrom,
      endDate: maintenanceState.dateTo,
      sortBy: maintenanceState.sortBy,
      sortOrder: maintenanceState.sortOrder
    };

    const data = await API.maintenance.getList(params);
    maintenanceState.totalItems = data.total || 0;
    maintenanceState.totalPages = data.totalPages || 1;

    renderTicketsTable(data.items || data);
    renderPagination();
  } catch (err) {
    console.error('Failed to load tickets:', err);
    App.showToast('error', 'Lỗi', 'Không thể tải danh sách phiếu');
    renderTicketsTable([]);
  }
}

function renderTicketsTable(tickets) {
  const container = document.getElementById('tickets-table-container');
  if (!container) return;

  const columns = [
    { field: 'code', label: 'Mã phiếu', minWidth: '130px' },
    { field: 'type', label: 'Loại', type: 'badge', badgeVariant: (v) => v === 'maintenance' ? 'primary' : 'info', minWidth: '90px', render: (v) => `<span class="badge badge-${v === 'maintenance' ? 'primary' : 'info'}">${typeLabels[v] || v}</span>` },
    { field: 'device.code', label: 'Mã thiết bị', minWidth: '120px' },
    { field: 'device.name', label: 'Tên thiết bị', minWidth: '180px' },
    { field: 'reporter', label: 'Người báo', minWidth: '130px' },
    { field: 'priority', label: 'Ưu tiên', type: 'badge', badgeVariant: (v) => priorityColors[v] || 'secondary', minWidth: '90px', render: (v) => `<span class="badge badge-${priorityColors[v] || 'secondary'}">${priorityLabels[v] || v}</span>` },
    { field: 'status', label: 'Trạng thái', type: 'badge', badgeVariant: (v) => statusColors[v] || 'secondary', minWidth: '110px', render: (v) => `<span class="badge badge-${statusColors[v] || 'secondary'}">${statusLabels[v] || v}</span>` },
    { field: 'createdAt', label: 'Ngày tạo', type: 'datetime', minWidth: '140px' },
    { field: 'technicianName', label: 'Kỹ thuật viên', minWidth: '130px' }
  ];

  const actions = [
    {
      name: 'view',
      label: 'Xem chi tiết',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
      handler: (id) => viewTicket(id)
    },
    {
      name: 'edit',
      label: 'Chỉnh sửa',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
      handler: (id) => editTicket(id)
    },
    {
      name: 'status',
      label: 'Cập nhật trạng thái',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>`,
      handler: (id) => openStatusModal(id)
    },
    {
      name: 'delete',
      label: 'Xóa',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
      handler: (id) => confirmDeleteTicket(id)
    }
  ];

  App.renderTable(container, {
    columns,
    data: tickets,
    keyField: 'id',
    actions,
    emptyMessage: 'Chưa có phiếu nào. Nhấn "Tạo phiếu bảo trì" hoặc "Đăng ký bảo hành" để bắt đầu.',
    rowClick: (id) => viewTicket(id)
  });
}

function renderPagination() {
  const container = document.getElementById('tickets-pagination');
  if (!container) return;

  App.renderPagination(container, {
    currentPage: maintenanceState.currentPage,
    totalPages: maintenanceState.totalPages,
    totalItems: maintenanceState.totalItems,
    onPageChange: (page) => {
      maintenanceState.currentPage = page;
      loadTickets();
    }
  });
}

function setupEventListeners() {
  // Tab switching
  document.querySelectorAll('#maintenance-tabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      switchTab(tab);
    });
  });

  // Search
  App.bindSearch('maintenance-search', (value) => {
    maintenanceState.search = value;
    maintenanceState.currentPage = 1;
    loadTickets();
  }, 300);

  // Filter status
  const filterStatus = document.getElementById('filter-ticket-status');
  if (filterStatus) {
    filterStatus.addEventListener('change', (e) => {
      maintenanceState.status = e.target.value;
      maintenanceState.currentPage = 1;
      loadTickets();
    });
  }

  // Filter type
  const filterType = document.getElementById('filter-ticket-type');
  if (filterType) {
    filterType.addEventListener('change', (e) => {
      maintenanceState.type = e.target.value;
      maintenanceState.currentPage = 1;
      loadTickets();
    });
  }

  // Filter date from
  const filterDateFrom = document.getElementById('filter-date-from');
  if (filterDateFrom) {
    filterDateFrom.addEventListener('change', (e) => {
      maintenanceState.dateFrom = e.target.value;
      maintenanceState.currentPage = 1;
      loadTickets();
    });
  }

  // Filter date to
  const filterDateTo = document.getElementById('filter-date-to');
  if (filterDateTo) {
    filterDateTo.addEventListener('change', (e) => {
      maintenanceState.dateTo = e.target.value;
      maintenanceState.currentPage = 1;
      loadTickets();
    });
  }

  // Export button
  const btnExport = document.getElementById('btn-export-maintenance');
  if (btnExport) {
    btnExport.addEventListener('click', exportTickets);
  }

  // Ticket form submit
  const ticketForm = document.getElementById('ticket-form');
  if (ticketForm) {
    App.bindForm('ticket-form', handleTicketSubmit, {
      closeModal: 'ticket-modal-overlay',
      successMessage: maintenanceState.editingTicketId ? 'Cập nhật phiếu thành công' : 'Tạo phiếu thành công',
      onSuccess: () => {
        maintenanceState.editingTicketId = null;
        loadTickets();
      }
    });
  }

  // Status form submit
  const btnStatusSubmit = document.getElementById('btn-status-submit');
  if (btnStatusSubmit) {
    btnStatusSubmit.addEventListener('click', handleStatusSubmit);
  }

  // View ticket edit button
  const btnViewEdit = document.getElementById('view-ticket-edit');
  if (btnViewEdit) {
    btnViewEdit.addEventListener('click', () => {
      if (maintenanceState.viewingTicketId) {
        App.closeModal('view-ticket-modal-overlay');
        editTicket(maintenanceState.viewingTicketId);
      }
    });
  }

  // Ticket type change in form
  const ticketTypeSelect = document.getElementById('ticket-type-select');
  if (ticketTypeSelect) {
    ticketTypeSelect.addEventListener('change', (e) => {
      document.getElementById('ticket-type').value = e.target.value;
      // Show/hide solution field based on type and status
      updateSolutionVisibility();
    });
  }

  // Status change in form
  const ticketStatusSelect = document.getElementById('ticket-status');
  if (ticketStatusSelect) {
    ticketStatusSelect.addEventListener('change', updateSolutionVisibility);
  }

  // Modal close buttons
  document.querySelectorAll('[data-modal-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const overlay = btn.closest('.modal-overlay');
      if (overlay) {
        App.closeModal(overlay.id);
      }
    });
  });
}

function switchTab(tab) {
  maintenanceState.currentTab = tab;

  // Update tab buttons
  document.querySelectorAll('#maintenance-tabs .tab-btn').forEach(btn => {
    const isActive = btn.dataset.tab === tab;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive);
  });

  // Update filters based on tab
  switch (tab) {
    case 'maintenance':
      maintenanceState.type = 'maintenance';
      break;
    case 'warranty':
      maintenanceState.type = 'warranty';
      break;
    case 'schedule':
      // For schedule view, could load scheduled maintenance
      maintenanceState.type = 'maintenance';
      maintenanceState.status = 'pending';
      break;
    default:
      maintenanceState.type = '';
  }

  maintenanceState.currentPage = 1;
  loadTickets();

  // Update filter select to match
  const filterType = document.getElementById('filter-ticket-type');
  if (filterType) {
    filterType.value = maintenanceState.type;
  }
}

function openTicketModal(ticket = null, defaultType = 'maintenance') {
  maintenanceState.editingTicketId = ticket?.id || null;

  const modalTitle = document.getElementById('ticket-modal-title');
  const submitBtn = document.getElementById('ticket-submit-btn');
  const codeInput = document.getElementById('ticket-code');
  const typeSelect = document.getElementById('ticket-type-select');
  const typeHidden = document.getElementById('ticket-type');
  const solutionGroup = document.getElementById('ticket-solution-group');
  const technicianGroup = document.getElementById('ticket-technician-group');
  const statusSelect = document.getElementById('ticket-status');
  const completedAtInput = document.getElementById('ticket-completed-at');

  if (ticket) {
    modalTitle.textContent = 'Chỉnh sửa phiếu';
    submitBtn.querySelector('.btn-text').textContent = 'Cập nhật';
    codeInput.removeAttribute('readonly');
    App.populateForm('ticket-form', ticket);
    typeSelect.value = ticket.type || defaultType;
    typeHidden.value = ticket.type || defaultType;
  } else {
    modalTitle.textContent = defaultType === 'warranty' ? 'Đăng ký bảo hành mới' : 'Tạo phiếu bảo trì mới';
    submitBtn.querySelector('.btn-text').textContent = 'Lưu phiếu';
    codeInput.setAttribute('readonly', true);
    codeInput.value = '';
    App.clearForm('ticket-form');
    typeSelect.value = defaultType;
    typeHidden.value = defaultType;
    // Set default datetime
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('ticket-created-at').value = now.toISOString().slice(0, 16);
    // Set default status
    statusSelect.value = 'pending';
  }

  // Hide solution group for new tickets or pending status
  updateSolutionVisibility();

  // Show/hide technician group based on status
  if (ticket && (ticket.status === 'in_progress' || ticket.status === 'completed')) {
    technicianGroup.style.display = 'block';
  } else {
    technicianGroup.style.display = 'none';
  }

  // Show completedAt for completed tickets
  if (ticket && ticket.status === 'completed') {
    completedAtInput.parentElement.style.display = 'block';
  } else {
    completedAtInput.parentElement.style.display = 'none';
  }

  App.openModal('ticket-modal-overlay');
}

function updateSolutionVisibility() {
  const typeSelect = document.getElementById('ticket-type-select');
  const statusSelect = document.getElementById('ticket-status');
  const solutionGroup = document.getElementById('ticket-solution-group');
  const technicianGroup = document.getElementById('ticket-technician-group');
  const completedAtInput = document.getElementById('ticket-completed-at');

  if (!typeSelect || !statusSelect || !solutionGroup) return;

  const type = typeSelect.value;
  const status = statusSelect.value;

  // Show solution for warranty or completed/in_progress maintenance
  if (type === 'warranty' || status === 'in_progress' || status === 'completed') {
    solutionGroup.style.display = 'block';
  } else {
    solutionGroup.style.display = 'none';
  }

  // Show technician for in_progress or completed
  if (status === 'in_progress' || status === 'completed') {
    technicianGroup.style.display = 'block';
  } else {
    technicianGroup.style.display = 'none';
  }

  // Show completedAt for completed
  if (status === 'completed') {
    completedAtInput.parentElement.style.display = 'block';
  } else {
    completedAtInput.parentElement.style.display = 'none';
  }
}

async function handleTicketSubmit(data, form) {
  const submitBtn = document.getElementById('ticket-submit-btn');
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<div class="spinner-sm"></div> Đang lưu...';

  try {
    // Ensure type is set
    data.type = document.getElementById('ticket-type-select').value;

    if (maintenanceState.editingTicketId) {
      await API.maintenance.update(maintenanceState.editingTicketId, data);
    } else {
      await API.maintenance.create(data);
    }
    App.showToast('success', 'Thành công', maintenanceState.editingTicketId ? 'Cập nhật phiếu thành công' : 'Tạo phiếu thành công');
    App.closeModal('ticket-modal-overlay');
    loadTickets();
  } catch (err) {
    console.error('Ticket submit error:', err);
    throw err;
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

async function viewTicket(id) {
  try {
    const ticket = await API.maintenance.getById(id);
    maintenanceState.viewingTicketId = id;
    renderViewTicket(ticket);
    App.openModal('view-ticket-modal-overlay');
  } catch (err) {
    App.showToast('error', 'Lỗi', 'Không thể tải thông tin phiếu');
  }
}

function renderViewTicket(ticket) {
  const container = document.getElementById('view-ticket-content');
  const title = document.getElementById('view-ticket-modal-title');

  if (!container || !title) return;

  title.textContent = `${ticket.code} - ${ticket.device?.name || 'N/A'}`;

  const device = ticket.device || {};

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: var(--space-4); margin-bottom: var(--space-6);">
      <div>
        <p style="font-size: var(--text-xs); color: hsl(var(--color-text-muted)); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: var(--space-1);">Mã phiếu</p>
        <p style="font-weight: 600; font-size: var(--text-lg);">${App.escapeHtml(ticket.code)}</p>
      </div>
      <div>
        <p style="font-size: var(--text-xs); color: hsl(var(--color-text-muted)); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: var(--space-1);">Loại</p>
        <span class="badge badge-${ticket.type === 'maintenance' ? 'primary' : 'info'}">${typeLabels[ticket.type] || ticket.type}</span>
      </div>
      <div>
        <p style="font-size: var(--text-xs); color: hsl(var(--color-text-muted)); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: var(--space-1);">Trạng thái</p>
        <span class="badge badge-${statusColors[ticket.status] || 'secondary'}">${statusLabels[ticket.status] || ticket.status}</span>
      </div>
      <div>
        <p style="font-size: var(--text-xs); color: hsl(var(--color-text-muted)); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: var(--space-1);">Ưu tiên</p>
        <span class="badge badge-${priorityColors[ticket.priority] || 'secondary'}">${priorityLabels[ticket.priority] || ticket.priority}</span>
      </div>
      <div>
        <p style="font-size: var(--text-xs); color: hsl(var(--color-text-muted)); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: var(--space-1);">Thiết bị</p>
        <p style="font-weight: 500;">${App.escapeHtml(device.code)} - ${App.escapeHtml(device.name)}</p>
      </div>
      <div>
        <p style="font-size: var(--text-xs); color: hsl(var(--color-text-muted)); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: var(--space-1);">Serial Number</p>
        <p style="font-family: var(--font-mono);">${App.escapeHtml(device.serialNumber)}</p>
      </div>
      <div>
        <p style="font-size: var(--text-xs); color: hsl(var(--color-text-muted)); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: var(--space-1);">Người báo cáo</p>
        <p>${App.escapeHtml(ticket.reporter)}</p>
      </div>
      <div>
        <p style="font-size: var(--text-xs); color: hsl(var(--color-text-muted)); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: var(--space-1);">Kỹ thuật viên</p>
        <p>${App.escapeHtml(ticket.technicianName || 'Chưa gán')}</p>
      </div>
      <div>
        <p style="font-size: var(--text-xs); color: hsl(var(--color-text-muted)); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: var(--space-1);">Ngày tạo</p>
        <p>${App.formatDateTime(ticket.createdAt)}</p>
      </div>
      ${ticket.completedAt ? `
        <div>
          <p style="font-size: var(--text-xs); color: hsl(var(--color-text-muted)); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: var(--space-1);">Ngày hoàn thành</p>
          <p>${App.formatDate(ticket.completedAt)}</p>
        </div>
      ` : ''}
      ${ticket.cost ? `
        <div>
          <p style="font-size: var(--text-xs); color: hsl(var(--color-text-muted)); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: var(--space-1);">Chi phí</p>
          <p style="font-weight: 600;">${App.formatCurrency(ticket.cost)}</p>
        </div>
      ` : ''}
    </div>

    <div style="border-top: 1px solid hsl(var(--color-border)); padding-top: var(--space-6); margin-bottom: var(--space-6);">
      <h3 style="font-size: var(--text-base); font-weight: 600; margin-bottom: var(--space-3);">Mô tả lỗi / Yêu cầu</h3>
      <div style="white-space: pre-wrap; color: hsl(var(--color-text-secondary)); line-height: 1.7;">${App.escapeHtml(ticket.description)}</div>
    </div>

    ${ticket.solution ? `
      <div style="border-top: 1px solid hsl(var(--color-border)); padding-top: var(--space-6); margin-bottom: var(--space-6);">
        <h3 style="font-size: var(--text-base); font-weight: 600; margin-bottom: var(--space-3);">Giải pháp / Kết quả xử lý</h3>
        <div style="white-space: pre-wrap; color: hsl(var(--color-text-secondary)); line-height: 1.7;">${App.escapeHtml(ticket.solution)}</div>
      </div>
    ` : ''}

    ${ticket.internalNote ? `
      <div style="background: hsl(var(--color-bg-tertiary)); border-radius: var(--radius-lg); padding: var(--space-4);">
        <h3 style="font-size: var(--text-base); font-weight: 600; margin-bottom: var(--space-2);">Ghi chú nội bộ</h3>
        <div style="white-space: pre-wrap; color: hsl(var(--color-text-secondary)); font-size: var(--text-sm);">${App.escapeHtml(ticket.internalNote)}</div>
      </div>
    ` : ''}
  `;
}

function editTicket(id) {
  viewTicket(id); // Will open view modal, then user can click edit
  // Or directly open edit modal:
  // We'll load ticket data and open edit modal
  API.maintenance.getById(id).then(ticket => {
    App.closeModal('view-ticket-modal-overlay');
    openTicketModal(ticket);
  }).catch(err => {
    App.showToast('error', 'Lỗi', 'Không thể tải thông tin phiếu');
  });
}

function openStatusModal(id) {
  maintenanceState.statusTicketId = id;
  document.getElementById('status-ticket-id').value = id;
  document.getElementById('status-new-status').value = 'pending';
  document.getElementById('status-note').value = '';
  App.openModal('status-modal-overlay');
}

async function handleStatusSubmit() {
  const ticketId = document.getElementById('status-ticket-id').value;
  const status = document.getElementById('status-new-status').value;
  const note = document.getElementById('status-note').value;

  if (!ticketId || !status) return;

  const btn = document.getElementById('btn-status-submit');
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Đang cập nhật...';

  try {
    await API.maintenance.updateStatus(ticketId, status, note);
    App.showToast('success', 'Thành công', 'Cập nhật trạng thái thành công');
    App.closeModal('status-modal-overlay');
    loadTickets();
  } catch (err) {
    App.showToast('error', 'Lỗi', err.message || 'Không thể cập nhật trạng thái');
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

function confirmDeleteTicket(id) {
  if (confirm('Bạn có chắc chắn muốn xóa phiếu này? Hành động không thể hoàn tác.')) {
    deleteTicket(id);
  }
}

async function deleteTicket(id) {
  try {
    await API.maintenance.delete(id);
    App.showToast('success', 'Thành công', 'Xóa phiếu thành công');
    loadTickets();
  } catch (err) {
    App.showToast('error', 'Lỗi', err.message || 'Không thể xóa phiếu');
  }
}

async function exportTickets() {
  const btn = document.getElementById('btn-export-maintenance');
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner-sm"></div> Đang xuất...';

  try {
    const blob = await API.maintenance.exportReport({
      format: 'excel',
      search: maintenanceState.search,
      status: maintenanceState.status,
      type: maintenanceState.type,
      startDate: maintenanceState.dateFrom,
      endDate: maintenanceState.dateTo
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maintenance_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    App.showToast('success', 'Thành công', 'Xuất file Excel thành công');
  } catch (err) {
    App.showToast('error', 'Lỗi', 'Xuất file thất bại');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}
