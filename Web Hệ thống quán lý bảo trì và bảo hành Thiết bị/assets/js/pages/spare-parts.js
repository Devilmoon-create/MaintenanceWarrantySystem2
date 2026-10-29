/**
 * Spare Parts Page - Kho Linh kiện & Vật tư
 * Tương tự "Quản lý kho" + "Quản lý sản phẩm" + "Thay đổi số lượng" trong POS
 */
(function () {
  'use strict';

  const DEMO_PARTS = [
    { id: 1, code: 'LK-001', name: 'RAM DDR4 8GB Samsung', category: 'RAM', model: 'M378A1K43CB2-CTD', unit: 'chiếc', costPrice: 650000, sellPrice: 850000, stock: 25, minStock: 5, supplier: 'Phong Vũ' },
    { id: 2, code: 'LK-002', name: 'SSD NVMe 256GB Kingston', category: 'Ổ cứng', model: 'SA2000M8/256G', unit: 'chiếc', costPrice: 780000, sellPrice: 1050000, stock: 18, minStock: 5, supplier: 'Phong Vũ' },
    { id: 3, code: 'LK-003', name: 'Pin Laptop Dell Latitude 5420', category: 'Pin', model: 'WY9DX', unit: 'chiếc', costPrice: 1200000, sellPrice: 1650000, stock: 8, minStock: 3, supplier: 'Dell Technologies' },
    { id: 4, code: 'LK-004', name: 'Bàn phím Laptop HP Elitebook 840', category: 'Bàn phím', model: 'L14378-001', unit: 'chiếc', costPrice: 580000, sellPrice: 850000, stock: 12, minStock: 5, supplier: 'HP Inc.' },
    { id: 5, code: 'LK-005', name: 'Màn hình 15.6" FHD IPS', category: 'Màn hình', model: 'NV156FHM-N61', unit: 'chiếc', costPrice: 1500000, sellPrice: 2200000, stock: 4, minStock: 3, supplier: 'Thành Công' },
    { id: 6, code: 'LK-006', name: 'Quạt tản nhiệt CPU Laptop', category: 'Tản nhiệt', model: 'Generic 5V', unit: 'chiếc', costPrice: 180000, sellPrice: 350000, stock: 30, minStock: 10, supplier: 'Thành Công' },
    { id: 7, code: 'LK-007', name: 'Keo tản nhiệt Arctic MX-4', category: 'Tản nhiệt', model: 'MX-4 4g', unit: 'hộp', costPrice: 120000, sellPrice: 200000, stock: 15, minStock: 5, supplier: 'Phong Vũ' },
    { id: 8, code: 'LK-008', name: 'Cáp SATA 3.0', category: 'Cáp/Dây', model: 'SATA III 6Gbps', unit: 'chiếc', costPrice: 25000, sellPrice: 50000, stock: 50, minStock: 20, supplier: 'Thành Công' },
    { id: 9, code: 'LK-009', name: 'Adapter nguồn Dell 65W', category: 'Adapter', model: 'HA65NM130', unit: 'chiếc', costPrice: 350000, sellPrice: 550000, stock: 6, minStock: 3, supplier: 'Dell Technologies' },
    { id: 10, code: 'LK-010', name: 'RAM DDR4 16GB Kingston', category: 'RAM', model: 'KVR26N19D8/16', unit: 'chiếc', costPrice: 1150000, sellPrice: 1500000, stock: 2, minStock: 3, supplier: 'Phong Vũ' },
  ];

  let parts = [...DEMO_PARTS];
  let currentPage = 1;
  const pageSize = 10;

  function formatCurrency(n) { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n); }

  function renderStats() {
    document.getElementById('stat-total-parts').textContent = parts.length;
    document.getElementById('stat-in-stock').textContent = parts.reduce((s, p) => s + p.stock, 0).toLocaleString('vi-VN');
    document.getElementById('stat-low-stock').textContent = parts.filter(p => p.stock <= p.minStock).length;
    document.getElementById('stat-inventory-value').textContent = formatCurrency(parts.reduce((s, p) => s + p.costPrice * p.stock, 0));
  }

  function getStockBadge(p) {
    if (p.stock === 0) return '<span class="badge badge-danger">Hết hàng</span>';
    if (p.stock <= p.minStock) return '<span class="badge badge-warning">Sắp hết</span>';
    return '<span class="badge badge-success">Còn hàng</span>';
  }

  function renderTable(filtered) {
    const data = filtered || parts;
    const start = (currentPage - 1) * pageSize;
    const pageData = data.slice(start, start + pageSize);
    const container = document.getElementById('parts-table-container');

    if (data.length === 0) {
      container.innerHTML = `<div class="card-body" style="text-align:center;padding:var(--space-12);"><p style="color:hsl(var(--color-text-muted));">Không tìm thấy linh kiện nào.</p></div>`;
      return;
    }

    let html = `<div class="table-responsive"><table class="table"><thead><tr>
      <th>Mã LK</th><th>Tên linh kiện</th><th>Danh mục</th><th>Giá nhập</th><th>Giá bán</th><th>Tồn kho</th><th>Trạng thái</th><th>Thao tác</th>
    </tr></thead><tbody>`;

    pageData.forEach(p => {
      html += `<tr>
        <td><code style="font-size:var(--text-xs);">${p.code}</code></td>
        <td><strong>${p.name}</strong><br><span style="font-size:var(--text-xs);color:hsl(var(--color-text-muted));">${p.model || ''}</span></td>
        <td><span class="badge badge-primary">${p.category}</span></td>
        <td>${formatCurrency(p.costPrice)}</td>
        <td style="font-weight:600;">${formatCurrency(p.sellPrice)}</td>
        <td style="text-align:center;font-weight:600;">${p.stock} ${p.unit}</td>
        <td>${getStockBadge(p)}</td>
        <td>
          <div class="flex gap-1">
            <button class="btn btn-ghost btn-sm" onclick="SparePartsPage.adjustStock(${p.id})" title="Điều chỉnh kho">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
            </button>
            <button class="btn btn-ghost btn-sm" onclick="SparePartsPage.edit(${p.id})" title="Sửa">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="btn btn-ghost btn-sm" onclick="SparePartsPage.delete(${p.id})" title="Xóa" style="color:hsl(var(--color-danger));">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      </tr>`;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
  }

  function filterParts() {
    const search = (document.getElementById('part-search').value || '').toLowerCase();
    const stockFilter = document.getElementById('filter-part-stock').value;

    let filtered = parts.filter(p => {
      const matchSearch = !search || p.name.toLowerCase().includes(search) || p.code.toLowerCase().includes(search) || (p.model && p.model.toLowerCase().includes(search));
      let matchStock = true;
      if (stockFilter === 'in_stock') matchStock = p.stock > p.minStock;
      else if (stockFilter === 'low_stock') matchStock = p.stock > 0 && p.stock <= p.minStock;
      else if (stockFilter === 'out_of_stock') matchStock = p.stock === 0;
      return matchSearch && matchStock;
    });
    currentPage = 1;
    renderTable(filtered);
  }

  function init() {
    renderStats();
    renderTable();

    const searchInput = document.getElementById('part-search');
    if (searchInput) { let t; searchInput.addEventListener('input', () => { clearTimeout(t); t = setTimeout(filterParts, 300); }); }
    const stockFilter = document.getElementById('filter-part-stock');
    if (stockFilter) stockFilter.addEventListener('change', filterParts);

    const addBtn = document.getElementById('btn-add-part');
    if (addBtn) addBtn.addEventListener('click', () => {
      const overlay = document.getElementById('part-modal-overlay');
      document.getElementById('part-modal-title').textContent = 'Thêm linh kiện mới';
      document.getElementById('part-form').reset();
      document.getElementById('part-id').value = '';
      overlay.classList.add('active');
    });

    const form = document.getElementById('part-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('part-id').value;
        const data = {
          name: document.getElementById('part-name').value,
          model: document.getElementById('part-model').value,
          unit: document.getElementById('part-unit').value,
          costPrice: Number(document.getElementById('part-cost-price').value) || 0,
          sellPrice: Number(document.getElementById('part-sell-price').value) || 0,
          minStock: Number(document.getElementById('part-min-stock').value) || 5,
        };

        if (id) {
          const idx = parts.findIndex(p => p.id == id);
          if (idx > -1) parts[idx] = { ...parts[idx], ...data };
          if (typeof App !== 'undefined') App.showToast('Cập nhật thành công', 'success');
        } else {
          const newId = Math.max(...parts.map(p => p.id)) + 1;
          parts.push({ id: newId, code: `LK-${String(newId).padStart(3, '0')}`, ...data, category: 'Chung', stock: Number(document.getElementById('part-initial-stock').value) || 0, supplier: '' });
          if (typeof App !== 'undefined') App.showToast('Thêm linh kiện thành công', 'success');
        }

        document.getElementById('part-modal-overlay').classList.remove('active');
        renderStats();
        renderTable();
      });
    }

    // Adjust stock confirm
    const adjustBtn = document.getElementById('btn-adjust-confirm');
    if (adjustBtn) {
      adjustBtn.addEventListener('click', () => {
        const id = Number(document.getElementById('adjust-part-id').value);
        const type = document.getElementById('adjust-type').value;
        const qty = Number(document.getElementById('adjust-quantity').value) || 0;
        const part = parts.find(p => p.id === id);
        if (!part || qty <= 0) return;

        if (type === 'add') part.stock += qty;
        else if (type === 'remove') part.stock = Math.max(0, part.stock - qty);
        else if (type === 'set') part.stock = qty;

        document.getElementById('stock-adjust-modal-overlay').classList.remove('active');
        renderStats();
        renderTable();
        if (typeof App !== 'undefined') App.showToast(`Đã điều chỉnh tồn kho: ${part.name}`, 'success');
      });
    }

    document.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', () => btn.closest('.modal-overlay').classList.remove('active'));
    });
  }

  window.SparePartsPage = {
    edit: function (id) {
      const p = parts.find(x => x.id === id);
      if (!p) return;
      document.getElementById('part-modal-title').textContent = 'Chỉnh sửa linh kiện';
      document.getElementById('part-id').value = p.id;
      document.getElementById('part-code').value = p.code;
      document.getElementById('part-name').value = p.name;
      document.getElementById('part-model').value = p.model || '';
      document.getElementById('part-unit').value = p.unit;
      document.getElementById('part-cost-price').value = p.costPrice;
      document.getElementById('part-sell-price').value = p.sellPrice;
      document.getElementById('part-min-stock').value = p.minStock;
      document.getElementById('part-modal-overlay').classList.add('active');
    },
    adjustStock: function (id) {
      const p = parts.find(x => x.id === id);
      if (!p) return;
      document.getElementById('adjust-part-id').value = p.id;
      document.getElementById('adjust-part-name').textContent = p.name;
      document.getElementById('adjust-current-stock').textContent = `${p.stock} ${p.unit}`;
      document.getElementById('adjust-type').value = 'add';
      document.getElementById('adjust-quantity').value = '';
      document.getElementById('adjust-reason').value = '';
      document.getElementById('stock-adjust-modal-overlay').classList.add('active');
    },
    delete: function (id) {
      const p = parts.find(x => x.id === id);
      if (p && confirm(`Xóa linh kiện "${p.name}"?`)) {
        parts = parts.filter(x => x.id !== id);
        renderStats();
        renderTable();
        if (typeof App !== 'undefined') App.showToast('Đã xóa', 'success');
      }
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
