/**
 * Settings Page - Cài đặt Hệ thống
 */
(function () {
  'use strict';

  function init() {
    // Settings tab navigation
    document.querySelectorAll('[data-settings-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-settings-tab]').forEach(b => {
          b.classList.remove('active');
          b.style.background = 'none';
          b.style.color = 'hsl(var(--color-text))';
        });
        btn.classList.add('active');
        btn.style.background = 'hsl(var(--color-primary-light))';
        btn.style.color = 'hsl(var(--color-primary))';
        btn.style.fontWeight = '600';

        const tab = btn.dataset.settingsTab;
        document.querySelectorAll('.settings-panel').forEach(panel => panel.style.display = 'none');
        const target = document.getElementById('settings-' + tab);
        if (target) target.style.display = 'block';
      });
    });

    // Set initial active state
    const firstBtn = document.querySelector('[data-settings-tab="general"]');
    if (firstBtn) {
      firstBtn.style.background = 'hsl(var(--color-primary-light))';
      firstBtn.style.color = 'hsl(var(--color-primary))';
      firstBtn.style.fontWeight = '600';
    }

    // General settings form
    document.getElementById('settings-general-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (typeof App !== 'undefined') App.showToast('Đã lưu cài đặt chung', 'success');
    });

    // Store settings form
    document.getElementById('settings-store-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (typeof App !== 'undefined') App.showToast('Đã lưu thông tin cửa hàng', 'success');
    });

    // Notification settings form
    document.getElementById('settings-notifications-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (typeof App !== 'undefined') App.showToast('Đã lưu cài đặt thông báo', 'success');
    });

    // Backup export
    document.getElementById('btn-backup-export')?.addEventListener('click', () => {
      if (typeof App !== 'undefined') App.showToast('Đang xuất dữ liệu backup... (demo)', 'info');
    });

    // Backup import
    document.getElementById('btn-backup-import')?.addEventListener('click', () => {
      if (typeof App !== 'undefined') App.showToast('Chức năng nhập backup (demo)', 'info');
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
