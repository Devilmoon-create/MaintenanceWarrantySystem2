/**
 * Categories Page - Loại Thiết bị
 */
(function () {
  'use strict';

  const DEMO_CATEGORIES = [
    { id: 1, code: 'PC', name: 'Máy tính để bàn', description: 'Desktop PC, Workstation', deviceCount: 45, defaultWarrantyMonths: 24, maintenanceCycleMonths: 6 },
    { id: 2, code: 'LAPTOP', name: 'Laptop', description: 'Máy tính xách tay các loại', deviceCount: 120, defaultWarrantyMonths: 12, maintenanceCycleMonths: 6 },
    { id: 3, code: 'PRINTER', name: 'Máy in', description: 'Máy in laser, phun mực, 3D', deviceCount: 35, defaultWarrantyMonths: 12, maintenanceCycleMonths: 3 },
    { id: 4, code: 'SVR', name: 'Máy chủ (Server)', description: 'Server rack, tower, blade', deviceCount: 18, defaultWarrantyMonths: 36, maintenanceCycleMonths: 3 },
    { id: 5, code: 'NET', name: 'Thiết bị mạng', description: 'Switch, Router, Access Point, Firewall', deviceCount: 65, defaultWarrantyMonths: 24, maintenanceCycleMonths: 12 },
    { id: 6, code: 'MON', name: 'Màn hình', description: 'Monitor LCD, LED các kích thước', deviceCount: 80, defaultWarrantyMonths: 24, maintenanceCycleMonths: 12 },
    { id: 7, code: 'UPS', name: 'Bộ lưu điện (UPS)', description: 'UPS online, offline, line-interactive', deviceCount: 22, defaultWarrantyMonths: 12, maintenanceCycleMonths: 6 },
    { id: 8, code: 'PROJ', name: 'Máy chiếu', description: 'Projector DLP, LCD', deviceCount: 15, defaultWarrantyMonths: 12, maintenanceCycleMonths: 6 },
  ];

  let categories = [...DEMO_CATEGORIES];

  function renderTable(filtered) {
    const data = filtered || categories;
    const container = document.getElementById('categories-table-container');
    if (data.length === 0) { container.innerHTML = '<div class="card-body" style="text-align:center;padding:var(--space-12);"><p style="color:hsl(var(--color-text-muted));">Không có dữ liệu.</p></div>'; return; }

    let html = `<div class="table-responsive"><table class="table"><thead><tr><th>Mã</th><th>Tên loại</th><th>Mô tả</th><th>Số thiết bị</th><th>BH mặc định</th><th>Chu kỳ BT</th><th>Thao tác</th></tr></thead><tbody>`;
    data.forEach(c => {
      html += `<tr>
        <td><code>${c.code}</code></td><td><strong>${c.name}</strong></td><td style="color:hsl(var(--color-text-muted));font-size:var(--text-sm);">${c.description}</td>
        <td style="text-align:center;font-weight:600;">${c.deviceCount}</td><td>${c.defaultWarrantyMonths} tháng</td><td>${c.maintenanceCycleMonths} tháng</td>
        <td><div class="flex gap-1">
          <button class="btn btn-ghost btn-sm" onclick="CategoryPage.edit(${c.id})" title="Sửa"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
          <button class="btn btn-ghost btn-sm" onclick="CategoryPage.delete(${c.id})" title="Xóa" style="color:hsl(var(--color-danger));"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
        </div></td></tr>`;
    });
    html += '</tbody></table></div>';
    container.innerHTML = html;
  }

  function init() {
    renderTable();
    const search = document.getElementById('category-search');
    if (search) { let t; search.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { const q = search.value.toLowerCase(); renderTable(categories.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q))); }, 300); }); }

    document.getElementById('btn-add-category')?.addEventListener('click', () => {
      document.getElementById('category-form').reset(); document.getElementById('category-id').value = '';
      document.getElementById('category-modal-title').textContent = 'Thêm loại thiết bị';
      document.getElementById('category-modal-overlay').classList.add('active');
    });

    document.getElementById('category-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('category-id').value;
      const data = { name: document.getElementById('category-name').value, code: document.getElementById('category-code').value, description: document.getElementById('category-description').value, defaultWarrantyMonths: Number(document.getElementById('category-warranty-period').value), maintenanceCycleMonths: Number(document.getElementById('category-maintenance-period').value) };
      if (id) { const idx = categories.findIndex(c => c.id == id); if (idx > -1) categories[idx] = { ...categories[idx], ...data }; }
      else { categories.push({ id: Math.max(...categories.map(c => c.id)) + 1, ...data, deviceCount: 0 }); }
      document.getElementById('category-modal-overlay').classList.remove('active');
      renderTable();
      if (typeof App !== 'undefined') App.showToast('Lưu thành công', 'success');
    });

    document.querySelectorAll('[data-modal-close]').forEach(b => b.addEventListener('click', () => b.closest('.modal-overlay').classList.remove('active')));
  }

  window.CategoryPage = {
    edit(id) { const c = categories.find(x => x.id === id); if (!c) return; document.getElementById('category-id').value = c.id; document.getElementById('category-name').value = c.name; document.getElementById('category-code').value = c.code; document.getElementById('category-description').value = c.description || ''; document.getElementById('category-warranty-period').value = c.defaultWarrantyMonths; document.getElementById('category-maintenance-period').value = c.maintenanceCycleMonths; document.getElementById('category-modal-title').textContent = 'Chỉnh sửa loại thiết bị'; document.getElementById('category-modal-overlay').classList.add('active'); },
    delete(id) { const c = categories.find(x => x.id === id); if (c && confirm(`Xóa loại "${c.name}"?`)) { categories = categories.filter(x => x.id !== id); renderTable(); if (typeof App !== 'undefined') App.showToast('Đã xóa', 'success'); } }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
