/**
 * Devices Page Logic - Hệ thống quản lý Bảo Trì & Bảo Hành
 */

let devicesState = {
  currentPage: 1,
  pageSize: 10,
  search: '',
  status: '',
  categoryId: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  totalItems: 0,
  totalPages: 0,
  categories: [],
  editingDeviceId: null,
  deletingDeviceId: null
};

window.pageInit = async function() {
  if (!API.auth.isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }

  // Load categories for filter and form
  await loadCategories();

  // Setup event listeners
  setupEventListeners();

  // Load initial data
  await loadDevices();
};

async function loadCategories() {
  try {
    const data = await API.devices.getCategories();
    devicesState.categories = data.items || data || [];

    // Populate filter dropdown
    const filterSelect = document.getElementById('filter-category');
    if (filterSelect) {
      filterSelect.innerHTML = '<option value="">Tất cả danh mục</option>' +
        devicesState.categories.map(c => `<option value="${c.id}">${App.escapeHtml(c.name)}</option>`).join('');
    }

    // Populate form dropdown
    const formSelect = document.getElementById('device-category');
    if (formSelect) {
      formSelect.innerHTML = '<option value="">Chọn danh mục</option>' +
        devicesState.categories.map(c => `<option value="${c.id}">${App.escapeHtml(c.name)}</option>`).join('');
    }
  } catch (err) {
    console.error('Failed to load categories:', err);
  }
}

async function loadDevices() {
  const container = document.getElementById('devices-table-container');
  App.showLoading(container, 'skeleton');

  try {
    const params = {
      page: devicesState.currentPage,
      limit: devicesState.pageSize,
      search: devicesState.search,
      status: devicesState.status,
      categoryId: devicesState.categoryId,
      sortBy: devicesState.sortBy,
      sortOrder: devicesState.sortOrder
    };

    const data = await API.devices.getList(params);
    devicesState.totalItems = data.total || 0;
    devicesState.totalPages = data.totalPages || 1;

    renderDevicesTable(data.items || data);
    renderPagination();
  } catch (err) {
    console.error('Failed to load devices:', err);
    App.showToast('error', 'Lỗi', 'Không thể tải danh sách thiết bị');
    renderDevicesTable([]);
  }
}

function renderDevicesTable(devices) {
  const container = document.getElementById('devices-table-container');
  if (!container) return;

  const columns = [
    { field: 'code', label: 'Mã thiết bị', minWidth: '120px' },
    { field: 'name', label: 'Tên thiết bị', minWidth: '200px' },
    { field: 'serialNumber', label: 'Serial Number', minWidth: '150px' },
    { field: 'category.name', label: 'Danh mục', minWidth: '130px' },
    { field: 'location', label: 'Vị trí', minWidth: '120px' },
    { field: 'warrantyExpiry', label: 'Hết bảo hành', type: 'date', minWidth: '120px' },
    { field: 'status', label: 'Trạng thái', type: 'badge', badgeVariant: getStatusBadgeVariant, minWidth: '130px' }
  ];

  const actions = [
    {
      name: 'view',
      label: 'Xem chi tiết',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
      handler: (id) => viewDevice(id)
    },
    {
      name: 'edit',
      label: 'Chỉnh sửa',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
      handler: (id) => editDevice(id)
    },
    {
      name: 'delete',
      label: 'Xóa',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
      handler: (id) => confirmDeleteDevice(id)
    }
  ];

  App.renderTable(container, {
    columns,
    data: devices,
    keyField: 'id',
    actions,
    emptyMessage: 'Chưa có thiết bị nào. Nhấn "Thêm thiết bị" để bắt đầu.',
    rowClick: (id) => viewDevice(id)
  });
}

function getStatusBadgeVariant(status) {
  const variants = {
    active: 'success',
    maintenance: 'warning',
    broken: 'danger',
    warranty_expired: 'info',
    inactive: 'secondary'
  };
  return variants[status] || 'secondary';
}

function getStatusLabel(status) {
  const labels = {
    active: 'Hoạt động',
    maintenance: 'Đang bảo trì',
    broken: 'Hỏng',
    warranty_expired: 'Hết bảo hành',
    inactive: 'Ngưng sử dụng'
  };
  return labels[status] || status;
}

function renderPagination() {
  const container = document.getElementById('devices-pagination');
  if (!container) return;

  App.renderPagination(container, {
    currentPage: devicesState.currentPage,
    totalPages: devicesState.totalPages,
    totalItems: devicesState.totalItems,
    onPageChange: (page) => {
      devicesState.currentPage = page;
      loadDevices();
    }
  });
}

function setupEventListeners() {
  // Search
  App.bindSearch('device-search', (value) => {
    devicesState.search = value;
    devicesState.currentPage = 1;
    loadDevices();
  }, 300);

  // Filter status
  const filterStatus = document.getElementById('filter-status');
  if (filterStatus) {
    filterStatus.addEventListener('change', (e) => {
      devicesState.status = e.target.value;
      devicesState.currentPage = 1;
      loadDevices();
    });
  }

  // Filter category
  const filterCategory = document.getElementById('filter-category');
  if (filterCategory) {
    filterCategory.addEventListener('change', (e) => {
      devicesState.categoryId = e.target.value;
      devicesState.currentPage = 1;
      loadDevices();
    });
  }

  // Add device button
  const btnAdd = document.getElementById('btn-add-device');
  if (btnAdd) {
    btnAdd.addEventListener('click', (e) => {
      e.preventDefault();
      openDeviceModal();
    });
  }

  // Export button
  const btnExport = document.getElementById('btn-export-devices');
  if (btnExport) {
    btnExport.addEventListener('click', exportDevices);
  }

  // Import button
  const btnImport = document.getElementById('btn-import-devices');
  if (btnImport) {
    btnImport.addEventListener('click', () => openImportModal());
  }

  // Device form submit
  const deviceForm = document.getElementById('device-form');
  if (deviceForm) {
    App.bindForm('device-form', handleDeviceSubmit, {
      closeModal: 'device-modal-overlay',
      successMessage: devicesState.editingDeviceId ? 'Cập nhật thiết bị thành công' : 'Thêm thiết bị thành công',
      onSuccess: () => {
        devicesState.editingDeviceId = null;
        loadDevices();
      }
    });
  }

  // Import form
  const btnImportSubmit = document.getElementById('btn-import-submit');
  if (btnImportSubmit) {
    btnImportSubmit.addEventListener('click', handleImportSubmit);
  }

  // Delete confirm
  const btnDeleteConfirm = document.getElementById('btn-delete-confirm');
  if (btnDeleteConfirm) {
    btnDeleteConfirm.addEventListener('click', executeDeleteDevice);
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

function openDeviceModal(device = null) {
  devicesState.editingDeviceId = device?.id || null;

  const modalTitle = document.getElementById('device-modal-title');
  const submitBtn = document.getElementById('device-submit-btn');
  const codeInput = document.getElementById('device-code');

  if (device) {
    modalTitle.textContent = 'Chỉnh sửa thiết bị';
    submitBtn.querySelector('.btn-text').textContent = 'Cập nhật';
    codeInput.removeAttribute('readonly');
    App.populateForm('device-form', device);
  } else {
    modalTitle.textContent = 'Thêm thiết bị mới';
    submitBtn.querySelector('.btn-text').textContent = 'Lưu thiết bị';
    codeInput.setAttribute('readonly', true);
    codeInput.value = '';
    App.clearForm('device-form');
    // Set default status
    document.getElementById('device-status').value = 'active';
  }

  App.openModal('device-modal-overlay');
}

async function handleDeviceSubmit(data, form) {
  const submitBtn = document.getElementById('device-submit-btn');
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<div class="spinner-sm"></div> Đang lưu...';

  try {
    if (devicesState.editingDeviceId) {
      await API.devices.update(devicesState.editingDeviceId, data);
    } else {
      await API.devices.create(data);
    }
    App.showToast('success', 'Thành công', devicesState.editingDeviceId ? 'Cập nhật thiết bị thành công' : 'Thêm thiết bị thành công');
    App.closeModal('device-modal-overlay');
    loadDevices();
  } catch (err) {
    console.error('Device submit error:', err);
    throw err;
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

async function viewDevice(id) {
  try {
    const device = await API.devices.getById(id);
    openDeviceModal(device);
  } catch (err) {
    App.showToast('error', 'Lỗi', 'Không thể tải thông tin thiết bị');
  }
}

function editDevice(id) {
  viewDevice(id);
}

function confirmDeleteDevice(id) {
  devicesState.deletingDeviceId = id;
  // Get device name for confirmation
  const row = document.querySelector(`#devices-table-container tbody tr[data-id="${id}"]`);
  const name = row?.querySelector('td:nth-child(2)')?.textContent || 'thiết bị này';
  document.getElementById('delete-device-name').textContent = name;
  App.openModal('delete-modal-overlay');
}

async function executeDeleteDevice() {
  if (!devicesState.deletingDeviceId) return;

  const btn = document.getElementById('btn-delete-confirm');
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Đang xóa...';

  try {
    await API.devices.delete(devicesState.deletingDeviceId);
    App.showToast('success', 'Thành công', 'Xóa thiết bị thành công');
    App.closeModal('delete-modal-overlay');
    devicesState.deletingDeviceId = null;
    loadDevices();
  } catch (err) {
    App.showToast('error', 'Lỗi', err.message || 'Không thể xóa thiết bị');
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

function openImportModal() {
  App.clearForm('import-form'); // if form exists
  document.getElementById('import-file').value = '';
  App.openModal('import-modal-overlay');
}

async function handleImportSubmit() {
  const fileInput = document.getElementById('import-file');
  const file = fileInput.files[0];

  if (!file) {
    App.showToast('warning', 'Cảnh báo', 'Vui lòng chọn file Excel');
    return;
  }

  const skipHeader = document.getElementById('import-skip-header').checked;
  const updateExisting = document.getElementById('import-update-existing').checked;

  const btn = document.getElementById('btn-import-submit');
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Đang nhập...';

  try {
    const result = await API.devices.importFromExcel(file);
    App.showToast('success', 'Thành công', `Đã nhập ${result.imported || 0} thiết bị${result.updated ? `, cập nhật ${result.updated}` : ''}${result.errors ? `, ${result.errors} lỗi` : ''}`);
    App.closeModal('import-modal-overlay');
    loadDevices();
  } catch (err) {
    App.showToast('error', 'Lỗi', err.message || 'Nhập dữ liệu thất bại');
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

async function exportDevices() {
  const btn = document.getElementById('btn-export-devices');
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner-sm"></div> Đang xuất...';

  try {
    const blob = await API.devices.exportReport({
      format: 'excel',
      search: devicesState.search,
      status: devicesState.status,
      categoryId: devicesState.categoryId
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devices_${new Date().toISOString().split('T')[0]}.xlsx`;
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
