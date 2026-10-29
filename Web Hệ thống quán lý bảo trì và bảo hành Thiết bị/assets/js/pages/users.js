/**
 * Users Page - Quản lý Nhân viên
 * Kết nối với backend API: GET/POST/PUT/DELETE /api/users
 */
(function () {
  'use strict';

  let users = [];
  let currentPage = 1;
  let totalPages = 1;
  let totalCount = 0;
  const pageSize = 10;

  // Role mapping: backend uses int (1=Admin, 2=Manager, 3=Technician, 4=Customer)
  const roleLabels = { 1: 'Quản trị viên', 2: 'Quản lý', 3: 'Kỹ thuật viên', 4: 'Khách hàng' };
  const roleBadge = { 1: 'danger', 2: 'primary', 3: 'info', 4: 'success' };
  const roleMap = { admin: 1, manager: 2, technician: 3, customer: 4 };
  const roleMapReverse = { 1: 'admin', 2: 'manager', 3: 'technician', 4: 'customer' };

  function renderStats() {
    const totalEl = document.getElementById('stat-total-users');
    const techEl = document.getElementById('stat-total-technicians');
    const activeEl = document.getElementById('stat-active-users');
    const inactiveEl = document.getElementById('stat-inactive-users');

    if (totalEl) totalEl.textContent = totalCount || users.length;
    if (techEl) techEl.textContent = users.filter(u => u.role === 3).length;
    if (activeEl) activeEl.textContent = users.filter(u => u.isActive === true || u.isActive === 1).length;
    if (inactiveEl) inactiveEl.textContent = users.filter(u => u.isActive === false || u.isActive === 0).length;
  }

  function renderTable() {
    const container = document.getElementById('users-table-container');
    if (!container) return;

    if (users.length === 0) {
      container.innerHTML = '<div class="card-body" style="text-align:center;padding:var(--space-12);"><p style="color:hsl(var(--color-text-muted));">Không có nhân viên nào.</p></div>';
      return;
    }

    let html = `<div class="table-responsive"><table class="table"><thead><tr><th>ID</th><th>Họ tên</th><th>Email</th><th>Điện thoại</th><th>Vai trò</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>`;
    users.forEach(u => {
      const isActive = u.isActive === true || u.isActive === 1;
      const statusBadge = isActive ? '<span class="badge badge-success">Đang làm</span>' : '<span class="badge badge-secondary">Nghỉ việc</span>';
      const role = u.role;
      html += `<tr>
        <td><code style="font-size:var(--text-xs);">${u.id}</code></td>
        <td><div style="display:flex;align-items:center;gap:var(--space-3);"><div class="user-avatar" style="width:32px;height:32px;font-size:var(--text-xs);">${(u.fullName || u.username || '?').charAt(0)}</div><div><strong>${App.escapeHtml(u.fullName || '')}</strong><br><span style="font-size:var(--text-xs);color:hsl(var(--color-text-muted));">@${App.escapeHtml(u.username || '')}</span></div></div></td>
        <td>${App.escapeHtml(u.email || '')}</td><td>${u.phone || '—'}</td>
        <td><span class="badge badge-${roleBadge[role] || 'secondary'}">${roleLabels[role] || role}</span></td>
        <td>${statusBadge}</td>
        <td><div class="flex gap-1">
          <button class="btn btn-ghost btn-sm" onclick="UserPage.edit(${u.id})" title="Sửa"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
          <button class="btn btn-ghost btn-sm" onclick="UserPage.delete(${u.id})" title="Xóa" style="color:hsl(var(--color-danger));"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
        </div></td></tr>`;
    });
    html += '</tbody></table></div>';
    container.innerHTML = html;

    // Pagination
    const paginationEl = document.getElementById('users-pagination');
    if (paginationEl && typeof App !== 'undefined' && App.renderPagination) {
      App.renderPagination(paginationEl, {
        currentPage,
        totalPages,
        totalItems: totalCount,
        onPageChange: (p) => { currentPage = p; loadUsers(); }
      });
    }
  }

  async function loadUsers() {
    const container = document.getElementById('users-table-container');
    if (container && typeof App !== 'undefined') App.showLoading(container, 'skeleton');

    try {
      const search = (document.getElementById('user-search')?.value || '').trim();
      const roleFilter = document.getElementById('filter-user-role')?.value || '';
      const statusFilter = document.getElementById('filter-user-status')?.value || '';

      const params = { page: currentPage, limit: pageSize, search };
      if (roleFilter) params.role = roleMap[roleFilter] || roleFilter;
      if (statusFilter) params.status = statusFilter;

      const data = await API.users.getList(params);

      users = data.items || data || [];
      totalCount = data.totalCount || users.length;
      totalPages = data.totalPages || Math.ceil(totalCount / pageSize);

      renderStats();
      renderTable();
    } catch (err) {
      console.error('Failed to load users:', err);
      if (typeof App !== 'undefined') App.showToast('error', 'Lỗi', 'Không thể tải danh sách nhân viên');
      users = [];
      renderStats();
      renderTable();
    }
  }

  function filterUsers() {
    currentPage = 1;
    loadUsers();
  }

  async function init() {
    await loadUsers();

    const search = document.getElementById('user-search');
    if (search) { let t; search.addEventListener('input', () => { clearTimeout(t); t = setTimeout(filterUsers, 300); }); }
    document.getElementById('filter-user-role')?.addEventListener('change', filterUsers);
    document.getElementById('filter-user-status')?.addEventListener('change', filterUsers);

    document.getElementById('btn-add-user')?.addEventListener('click', () => {
      const form = document.getElementById('user-form');
      if (form) form.reset();
      const idEl = document.getElementById('user-id');
      if (idEl) idEl.value = '';
      const titleEl = document.getElementById('user-modal-title');
      if (titleEl) titleEl.textContent = 'Thêm nhân viên mới';
      const pwFields = document.getElementById('password-fields');
      if (pwFields) pwFields.style.display = 'flex';
      document.getElementById('user-modal-overlay')?.classList.add('active');
    });

    document.getElementById('user-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('user-id')?.value;
      
      try {
        if (id) {
          // Update user
          const updateData = {
            fullName: document.getElementById('user-fullname')?.value || '',
            email: document.getElementById('user-email-form')?.value || '',
            phone: document.getElementById('user-phone')?.value || '',
            role: roleMap[document.getElementById('user-role-form')?.value] || 3,
            isActive: (document.getElementById('user-status-form')?.value || 'active') === 'active'
          };
          await API.users.update(parseInt(id), updateData);
          if (typeof App !== 'undefined') App.showToast('success', 'Thành công', 'Cập nhật nhân viên thành công');
        } else {
          // Create user
          const createData = {
            username: document.getElementById('user-username')?.value || '',
            fullName: document.getElementById('user-fullname')?.value || '',
            email: document.getElementById('user-email-form')?.value || '',
            phone: document.getElementById('user-phone')?.value || '',
            password: document.getElementById('user-password')?.value || 'Password@123',
            role: roleMap[document.getElementById('user-role-form')?.value] || 3
          };
          await API.users.create(createData);
          if (typeof App !== 'undefined') App.showToast('success', 'Thành công', 'Thêm nhân viên thành công');
        }

        document.getElementById('user-modal-overlay')?.classList.remove('active');
        await loadUsers();
      } catch (err) {
        console.error('User save error:', err);
        if (typeof App !== 'undefined') App.showToast('error', 'Lỗi', err.message || 'Không thể lưu nhân viên');
      }
    });

    document.querySelectorAll('[data-modal-close]').forEach(b => b.addEventListener('click', () => b.closest('.modal-overlay')?.classList.remove('active')));
  }

  window.UserPage = {
    edit: async function(id) {
      try {
        const u = await API.users.getById(id);
        if (!u) return;
        const idEl = document.getElementById('user-id');
        if (idEl) idEl.value = u.id;
        const codeEl = document.getElementById('user-code');
        if (codeEl) codeEl.value = `NV-${String(u.id).padStart(3, '0')}`;
        const fullnameEl = document.getElementById('user-fullname');
        if (fullnameEl) fullnameEl.value = u.fullName || '';
        const emailEl = document.getElementById('user-email-form');
        if (emailEl) emailEl.value = u.email || '';
        const phoneEl = document.getElementById('user-phone');
        if (phoneEl) phoneEl.value = u.phone || '';
        const roleEl = document.getElementById('user-role-form');
        if (roleEl) roleEl.value = roleMapReverse[u.role] || 'technician';
        const statusEl = document.getElementById('user-status-form');
        if (statusEl) statusEl.value = (u.isActive === true || u.isActive === 1) ? 'active' : 'inactive';
        const usernameEl = document.getElementById('user-username');
        if (usernameEl) usernameEl.value = u.username || '';
        const pwFields = document.getElementById('password-fields');
        if (pwFields) pwFields.style.display = 'none';
        const titleEl = document.getElementById('user-modal-title');
        if (titleEl) titleEl.textContent = 'Chỉnh sửa nhân viên';
        document.getElementById('user-modal-overlay')?.classList.add('active');
      } catch (err) {
        if (typeof App !== 'undefined') App.showToast('error', 'Lỗi', 'Không thể tải thông tin nhân viên');
      }
    },
    delete: async function(id) {
      const u = users.find(x => x.id === id);
      if (!confirm(`Xóa nhân viên "${u?.fullName || 'này'}"?`)) return;
      try {
        await API.users.delete(id);
        if (typeof App !== 'undefined') App.showToast('success', 'Thành công', 'Đã xóa nhân viên');
        await loadUsers();
      } catch (err) {
        if (typeof App !== 'undefined') App.showToast('error', 'Lỗi', err.message || 'Không thể xóa nhân viên');
      }
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
