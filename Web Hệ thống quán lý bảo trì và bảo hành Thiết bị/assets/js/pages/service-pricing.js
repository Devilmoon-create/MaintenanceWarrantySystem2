/**
 * Service Pricing Page - Giá Dịch vụ
 * Tương tự "Quản lý giá bán" trong POS Admin
 */
(function () {
  'use strict';

  const DEMO_PRICING = [
    { id: 1, code: 'DV-001', name: 'Vệ sinh laptop toàn bộ', category: 'Laptop', price: 150000, unit: 'lần', isActive: true, description: 'Vệ sinh quạt, thay keo tản nhiệt, lau màn hình' },
    { id: 2, code: 'DV-002', name: 'Thay màn hình laptop', category: 'Laptop', price: 300000, unit: 'lần', isActive: true, description: 'Công thay màn hình (chưa bao gồm linh kiện)' },
    { id: 3, code: 'DV-003', name: 'Nâng cấp RAM', category: 'Laptop', price: 100000, unit: 'lần', isActive: true, description: 'Công lắp đặt RAM mới' },
    { id: 4, code: 'DV-004', name: 'Cài đặt HĐH Windows', category: 'Laptop', price: 200000, unit: 'lần', isActive: true, description: 'Cài Win 10/11 + driver + phần mềm cơ bản' },
    { id: 5, code: 'DV-005', name: 'Sửa chữa mainboard', category: 'Laptop', price: 500000, unit: 'lần', isActive: true, description: 'Kiểm tra, sửa lỗi mainboard' },
    { id: 6, code: 'DV-006', name: 'Bảo trì server (hợp đồng)', category: 'Máy chủ', price: 2000000, unit: 'hợp đồng', isActive: true, description: 'Bảo trì định kỳ 3 tháng/lần' },
    { id: 7, code: 'DV-007', name: 'Kiểm tra định kỳ thiết bị mạng', category: 'Thiết bị mạng', price: 300000, unit: 'thiết bị', isActive: true, description: 'Test connection, kiểm tra config, firmware update' },
    { id: 8, code: 'DV-008', name: 'Thay pin laptop', category: 'Laptop', price: 100000, unit: 'lần', isActive: true, description: 'Công thay pin (chưa bao gồm pin)' },
    { id: 9, code: 'DV-009', name: 'Recovery dữ liệu ổ cứng', category: 'Laptop', price: 800000, unit: 'lần', isActive: false, description: 'Khôi phục dữ liệu từ ổ hỏng (mức cơ bản)' },
    { id: 10, code: 'DV-010', name: 'Sửa máy in laser', category: 'Máy in', price: 250000, unit: 'lần', isActive: true, description: 'Kiểm tra, vệ sinh, sửa lỗi kẹt giấy, mờ chữ' },
  ];

  let pricing = [...DEMO_PRICING];

  function formatCurrency(n) { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n); }

  function renderTable(filtered) {
    const data = filtered || pricing;
    const container = document.getElementById('pricing-table-container');
    if (data.length === 0) { container.innerHTML = '<div class="card-body" style="text-align:center;padding:var(--space-12);"><p style="color:hsl(var(--color-text-muted));">Không có dịch vụ nào.</p></div>'; return; }

    let html = `<div class="table-responsive"><table class="table"><thead><tr>
      <th>Mã DV</th><th>Tên dịch vụ</th><th>Loại TB</th><th>Giá</th><th>Đơn vị</th><th>Trạng thái</th><th>Thao tác</th>
    </tr></thead><tbody>`;

    data.forEach(p => {
      const statusBadge = p.isActive ? '<span class="badge badge-success">Đang dùng</span>' : '<span class="badge badge-secondary">Ngưng</span>';
      html += `<tr>
        <td><code style="font-size:var(--text-xs);">${p.code}</code></td>
        <td><strong>${p.name}</strong><br><span style="font-size:var(--text-xs);color:hsl(var(--color-text-muted));">${p.description || ''}</span></td>
        <td><span class="badge badge-primary">${p.category}</span></td>
        <td style="font-weight:700;color:hsl(var(--color-success));">${formatCurrency(p.price)}</td>
        <td>${p.unit}</td>
        <td>${statusBadge}</td>
        <td><div class="flex gap-1">
          <button class="btn btn-ghost btn-sm" onclick="PricingPage.edit(${p.id})" title="Sửa"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
          <button class="btn btn-ghost btn-sm" onclick="PricingPage.delete(${p.id})" title="Xóa" style="color:hsl(var(--color-danger));"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
        </div></td>
      </tr>`;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
  }

  function init() {
    renderTable();

    const search = document.getElementById('pricing-search');
    if (search) { let t; search.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { const q = search.value.toLowerCase(); renderTable(pricing.filter(p => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q))); }, 300); }); }

    document.getElementById('btn-add-pricing')?.addEventListener('click', () => {
      document.getElementById('pricing-form').reset(); document.getElementById('pricing-id').value = '';
      document.getElementById('pricing-modal-title').textContent = 'Thêm giá dịch vụ';
      document.getElementById('pricing-modal-overlay').classList.add('active');
    });

    document.getElementById('pricing-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('pricing-id').value;
      const data = { name: document.getElementById('pricing-name').value, code: document.getElementById('pricing-code').value, price: Number(document.getElementById('pricing-price').value), unit: document.getElementById('pricing-unit').value, description: document.getElementById('pricing-description').value, isActive: document.getElementById('pricing-active').checked };
      if (id) { const idx = pricing.findIndex(p => p.id == id); if (idx > -1) pricing[idx] = { ...pricing[idx], ...data }; }
      else { pricing.push({ id: Math.max(...pricing.map(p => p.id)) + 1, ...data, category: 'Chung' }); }
      document.getElementById('pricing-modal-overlay').classList.remove('active');
      renderTable();
      if (typeof App !== 'undefined') App.showToast('Lưu thành công', 'success');
    });

    document.querySelectorAll('[data-modal-close]').forEach(b => b.addEventListener('click', () => b.closest('.modal-overlay').classList.remove('active')));
  }

  window.PricingPage = {
    edit(id) { const p = pricing.find(x => x.id === id); if (!p) return; document.getElementById('pricing-id').value = p.id; document.getElementById('pricing-name').value = p.name; document.getElementById('pricing-code').value = p.code; document.getElementById('pricing-price').value = p.price; document.getElementById('pricing-unit').value = p.unit; document.getElementById('pricing-description').value = p.description || ''; document.getElementById('pricing-active').checked = p.isActive; document.getElementById('pricing-modal-title').textContent = 'Chỉnh sửa giá dịch vụ'; document.getElementById('pricing-modal-overlay').classList.add('active'); },
    delete(id) { const p = pricing.find(x => x.id === id); if (p && confirm(`Xóa dịch vụ "${p.name}"?`)) { pricing = pricing.filter(x => x.id !== id); renderTable(); if (typeof App !== 'undefined') App.showToast('Đã xóa', 'success'); } }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
