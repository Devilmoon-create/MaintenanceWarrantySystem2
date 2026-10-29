/**
 * Reports Page - Báo cáo & Thống kê
 * Tương tự "Thống kê báo cáo doanh thu" + "Báo cáo cuối ngày"
 */
(function () {
  'use strict';

  function formatCurrency(n) { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n); }

  function renderKPIs() {
    document.getElementById('kpi-revenue').textContent = formatCurrency(45600000);
    document.getElementById('kpi-revenue-change').innerHTML = '<span style="color:hsl(var(--color-success));">↑ 12.5%</span> so với tháng trước';
    document.getElementById('kpi-completed').textContent = '47';
    document.getElementById('kpi-completed-change').innerHTML = '<span style="color:hsl(var(--color-success));">↑ 8%</span>';
    document.getElementById('kpi-avg-ticket').textContent = formatCurrency(970213);
    document.getElementById('kpi-parts-cost').textContent = formatCurrency(12300000);
  }

  function renderRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
        datasets: [
          { label: 'Doanh thu dịch vụ', data: [32, 28, 35, 38, 42, 40, 45, 48, 44, 50, 46, 52].map(n => n * 1000000), backgroundColor: 'hsla(215,90%,60%,0.7)', borderRadius: 6 },
          { label: 'Chi phí linh kiện', data: [8, 7, 10, 9, 12, 11, 13, 14, 12, 15, 13, 14].map(n => n * 1000000), backgroundColor: 'hsla(35,95%,55%,0.7)', borderRadius: 6 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
        scales: { y: { ticks: { callback: v => (v / 1000000) + 'M' } } }
      }
    });
  }

  function renderServiceTypeChart() {
    const ctx = document.getElementById('serviceTypeChart');
    if (!ctx) return;
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Bảo trì', 'Bảo hành', 'Sửa chữa', 'Kiểm tra ĐK'],
        datasets: [{ data: [35, 25, 30, 10], backgroundColor: ['hsl(215,90%,60%)', 'hsl(145,65%,45%)', 'hsl(35,95%,55%)', 'hsl(280,65%,55%)'] }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
  }

  function renderTopServices() {
    const container = document.getElementById('top-services-container');
    const services = [
      { name: 'Thay màn hình laptop', count: 28, revenue: 8400000 },
      { name: 'Vệ sinh laptop', count: 45, revenue: 4500000 },
      { name: 'Thay pin laptop', count: 22, revenue: 5500000 },
      { name: 'Nâng cấp RAM', count: 35, revenue: 5250000 },
      { name: 'Thay SSD', count: 30, revenue: 6000000 },
      { name: 'Sửa bàn phím', count: 18, revenue: 3600000 },
      { name: 'Thay adapter nguồn', count: 15, revenue: 2250000 },
      { name: 'Kiểm tra định kỳ server', count: 12, revenue: 7200000 },
    ];

    let html = `<div class="table-responsive"><table class="table"><thead><tr><th>#</th><th>Dịch vụ</th><th>Số lượt</th><th>Doanh thu</th><th>Tỷ lệ</th></tr></thead><tbody>`;
    const totalCount = services.reduce((s, sv) => s + sv.count, 0);
    services.forEach((sv, i) => {
      const pct = ((sv.count / totalCount) * 100).toFixed(1);
      html += `<tr>
        <td style="font-weight:700;color:hsl(var(--color-primary));">${i + 1}</td>
        <td><strong>${sv.name}</strong></td>
        <td style="text-align:center;">${sv.count}</td>
        <td style="font-weight:600;">${formatCurrency(sv.revenue)}</td>
        <td>
          <div style="display:flex;align-items:center;gap:var(--space-2);">
            <div style="flex:1;height:6px;background:hsl(var(--color-border));border-radius:3px;overflow:hidden;">
              <div style="width:${pct}%;height:100%;background:hsl(var(--color-primary));border-radius:3px;"></div>
            </div>
            <span style="font-size:var(--text-xs);width:40px;">${pct}%</span>
          </div>
        </td>
      </tr>`;
    });
    html += '</tbody></table></div>';
    container.innerHTML = html;
  }

  function initTabs() {
    document.querySelectorAll('[data-report-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-report-tab]').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        const tab = btn.dataset.reportTab;
        ['revenue', 'services', 'inventory', 'technicians'].forEach(t => {
          const panel = document.getElementById('tab-content-' + t);
          if (panel) panel.style.display = t === tab ? 'block' : 'none';
        });
      });
    });

    // Custom date range toggle
    const periodSelect = document.getElementById('report-period');
    if (periodSelect) {
      periodSelect.addEventListener('change', () => {
        document.getElementById('custom-date-range').style.display = periodSelect.value === 'custom' ? 'flex' : 'none';
      });
    }
  }

  function renderTechnicianPerformance() {
    const container = document.getElementById('technician-performance-container');
    const techs = [
      { name: 'Nguyễn Văn Kỹ', completed: 18, avgTime: '2.5 ngày', revenue: 15200000 },
      { name: 'Trần Minh Thuật', completed: 15, avgTime: '3.0 ngày', revenue: 12800000 },
      { name: 'Lê Hoàng Viên', completed: 12, avgTime: '2.0 ngày', revenue: 10500000 },
      { name: 'Phạm Đức Tiến', completed: 10, avgTime: '3.5 ngày', revenue: 8600000 },
    ];

    let html = `<div class="table-responsive"><table class="table"><thead><tr><th>Kỹ thuật viên</th><th>Phiếu hoàn thành</th><th>TG xử lý TB</th><th>Doanh thu mang lại</th></tr></thead><tbody>`;
    techs.forEach(t => {
      html += `<tr><td><strong>${t.name}</strong></td><td style="text-align:center;">${t.completed}</td><td style="text-align:center;">${t.avgTime}</td><td style="font-weight:600;color:hsl(var(--color-success));">${formatCurrency(t.revenue)}</td></tr>`;
    });
    html += '</tbody></table></div>';
    container.innerHTML = html;
  }

  function init() {
    renderKPIs();
    renderRevenueChart();
    renderServiceTypeChart();
    renderTopServices();
    renderTechnicianPerformance();
    initTabs();

    // Placeholder content for other tabs
    document.getElementById('avg-time-container').innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);"><div style="text-align:center;padding:var(--space-6);"><p style="font-size:var(--text-xs);color:hsl(var(--color-text-muted));">Bảo trì</p><p style="font-size:var(--text-2xl);font-weight:700;color:hsl(var(--color-primary));">2.3 ngày</p></div><div style="text-align:center;padding:var(--space-6);"><p style="font-size:var(--text-xs);color:hsl(var(--color-text-muted));">Bảo hành</p><p style="font-size:var(--text-2xl);font-weight:700;color:hsl(var(--color-success));">3.1 ngày</p></div><div style="text-align:center;padding:var(--space-6);"><p style="font-size:var(--text-xs);color:hsl(var(--color-text-muted));">Sửa chữa</p><p style="font-size:var(--text-2xl);font-weight:700;color:hsl(var(--color-warning));">1.8 ngày</p></div><div style="text-align:center;padding:var(--space-6);"><p style="font-size:var(--text-xs);color:hsl(var(--color-text-muted));">Kiểm tra ĐK</p><p style="font-size:var(--text-2xl);font-weight:700;color:hsl(280,65%,55%);">0.5 ngày</p></div></div>';

    document.getElementById('low-stock-container').innerHTML = '<div class="table-responsive"><table class="table"><thead><tr><th>Linh kiện</th><th>Tồn</th><th>Tối thiểu</th></tr></thead><tbody><tr><td>RAM DDR4 16GB Kingston</td><td style="color:hsl(var(--color-danger));font-weight:700;">2</td><td>3</td></tr><tr><td>Màn hình 15.6" FHD IPS</td><td style="color:hsl(var(--color-warning));font-weight:700;">4</td><td>3</td></tr><tr><td>Adapter nguồn Dell 65W</td><td style="color:hsl(var(--color-warning));font-weight:700;">6</td><td>3</td></tr></tbody></table></div>';

    document.getElementById('top-parts-container').innerHTML = '<div class="table-responsive"><table class="table"><thead><tr><th>Linh kiện</th><th>Sử dụng</th></tr></thead><tbody><tr><td>Keo tản nhiệt Arctic MX-4</td><td style="font-weight:700;">45 hộp</td></tr><tr><td>RAM DDR4 8GB Samsung</td><td style="font-weight:700;">32 chiếc</td></tr><tr><td>SSD NVMe 256GB Kingston</td><td style="font-weight:700;">28 chiếc</td></tr></tbody></table></div>';

    document.getElementById('technician-tickets-container').innerHTML = document.getElementById('technician-performance-container').innerHTML;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
