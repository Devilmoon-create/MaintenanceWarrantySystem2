/**
 * Customers Page - Quản lý Khách hàng
 * Kết nối với backend API: GET/POST/PUT/DELETE /api/customers
 */
(function () {
  'use strict';

  let customers = [];
  let currentPage = 1;
  let totalPages = 1;
  let totalCount = 0;
  const pageSize = 10;

  function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  }

  // Type mapping: backend uses int (1=Individual, 2=Company)
  const typeMap = { 1: 'individual', 2: 'company' };
  const typeMapReverse = { 'individual': 1, 'company': 2 };
  const typeLabels = { 1: 'Cá nhân', 2: 'Doanh nghiệp', individual: 'Cá nhân', company: 'Doanh nghiệp' };
  const typeBadge = { 1: 'primary', 2: 'info', individual: 'primary', company: 'info' };

  function renderStats() {
    const total = totalCount || customers.length;
    const companies = customers.filter(c => c.type === 2 || c.type === 'company').length;
    
    const totalEl = document.getElementById('stat-total-customers');
    const companyEl = document.getElementById('stat-company-customers');
    const ticketsEl = document.getElementById('stat-total-tickets');
    const revenueEl = document.getElementById('stat-total-revenue');

    if (totalEl) totalEl.textContent = total;
    if (companyEl) companyEl.textContent = companies;
    if (ticketsEl) ticketsEl.textContent = '-';
    if (revenueEl) revenueEl.textContent = '-';
  }

  function renderTable() {
    const container = document.getElementById('customers-table-container');
    if (!container) return;

    if (customers.length === 0) {
      container.innerHTML = `<div class="card-body" style="text-align:center;padding:var(--space-12);">
        <p style="color:hsl(var(--color-text-muted));">Không tìm thấy khách hàng nào.</p>
      </div>`;
      return;
    }

    let html = `<div class="table-responsive"><table class="table"><thead><tr>
      <th>Mã KH</th><th>Tên khách hàng</th><th>Loại</th><th>Điện thoại</th><th>Email</th><th>Địa chỉ</th><th>Thao tác</th>
    </tr></thead><tbody>`;

    customers.forEach(c => {
      const type = c.type;
      html += `<tr>
        <td><code style="font-size:var(--text-xs);">${c.code}</code></td>
        <td><strong>${App.escapeHtml(c.fullName)}</strong>
            ${c.companyName ? `<br><span style="font-size:var(--text-xs);color:hsl(var(--color-text-muted));">${App.escapeHtml(c.companyName)}</span>` : ''}
        </td>
        <td><span class="badge badge-${typeBadge[type] || 'secondary'}">${typeLabels[type] || type}</span></td>
        <td>${c.phone || '—'}</td>
        <td>${c.email || '—'}</td>
        <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;">${c.address || '—'}</td>
        <td>
          <div class="flex gap-1">
            <button class="btn btn-ghost btn-sm" onclick="CustomerPage.view(${c.id})" title="Xem chi tiết">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
            <button class="btn btn-ghost btn-sm" onclick="CustomerPage.edit(${c.id})" title="Chỉnh sửa">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="btn btn-ghost btn-sm" onclick="CustomerPage.delete(${c.id})" title="Xóa" style="color:hsl(var(--color-danger));">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      </tr>`;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;

    // Pagination
    const paginationEl = document.getElementById('customers-pagination');
    if (paginationEl && typeof App !== 'undefined' && App.renderPagination) {
      App.renderPagination(paginationEl, {
        currentPage,
        totalPages,
        totalItems: totalCount,
        onPageChange: (p) => { currentPage = p; loadCustomers(); }
      });
    }
  }

  async function loadCustomers() {
    const container = document.getElementById('customers-table-container');
    if (container && typeof App !== 'undefined') App.showLoading(container, 'skeleton');

    try {
      const search = (document.getElementById('customer-search')?.value || '').trim();
      const data = await API.customers.getList({ page: currentPage, pageSize, search });

      // Handle response format from backend: { items, totalCount, page, pageSize, totalPages }
      customers = data.items || data || [];
      totalCount = data.totalCount || customers.length;
      totalPages = data.totalPages || Math.ceil(totalCount / pageSize);

      renderStats();
      renderTable();
    } catch (err) {
      console.error('Failed to load customers:', err);
      if (typeof App !== 'undefined') App.showToast('error', 'Lỗi', 'Không thể tải danh sách khách hàng. Đang hiển thị dữ liệu mẫu.');
      customers = [];
      renderStats();
      renderTable();
    }
  }

  function filterCustomers() {
    currentPage = 1;
    loadCustomers();
  }

  function openModal(customer) {
    const overlay = document.getElementById('customer-modal-overlay');
    const title = document.getElementById('customer-modal-title');
    const form = document.getElementById('customer-form');
    if (!overlay || !form) return;
    form.reset();

    if (customer) {
      title.textContent = 'Chỉnh sửa khách hàng';
      document.getElementById('customer-id').value = customer.id;
      document.getElementById('customer-code').value = customer.code;
      document.getElementById('customer-name').value = customer.fullName || '';
      const typeValue = typeMap[customer.type] || customer.type;
      document.getElementById('customer-type-form').value = typeof customer.type === 'number' ? typeMap[customer.type] : customer.type;
      document.getElementById('customer-phone').value = customer.phone || '';
      document.getElementById('customer-email').value = customer.email || '';
      document.getElementById('customer-address').value = customer.address || '';
      const companyFields = document.getElementById('company-fields');
      if (customer.type === 2 || customer.type === 'company') {
        if (companyFields) companyFields.style.display = 'block';
        const taxEl = document.getElementById('customer-tax-code');
        const contactEl = document.getElementById('customer-contact-person');
        if (taxEl) taxEl.value = customer.taxCode || '';
        if (contactEl) contactEl.value = customer.companyName || '';
      } else {
        if (companyFields) companyFields.style.display = 'none';
      }
    } else {
      title.textContent = 'Thêm khách hàng mới';
      document.getElementById('customer-id').value = '';
      document.getElementById('customer-code').value = '';
    }

    overlay.classList.add('active');
  }

  // Init
  async function init() {
    await loadCustomers();

    // Search
    const searchInput = document.getElementById('customer-search');
    if (searchInput) {
      let timer;
      searchInput.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(filterCustomers, 300); });
    }
    const typeFilter = document.getElementById('filter-customer-type');
    if (typeFilter) typeFilter.addEventListener('change', filterCustomers);

    // Add button
    const addBtn = document.getElementById('btn-add-customer');
    if (addBtn) addBtn.addEventListener('click', () => openModal(null));

    // Type toggle company fields
    const typeSelect = document.getElementById('customer-type-form');
    if (typeSelect) {
      typeSelect.addEventListener('change', () => {
        const companyFields = document.getElementById('company-fields');
        if (companyFields) companyFields.style.display = typeSelect.value === 'company' ? 'block' : 'none';
      });
    }

    // Form submit — uses real API
    const form = document.getElementById('customer-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('customer-id').value;
        const typeFormValue = document.getElementById('customer-type-form').value;
        const data = {
          code: document.getElementById('customer-code').value || `KH-${Date.now().toString().slice(-4)}`,
          fullName: document.getElementById('customer-name').value,
          type: typeMapReverse[typeFormValue] || 1,
          phone: document.getElementById('customer-phone').value,
          email: document.getElementById('customer-email').value || '',
          address: document.getElementById('customer-address').value || '',
          taxCode: document.getElementById('customer-tax-code')?.value || null,
          companyName: document.getElementById('customer-contact-person')?.value || null,
          notes: null
        };

        try {
          if (id) {
            await API.customers.update(parseInt(id), data);
            if (typeof App !== 'undefined') App.showToast('success', 'Thành công', 'Cập nhật khách hàng thành công');
          } else {
            await API.customers.create(data);
            if (typeof App !== 'undefined') App.showToast('success', 'Thành công', 'Thêm khách hàng thành công');
          }

          document.getElementById('customer-modal-overlay').classList.remove('active');
          await loadCustomers();
        } catch (err) {
          console.error('Customer save error:', err);
          if (typeof App !== 'undefined') App.showToast('error', 'Lỗi', err.message || 'Không thể lưu khách hàng');
        }
      });
    }

    // Modal close
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.closest('.modal-overlay')?.classList.remove('active');
      });
    });
  }

  // Public API
  window.CustomerPage = {
    view: async function (id) {
      try {
        const c = await API.customers.getById(id);
        if (!c) return;
        const content = document.getElementById('view-customer-content');
        if (!content) return;
        content.innerHTML = `
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);">
            <div><p style="font-size:var(--text-xs);color:hsl(var(--color-text-muted));margin-bottom:2px;">Mã KH</p><p style="font-weight:600;">${c.code}</p></div>
            <div><p style="font-size:var(--text-xs);color:hsl(var(--color-text-muted));margin-bottom:2px;">Loại</p><p>${typeLabels[c.type] || c.type}</p></div>
            <div style="grid-column:span 2;"><p style="font-size:var(--text-xs);color:hsl(var(--color-text-muted));margin-bottom:2px;">Tên</p><p style="font-weight:600;font-size:var(--text-lg);">${App.escapeHtml(c.fullName)}</p></div>
            <div><p style="font-size:var(--text-xs);color:hsl(var(--color-text-muted));margin-bottom:2px;">Điện thoại</p><p>${c.phone || '—'}</p></div>
            <div><p style="font-size:var(--text-xs);color:hsl(var(--color-text-muted));margin-bottom:2px;">Email</p><p>${c.email || '—'}</p></div>
            <div style="grid-column:span 2;"><p style="font-size:var(--text-xs);color:hsl(var(--color-text-muted));margin-bottom:2px;">Địa chỉ</p><p>${c.address || '—'}</p></div>
            ${c.type === 2 ? `<div><p style="font-size:var(--text-xs);color:hsl(var(--color-text-muted));margin-bottom:2px;">MST</p><p>${c.taxCode || '—'}</p></div><div><p style="font-size:var(--text-xs);color:hsl(var(--color-text-muted));margin-bottom:2px;">Công ty</p><p>${c.companyName || '—'}</p></div>` : ''}
          </div>
          <div style="margin-top:var(--space-6);padding-top:var(--space-4);border-top:1px solid hsl(var(--color-border));">
            <p style="font-size:var(--text-xs);color:hsl(var(--color-text-muted));">Ngày tạo: ${App.formatDate(c.createdAt)}</p>
            ${c.notes ? `<p style="margin-top:var(--space-2);font-size:var(--text-sm);color:hsl(var(--color-text-secondary));">Ghi chú: ${App.escapeHtml(c.notes)}</p>` : ''}
          </div>`;
        document.getElementById('view-customer-modal-overlay')?.classList.add('active');
      } catch (err) {
        console.error('Failed to load customer:', err);
        if (typeof App !== 'undefined') App.showToast('error', 'Lỗi', 'Không thể tải thông tin khách hàng');
      }
    },
    edit: async function (id) {
      try {
        const c = await API.customers.getById(id);
        if (c) openModal(c);
      } catch (err) {
        if (typeof App !== 'undefined') App.showToast('error', 'Lỗi', 'Không thể tải thông tin khách hàng');
      }
    },
    delete: async function (id) {
      const c = customers.find(x => x.id === id);
      const name = c?.fullName || 'khách hàng này';
      if (!confirm(`Bạn có chắc muốn xóa khách hàng "${name}"?`)) return;
      
      try {
        await API.customers.delete(id);
        if (typeof App !== 'undefined') App.showToast('success', 'Thành công', 'Đã xóa khách hàng');
        await loadCustomers();
      } catch (err) {
        if (typeof App !== 'undefined') App.showToast('error', 'Lỗi', err.message || 'Không thể xóa khách hàng');
      }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
