/**
 * Service Invoices Page - Hóa đơn Dịch vụ
 * Tương tự "Quản lý hóa đơn xuất/nhập" trong POS Admin
 */
(function () {
  'use strict';

  const DEMO_INVOICES = [
    { id: 1, code: 'HD-2024-001', ticketCode: 'PT-001', customerName: 'Nguyễn Văn A', deviceName: 'Laptop Dell Latitude 5420', type: 'maintenance', laborCost: 200000, partsCost: 850000, total: 1050000, status: 'paid', paymentMethod: 'cash', createdAt: '2024-10-20', paidAt: '2024-10-20' },
    { id: 2, code: 'HD-2024-002', ticketCode: 'PT-002', customerName: 'Công ty TNHH ABC', deviceName: 'Máy chủ Dell PowerEdge R750', type: 'repair', laborCost: 500000, partsCost: 2200000, total: 2700000, status: 'paid', paymentMethod: 'transfer', createdAt: '2024-10-19', paidAt: '2024-10-21' },
    { id: 3, code: 'HD-2024-003', ticketCode: 'PT-003', customerName: 'Lê Văn C', deviceName: 'HP EliteBook 840 G7', type: 'warranty', laborCost: 0, partsCost: 0, total: 0, status: 'paid', paymentMethod: 'warranty', createdAt: '2024-10-18', paidAt: '2024-10-18' },
    { id: 4, code: 'HD-2024-004', ticketCode: 'PT-004', customerName: 'Đại học Bách Khoa', deviceName: 'Máy in HP LaserJet Pro M404dn', type: 'maintenance', laborCost: 150000, partsCost: 350000, total: 500000, status: 'unpaid', paymentMethod: null, createdAt: '2024-10-22', paidAt: null },
    { id: 5, code: 'HD-2024-005', ticketCode: 'PT-005', customerName: 'Trần Minh E', deviceName: 'Lenovo ThinkPad T14', type: 'repair', laborCost: 300000, partsCost: 1500000, total: 1800000, status: 'unpaid', paymentMethod: null, createdAt: '2024-10-23', paidAt: null },
    { id: 6, code: 'HD-2024-006', ticketCode: 'PT-006', customerName: 'Bệnh viện Nhân dân 115', deviceName: 'Server Lenovo ThinkSystem SR650', type: 'inspection', laborCost: 800000, partsCost: 0, total: 800000, status: 'paid', paymentMethod: 'transfer', createdAt: '2024-10-15', paidAt: '2024-10-17' },
    { id: 7, code: 'HD-2024-007', ticketCode: 'PT-007', customerName: 'Hoàng Thị G', deviceName: 'MacBook Pro 14 M3', type: 'repair', laborCost: 400000, partsCost: 3500000, total: 3900000, status: 'cancelled', paymentMethod: null, createdAt: '2024-10-10', paidAt: null },
  ];

  let invoices = [...DEMO_INVOICES];
  let currentTab = 'all';

  function formatCurrency(n) { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n); }

  const typeLabels = { maintenance: 'Bảo trì', warranty: 'Bảo hành', repair: 'Sửa chữa', inspection: 'Kiểm tra ĐK' };
  const statusLabels = { paid: 'Đã thanh toán', unpaid: 'Chưa thanh toán', cancelled: 'Đã hủy' };
  const statusBadges = { paid: 'success', unpaid: 'warning', cancelled: 'danger' };
  const paymentLabels = { cash: 'Tiền mặt', transfer: 'Chuyển khoản', warranty: 'Bảo hành', card: 'Thẻ' };

  function renderStats() {
    const paid = invoices.filter(i => i.status === 'paid');
    const unpaid = invoices.filter(i => i.status === 'unpaid');
    document.getElementById('stat-total-invoices').textContent = invoices.length;
    document.getElementById('stat-paid-invoices').textContent = paid.length;
    document.getElementById('stat-unpaid-invoices').textContent = unpaid.length;
    document.getElementById('stat-invoice-revenue').textContent = formatCurrency(paid.reduce((s, i) => s + i.total, 0));
  }

  function renderTable(filtered) {
    const data = filtered || getFilteredData();
    const container = document.getElementById('invoices-table-container');

    if (data.length === 0) {
      container.innerHTML = '<div class="card-body" style="text-align:center;padding:var(--space-12);"><p style="color:hsl(var(--color-text-muted));">Không có hóa đơn nào.</p></div>';
      return;
    }

    let html = `<div class="table-responsive"><table class="table"><thead><tr>
      <th>Mã HĐ</th><th>Mã phiếu</th><th>Khách hàng</th><th>Loại DV</th><th>Tổng tiền</th><th>Trạng thái</th><th>Thanh toán</th><th>Ngày tạo</th><th>Thao tác</th>
    </tr></thead><tbody>`;

    data.forEach(inv => {
      html += `<tr>
        <td><code style="font-size:var(--text-xs);">${inv.code}</code></td>
        <td><a href="maintenance.html" style="color:hsl(var(--color-primary));">${inv.ticketCode}</a></td>
        <td><strong>${inv.customerName}</strong><br><span style="font-size:var(--text-xs);color:hsl(var(--color-text-muted));">${inv.deviceName}</span></td>
        <td><span class="badge badge-primary">${typeLabels[inv.type] || inv.type}</span></td>
        <td style="font-weight:700;">${formatCurrency(inv.total)}</td>
        <td><span class="badge badge-${statusBadges[inv.status]}">${statusLabels[inv.status]}</span></td>
        <td>${inv.paymentMethod ? paymentLabels[inv.paymentMethod] : '—'}</td>
        <td>${inv.createdAt}</td>
        <td><div class="flex gap-1">
          <button class="btn btn-ghost btn-sm" onclick="InvoicePage.view(${inv.id})" title="Chi tiết">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </button>
          ${inv.status === 'unpaid' ? `<button class="btn btn-ghost btn-sm" onclick="InvoicePage.markPaid(${inv.id})" title="Thanh toán" style="color:hsl(var(--color-success));">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
          </button>` : ''}
        </div></td>
      </tr>`;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
  }

  function getFilteredData() {
    const search = (document.getElementById('invoice-search')?.value || '').toLowerCase();
    return invoices.filter(inv => {
      const matchTab = currentTab === 'all' || inv.status === currentTab;
      const matchSearch = !search || inv.code.toLowerCase().includes(search) || inv.customerName.toLowerCase().includes(search) || inv.ticketCode.toLowerCase().includes(search);
      return matchTab && matchSearch;
    });
  }

  function init() {
    renderStats();
    renderTable();

    // Tab switching
    document.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-tab]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTab = btn.dataset.tab;
        renderTable();
      });
    });

    // Search
    const search = document.getElementById('invoice-search');
    if (search) { let t; search.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => renderTable(), 300); }); }

    // Modal close
    document.querySelectorAll('[data-modal-close]').forEach(b => b.addEventListener('click', () => b.closest('.modal-overlay').classList.remove('active')));
  }

  window.InvoicePage = {
    view(id) {
      const inv = invoices.find(x => x.id === id);
      if (!inv) return;
      const content = document.getElementById('invoice-detail-content');
      content.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:var(--space-6);">
          <div><h3 style="font-size:var(--text-xl);font-weight:700;">${inv.code}</h3><p style="color:hsl(var(--color-text-muted));">Phiếu: ${inv.ticketCode}</p></div>
          <span class="badge badge-${statusBadges[inv.status]}" style="font-size:var(--text-sm);padding:var(--space-2) var(--space-4);">${statusLabels[inv.status]}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);margin-bottom:var(--space-6);">
          <div><p style="font-size:var(--text-xs);color:hsl(var(--color-text-muted));">Khách hàng</p><p style="font-weight:600;">${inv.customerName}</p></div>
          <div><p style="font-size:var(--text-xs);color:hsl(var(--color-text-muted));">Thiết bị</p><p>${inv.deviceName}</p></div>
          <div><p style="font-size:var(--text-xs);color:hsl(var(--color-text-muted));">Loại dịch vụ</p><p>${typeLabels[inv.type]}</p></div>
          <div><p style="font-size:var(--text-xs);color:hsl(var(--color-text-muted));">Ngày tạo</p><p>${inv.createdAt}</p></div>
        </div>
        <div style="background:hsl(var(--color-bg));padding:var(--space-4);border-radius:var(--radius-md);margin-bottom:var(--space-4);">
          <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-2);"><span>Chi phí nhân công</span><span>${formatCurrency(inv.laborCost)}</span></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-2);"><span>Chi phí linh kiện</span><span>${formatCurrency(inv.partsCost)}</span></div>
          <div style="display:flex;justify-content:space-between;font-weight:700;font-size:var(--text-lg);padding-top:var(--space-3);border-top:2px solid hsl(var(--color-border));"><span>TỔNG CỘNG</span><span style="color:hsl(var(--color-success));">${formatCurrency(inv.total)}</span></div>
        </div>
        ${inv.paidAt ? `<p style="font-size:var(--text-sm);color:hsl(var(--color-text-muted));">Thanh toán: ${paymentLabels[inv.paymentMethod] || '—'} — ${inv.paidAt}</p>` : ''}`;
      document.getElementById('invoice-detail-modal-overlay').classList.add('active');
    },
    markPaid(id) {
      const inv = invoices.find(x => x.id === id);
      if (inv && confirm(`Xác nhận thanh toán hóa đơn ${inv.code} — ${formatCurrency(inv.total)}?`)) {
        inv.status = 'paid';
        inv.paymentMethod = 'cash';
        inv.paidAt = new Date().toISOString().split('T')[0];
        renderStats();
        renderTable();
        if (typeof App !== 'undefined') App.showToast('Đã thanh toán thành công', 'success');
      }
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
