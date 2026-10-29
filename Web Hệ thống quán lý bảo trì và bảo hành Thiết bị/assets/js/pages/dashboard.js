/**
 * Dashboard Page Logic - Hệ thống quản lý Bảo Trì & Bảo Hành
 */

// Chart instances
let deviceChart = null;
let maintenanceChart = null;

// Page initialization
window.pageInit = async function() {
  // Check auth
  if (!API.auth.isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }

  // Load dashboard data
  await loadDashboardData();

  // Setup event listeners
  setupEventListeners();
};

async function loadDashboardData() {
  try {
    // Show loading skeletons
    showLoadingSkeletons();

    // Load all data in parallel
    const [overview, deviceStats, maintenanceChartData, recentActivity, alerts] = await Promise.allSettled([
      API.dashboard.getOverview(),
      API.dashboard.getDeviceStats(),
      API.dashboard.getMaintenanceChart(12),
      API.dashboard.getRecentActivity(10),
      API.dashboard.getAlerts()
    ]);

    // Render stats cards
    if (overview.status === 'fulfilled') {
      renderStatsCards(overview.value);
    }

    // Render device chart
    if (deviceStats.status === 'fulfilled') {
      renderDeviceChart(deviceStats.value);
    }

    // Render maintenance chart
    if (maintenanceChartData.status === 'fulfilled') {
      renderMaintenanceChart(maintenanceChartData.value);
    }

    // Render recent activity
    if (recentActivity.status === 'fulfilled') {
      renderRecentActivity(recentActivity.value);
    }

    // Render alerts
    if (alerts.status === 'fulfilled') {
      renderAlerts(alerts.value);
    }

  } catch (error) {
    console.error('Failed to load dashboard data:', error);
    App.showToast('error', 'Lỗi', 'Không thể tải dữ liệu dashboard');
  }
}

function showLoadingSkeletons() {
  const statsContainer = document.getElementById('stats-container');
  if (statsContainer) {
    statsContainer.innerHTML = Array(4).fill(0).map(() => `
      <div class="card stat-card">
        <div class="card-body">
          <div class="skeleton skeleton-title" style="width: 40%;"></div>
          <div class="skeleton skeleton-text" style="width: 100px; height: 2rem; margin-top: var(--space-3);"></div>
          <div class="skeleton skeleton-text" style="width: 60%; margin-top: var(--space-2);"></div>
        </div>
      </div>
    `).join('');
  }

  const activityContainer = document.getElementById('recent-activity-container');
  if (activityContainer) {
    activityContainer.innerHTML = Array(5).fill(0).map(() => `
      <div class="skeleton skeleton-text" style="margin-bottom: var(--space-3);"></div>
    `).join('');
  }

  const alertsContainer = document.getElementById('alerts-container');
  if (alertsContainer) {
    alertsContainer.innerHTML = Array(3).fill(0).map(() => `
      <div class="skeleton skeleton-text" style="margin-bottom: var(--space-3);"></div>
    `).join('');
  }
}

function renderStatsCards(data) {
  const container = document.getElementById('stats-container');
  if (!container) return;

  const stats = [
    {
      label: 'Tổng thiết bị',
      value: data.totalDevices || 0,
      icon: 'device',
      variant: 'primary',
      trend: { value: data.deviceTrend || 0, label: 'so với tháng trước' }
    },
    {
      label: 'Đang hoạt động',
      value: data.activeDevices || 0,
      icon: 'check',
      variant: 'success',
      trend: { value: data.activeTrend || 0, label: 'tăng' }
    },
    {
      label: 'Đang bảo trì',
      value: data.maintenanceDevices || 0,
      icon: 'wrench',
      variant: 'warning',
      trend: { value: data.maintenanceTrend || 0, label: 'đang xử lý' }
    },
    {
      label: 'Sắp hết bảo hành',
      value: data.expiringWarranty || 0,
      icon: 'alert',
      variant: 'danger',
      trend: { value: data.warrantyTrend || 0, label: 'cần chú ý' }
    }
  ];

  const icons = {
    device: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><path d="M8 21h8"></path><path d="M12 17v4"></path></svg>`,
    check: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    wrench: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`,
    alert: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`
  };

  container.innerHTML = stats.map(stat => `
    <div class="card stat-card ${stat.variant}">
      <div class="card-body">
        <div class="stat-card-header">
          <div class="stat-card-icon">${icons[stat.icon]}</div>
          ${stat.trend ? `
            <span class="stat-card-trend ${stat.trend.value >= 0 ? 'positive' : 'negative'}">
              ${stat.trend.value >= 0 ? '↑' : '↓'} ${Math.abs(stat.trend.value)}%
            </span>
          ` : ''}
        </div>
        <div class="stat-card-value">${formatNumber(stat.value)}</div>
        <div class="stat-card-label">${stat.label} <span style="font-weight: 400;">(${stat.trend?.label || ''})</span></div>
      </div>
    </div>
  `).join('');
}

function renderDeviceChart(data) {
  const ctx = document.getElementById('deviceChart');
  if (!ctx) return;

  const chartData = data || {
    labels: ['Hoạt động', 'Bảo trì', 'Hỏng', 'Hết bảo hành', 'Ngưng sử dụng'],
    datasets: [{
      data: [45, 12, 8, 15, 5],
      backgroundColor: [
        'hsl(var(--color-success))',
        'hsl(var(--color-warning))',
        'hsl(var(--color-danger))',
        'hsl(var(--color-info))',
        'hsl(var(--color-text-muted))'
      ],
      borderWidth: 0,
      hoverOffset: 8
    }]
  };

  if (deviceChart) {
    deviceChart.destroy();
  }

  deviceChart = new Chart(ctx, {
    type: 'doughnut',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 16,
            usePointStyle: true,
            pointStyle: 'circle',
            font: { size: 12, family: 'Inter' },
            color: 'hsl(var(--color-text-secondary))'
          }
        },
        tooltip: {
          backgroundColor: 'hsl(var(--color-bg-card))',
          titleColor: 'hsl(var(--color-text-primary))',
          bodyColor: 'hsl(var(--color-text-secondary))',
          borderColor: 'hsl(var(--color-border))',
          borderWidth: 1,
          padding: 12,
          displayColors: true,
          callbacks: {
            label: function(context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((context.raw / total) * 100).toFixed(1);
              return `${context.label}: ${context.raw} (${percentage}%)`;
            }
          }
        }
      }
    }
  });

  // Tab switching
  document.querySelectorAll('[data-chart]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-chart]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const type = btn.dataset.chart;
      if (deviceChart) {
        deviceChart.config.type = type === 'device-pie' ? 'doughnut' : 'bar';
        deviceChart.update();
      }
    });
  });
}

function renderMaintenanceChart(data) {
  const ctx = document.getElementById('maintenanceChart');
  if (!ctx) return;

  const chartData = data || {
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
    datasets: [
      {
        label: 'Bảo trì',
        data: [12, 19, 15, 25, 22, 18, 20, 24, 16, 14, 18, 21],
        borderColor: 'hsl(var(--color-primary))',
        backgroundColor: 'hsl(var(--color-primary) / 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Bảo hành',
        data: [8, 12, 10, 15, 14, 11, 13, 16, 9, 8, 11, 14],
        borderColor: 'hsl(var(--color-secondary))',
        backgroundColor: 'hsl(var(--color-secondary) / 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  if (maintenanceChart) {
    maintenanceChart.destroy();
  }

  maintenanceChart = new Chart(ctx, {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: {
          position: 'top',
          labels: { padding: 16, usePointStyle: true, font: { size: 12, family: 'Inter' }, color: 'hsl(var(--color-text-secondary))' }
        },
        tooltip: {
          backgroundColor: 'hsl(var(--color-bg-card))',
          titleColor: 'hsl(var(--color-text-primary))',
          bodyColor: 'hsl(var(--color-text-secondary))',
          borderColor: 'hsl(var(--color-border))',
          borderWidth: 1,
          padding: 12
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: 'hsl(var(--color-text-muted))', font: { size: 11 } }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'hsl(var(--color-border))' },
          ticks: { color: 'hsl(var(--color-text-muted))', font: { size: 11 }, stepSize: 5 }
        }
      }
    }
  });

  // Period selector
  const periodSelect = document.getElementById('maintenance-chart-period');
  if (periodSelect) {
    periodSelect.addEventListener('change', async (e) => {
      const months = parseInt(e.target.value);
      try {
        const newData = await API.dashboard.getMaintenanceChart(months);
        if (maintenanceChart && newData) {
          maintenanceChart.data.labels = newData.labels || chartData.labels;
          maintenanceChart.data.datasets[0].data = newData.maintenance || chartData.datasets[0].data;
          maintenanceChart.data.datasets[1].data = newData.warranty || chartData.datasets[1].data;
          maintenanceChart.update();
        }
      } catch (err) {
        console.error('Failed to load chart data:', err);
      }
    });
  }
}

function renderRecentActivity(activities) {
  const container = document.getElementById('recent-activity-container');
  if (!container) return;

  if (!activities || !activities.length) {
    container.innerHTML = `
      <div class="empty-state" style="padding: var(--space-6);">
        <p class="empty-state-title">Chưa có hoạt động</p>
        <p class="empty-state-message">Hoạt động gần đây sẽ hiển thị ở đây</p>
      </div>
    `;
    return;
  }

  const actionIcons = {
    create: { icon: 'plus', color: 'success', label: 'Tạo mới' },
    update: { icon: 'edit', color: 'primary', label: 'Cập nhật' },
    delete: { icon: 'trash', color: 'danger', label: 'Xóa' },
    status_change: { icon: 'refresh', color: 'warning', label: 'Đổi trạng thái' },
    assign: { icon: 'user', color: 'info', label: 'Gán nhân viên' }
  };

  container.innerHTML = activities.map(activity => {
    const action = actionIcons[activity.action] || actionIcons.update;
    const icons = {
      plus: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
      edit: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
      trash: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
      refresh: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>`,
      user: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`
    };

    return `
      <div style="display: flex; align-items: flex-start; gap: var(--space-3); padding: var(--space-3) 0; border-bottom: 1px solid hsl(var(--color-border) / 0.5);">
        <div class="stat-card-icon ${action.color}" style="width: 36px; height: 36px; border-radius: var(--radius-md); flex-shrink: 0;">
          ${icons[action.icon]}
        </div>
        <div style="flex: 1; min-width: 0;">
          <p style="font-weight: 500; color: hsl(var(--color-text-primary)); margin-bottom: 2px;">${App.escapeHtml(activity.description)}</p>
          <p style="font-size: var(--text-xs); color: hsl(var(--color-text-muted));">${App.formatRelativeTime(activity.createdAt)}</p>
        </div>
        <span class="badge badge-${action.color}" style="font-size: 10px;">${action.label}</span>
      </div>
    `;
  }).join('') + '<div style="padding-top: var(--space-2);"></div>';
}

function renderAlerts(alerts) {
  const container = document.getElementById('alerts-container');
  const countEl = document.getElementById('alert-count');
  if (!container) return;

  const allAlerts = [
    ...(alerts.expiringWarranty || []).map(a => ({ ...a, type: 'warranty', severity: 'warning' })),
    ...(alerts.overdueMaintenance || []).map(a => ({ ...a, type: 'maintenance', severity: 'danger' })),
    ...(alerts.lowStock || []).map(a => ({ ...a, type: 'stock', severity: 'info' }))
  ].slice(0, 10);

  if (countEl) {
    countEl.textContent = allAlerts.length;
  }

  if (!allAlerts.length) {
    container.innerHTML = `
      <div class="empty-state" style="padding: var(--space-6);">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 48px; height: 48px; color: hsl(var(--color-success));">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <p class="empty-state-title">Không có cảnh báo</p>
        <p class="empty-state-message">Tất cả thiết bị đang hoạt động bình thường</p>
      </div>
    `;
    return;
  }

  const typeIcons = {
    warranty: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
    maintenance: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`,
    stock: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`
  };

  const typeLabels = {
    warranty: 'Hết bảo hành',
    maintenance: 'Quá hạn bảo trì',
    stock: 'Thiếu vật tư'
  };

  container.innerHTML = allAlerts.map(alert => `
    <div style="display: flex; align-items: flex-start; gap: var(--space-3); padding: var(--space-3) 0; border-bottom: 1px solid hsl(var(--color-border) / 0.5);">
      <div class="badge badge-${alert.severity}" style="width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: var(--text-xs); padding: 0;">
        ${typeIcons[alert.type]}
      </div>
      <div style="flex: 1; min-width: 0;">
        <p style="font-weight: 500; color: hsl(var(--color-text-primary)); margin-bottom: 2px;">${App.escapeHtml(alert.deviceName || alert.title)}</p>
        <p style="font-size: var(--text-xs); color: hsl(var(--color-text-secondary));">${App.escapeHtml(alert.message)}</p>
        <p style="font-size: var(--text-xs); color: hsl(var(--color-text-muted)); margin-top: 2px;">
          <span class="badge badge-${alert.severity}" style="font-size: 9px; padding: 1px 6px;">${typeLabels[alert.type]}</span>
          ${alert.dueDate ? ` • Hạn: ${App.formatDate(alert.dueDate)}` : ''}
        </p>
      </div>
    </div>
  `).join('') + '<div style="padding-top: var(--space-2);"></div>';
}

function setupEventListeners() {
  // Quick action cards hover effect
  document.querySelectorAll('.quick-action').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-2px)';
      card.style.boxShadow = 'var(--shadow-lg)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  });
}

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}
