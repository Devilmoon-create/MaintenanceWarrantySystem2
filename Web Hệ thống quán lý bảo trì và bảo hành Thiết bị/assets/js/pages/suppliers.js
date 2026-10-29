/**
 * Suppliers Page - Quản lý Nhà cung cấp
 */
(function () {
  'use strict';

  const DEMO_SUPPLIERS = [
    { id: 1, code: 'NCC-001', name: 'Công ty TNHH Linh kiện Phong Vũ', phone: '0283456789', email: 'order@phongvu.vn', address: '123 Nguyễn Thị Minh Khai, Q.1, TP.HCM', taxCode: '0312345678', contactPerson: 'Nguyễn Phong', paymentTerms: '30days', totalOrders: 25, totalAmount: 150000000 },
    { id: 2, code: 'NCC-002', name: 'Dell Technologies Vietnam', phone: '0284567890', email: 'sales@dell.com.vn', address: '789 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM', taxCode: '0401234567', contactPerson: 'Trần Dell', paymentTerms: '60days', totalOrders: 10, totalAmount: 520000000 },
    { id: 3, code: 'NCC-003', name: 'HP Inc. Vietnam', phone: '0285678901', email: 'contact@hp.com.vn', address: '456 Lê Duẩn, Q.1, TP.HCM', taxCode: '0501234567', contactPerson: 'Lê HP', paymentTerms: '30days', totalOrders: 15, totalAmount: 280000000 },
    { id: 4, code: 'NCC-004', name: 'Cửa hàng linh kiện Thành Công', phone: '0901234568', email: 'thanhcong@gmail.com', address: '321 Lý Tự Trọng, Q.1, TP.HCM', taxCode: '0601234567', contactPerson: 'Phạm Thành', paymentTerms: 'immediate', totalOrders: 42, totalAmount: 85000000 },
    { id: 5, code: 'NCC-005', name: 'Lenovo Vietnam', phone: '0286789012', email: 'business@lenovo.vn', address: '147 Pasteur, Q.3, TP.HCM', taxCode: '0701234567', contactPerson: 'Hoàng Lenovo', paymentTerms: '60days', totalOrders: 8, totalAmount: 320000000 },
  ];

  let suppliers = [...DEMO_SUPPLIERS];
  let currentPage = 1;
  const pageSize = 10;

  function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }

  const paymentLabels = { immediate: 'Trả ngay', '15days': 'NET 15', '30days': 'NET 30', '60days': 'NET 60', custom: 'Thỏa thuận' };

  function renderTable(filtered) {
    const data = filtered || suppliers;
    const start = (currentPage - 1) * pageSize;
    const pageData = data.slice(start, start + pageSize);
    const container = document.getElementById('suppliers-table-container');

    if (data.length === 0) {
      container.innerHTML = `<div class="card-body" style="text-align:center;padding:var(--space-12);"><p style="color:hsl(var(--color-text-muted));">Không tìm thấy nhà cung cấp nào.</p></div>`;
      return;
    }

    let html = `<div class="table-responsive"><table class="table"><thead><tr>
      <th>Mã NCC</th><th>Tên nhà cung cấp</th><th>Liên hệ</th><th>Điện thoại</th><th>Thanh toán</th><th>Đơn nhập</th><th>Tổng giá trị</th><th>Thao tác</th>
    </tr></thead><tbody>`;

    pageData.forEach(s => {
      html += `<tr>
        <td><code style="font-size:var(--text-xs);">${s.code}</code></td>
        <td><strong>${s.name}</strong><br><span style="font-size:var(--text-xs);color:hsl(var(--color-text-muted));">MST: ${s.taxCode || '—'}</span></td>
        <td>${s.contactPerson || '—'}</td>
        <td>${s.phone}</td>
        <td><span class="badge badge-info">${paymentLabels[s.paymentTerms] || s.paymentTerms}</span></td>
        <td style="text-align:center;">${s.totalOrders}</td>
        <td style="font-weight:600;">${formatCurrency(s.totalAmount)}</td>
        <td>
          <div class="flex gap-1">
            <button class="btn btn-ghost btn-sm" onclick="SupplierPage.edit(${s.id})" title="Sửa">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="btn btn-ghost btn-sm" onclick="SupplierPage.delete(${s.id})" title="Xóa" style="color:hsl(var(--color-danger));">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      </tr>`;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
  }

  function filterSuppliers() {
    const search = (document.getElementById('supplier-search').value || '').toLowerCase();
    let filtered = suppliers.filter(s => !search || s.name.toLowerCase().includes(search) || s.code.toLowerCase().includes(search) || (s.taxCode && s.taxCode.includes(search)) || (s.contactPerson && s.contactPerson.toLowerCase().includes(search)));
    currentPage = 1;
    renderTable(filtered);
  }

  function openModal(supplier) {
    const overlay = document.getElementById('supplier-modal-overlay');
    const title = document.getElementById('supplier-modal-title');
    const form = document.getElementById('supplier-form');
    form.reset();

    if (supplier) {
      title.textContent = 'Chỉnh sửa nhà cung cấp';
      document.getElementById('supplier-id').value = supplier.id;
      document.getElementById('supplier-code').value = supplier.code;
      document.getElementById('supplier-name').value = supplier.name;
      document.getElementById('supplier-phone').value = supplier.phone;
      document.getElementById('supplier-email').value = supplier.email || '';
      document.getElementById('supplier-address').value = supplier.address || '';
      document.getElementById('supplier-tax-code').value = supplier.taxCode || '';
      document.getElementById('supplier-contact-person').value = supplier.contactPerson || '';
      document.getElementById('supplier-payment-terms').value = supplier.paymentTerms || 'immediate';
      document.getElementById('supplier-notes').value = supplier.notes || '';
    } else {
      title.textContent = 'Thêm nhà cung cấp';
    }
    overlay.classList.add('active');
  }

  function init() {
    renderTable();

    const searchInput = document.getElementById('supplier-search');
    if (searchInput) { let t; searchInput.addEventListener('input', () => { clearTimeout(t); t = setTimeout(filterSuppliers, 300); }); }

    const addBtn = document.getElementById('btn-add-supplier');
    if (addBtn) addBtn.addEventListener('click', () => openModal(null));

    const form = document.getElementById('supplier-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('supplier-id').value;
        const data = {
          name: document.getElementById('supplier-name').value,
          phone: document.getElementById('supplier-phone').value,
          email: document.getElementById('supplier-email').value,
          address: document.getElementById('supplier-address').value,
          taxCode: document.getElementById('supplier-tax-code').value,
          contactPerson: document.getElementById('supplier-contact-person').value,
          paymentTerms: document.getElementById('supplier-payment-terms').value,
        };

        if (id) {
          const idx = suppliers.findIndex(s => s.id == id);
          if (idx > -1) suppliers[idx] = { ...suppliers[idx], ...data };
          if (typeof App !== 'undefined') App.showToast('Cập nhật thành công', 'success');
        } else {
          const newId = Math.max(...suppliers.map(s => s.id)) + 1;
          suppliers.push({ id: newId, code: `NCC-${String(newId).padStart(3, '0')}`, ...data, totalOrders: 0, totalAmount: 0 });
          if (typeof App !== 'undefined') App.showToast('Thêm nhà cung cấp thành công', 'success');
        }

        document.getElementById('supplier-modal-overlay').classList.remove('active');
        renderTable();
      });
    }

    document.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', () => btn.closest('.modal-overlay').classList.remove('active'));
    });
  }

  window.SupplierPage = {
    edit: function (id) { const s = suppliers.find(x => x.id === id); if (s) openModal(s); },
    delete: function (id) {
      const s = suppliers.find(x => x.id === id);
      if (s && confirm(`Xóa nhà cung cấp "${s.name}"?`)) {
        suppliers = suppliers.filter(x => x.id !== id);
        renderTable();
        if (typeof App !== 'undefined') App.showToast('Đã xóa', 'success');
      }
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
