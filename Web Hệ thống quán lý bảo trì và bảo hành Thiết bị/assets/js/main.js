/**
 * Main Application - Hệ thống quản lý Bảo Trì & Bảo Hành
 * Core UI logic, state management, components
 */

const App = (function() {
  'use strict';

  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const state = {
    sidebarCollapsed: false,
    theme: 'light',
    currentPage: '',
    user: null,
    notifications: [],
    unreadCount: 0
  };

  // ========================================
  // DOM ELEMENTS CACHE
  // ========================================
  const elements = {};

  function cacheElements() {
    elements.sidebar = document.querySelector('.sidebar');
    elements.mainContent = document.querySelector('.main-content');
    elements.sidebarToggle = document.querySelector('.sidebar-toggle');
    elements.sidebarOverlay = document.querySelector('.sidebar-overlay');
    elements.themeToggle = document.querySelector('.theme-toggle');
    elements.searchInput = document.querySelector('.search-box input');
    elements.notificationBtn = document.querySelector('.notification-btn');
    elements.notificationBadge = document.querySelector('.notification-badge');
    elements.toastContainer = document.getElementById('toast-container');
    elements.pageContent = document.querySelector('.page-content');
  }

  // ========================================
  // INITIALIZATION
  // ========================================
  function init() {
    cacheElements();
    loadTheme();
    loadSidebarState();
    bindEvents();
    initPage();
    checkAuth();
    startNotificationPolling();
  }

  function checkAuth() {
    // Skip auth check for login page
    if (window.location.pathname.includes('login.html')) return;

    if (!API.auth.isAuthenticated()) {
      window.location.href = 'login.html';
      return;
    }

    // Load user profile
    API.auth.getProfile()
      .then(user => {
        state.user = user;
        updateUserInfo(user);
      })
      .catch(err => {
        console.error('Failed to load profile:', err);
        showToast('error', 'Lỗi', 'Không thể tải thông tin người dùng');
      });
  }

  function updateUserInfo(user) {
    const nameEl = document.querySelector('.user-name');
    const roleEl = document.querySelector('.user-role');
    const avatarEl = document.querySelector('.user-avatar');

    if (nameEl) nameEl.textContent = user.fullName || user.username;
    if (roleEl) roleEl.textContent = user.roleName || user.role;
    if (avatarEl && user.fullName) {
      avatarEl.textContent = user.fullName.charAt(0).toUpperCase();
    }
  }

  // ========================================
  // EVENT BINDING
  // ========================================
  function bindEvents() {
    // Sidebar toggle
    if (elements.sidebarToggle) {
      elements.sidebarToggle.addEventListener('click', toggleSidebar);
    }

    // Sidebar overlay (mobile)
    if (elements.sidebarOverlay) {
      elements.sidebarOverlay.addEventListener('click', closeSidebarMobile);
    }

    // Theme toggle
    if (elements.themeToggle) {
      elements.themeToggle.addEventListener('click', toggleTheme);
    }

    // Notification dropdown
    if (elements.notificationBtn) {
      elements.notificationBtn.addEventListener('click', toggleNotificationDropdown);
    }

    // Close dropdowns on outside click
    document.addEventListener('click', handleOutsideClick);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);

    // Window resize
    window.addEventListener('resize', handleResize);

    // Logout button
    const logoutBtn = document.querySelector('[data-action="logout"]');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }
  }

  function handleOutsideClick(e) {
    // Close notification dropdown
    const notifDropdown = document.querySelector('.notification-dropdown');
    if (notifDropdown && !elements.notificationBtn?.contains(e.target) && !notifDropdown.contains(e.target)) {
      notifDropdown.classList.remove('active');
    }

    // Close user dropdown
    const userDropdown = document.querySelector('.user-dropdown');
    if (userDropdown && !e.target.closest('.user-info') && !userDropdown.contains(e.target)) {
      userDropdown.remove();
    }
  }

  function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + K: Focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      elements.searchInput?.focus();
    }

    // Escape: Close modals, dropdowns
    if (e.key === 'Escape') {
      closeAllModals();
      document.querySelectorAll('.dropdown.active').forEach(d => d.classList.remove('active'));
    }

    // Ctrl/Cmd + B: Toggle sidebar
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      toggleSidebar();
    }
  }

  function handleResize() {
    if (window.innerWidth > 1024) {
      closeSidebarMobile();
    }
  }

  // ========================================
  // SIDEBAR
  // ========================================
  function toggleSidebar() {
    if (window.innerWidth <= 1024) {
      elements.sidebar.classList.toggle('open');
      elements.sidebarOverlay.classList.toggle('active');
    } else {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      elements.sidebar.classList.toggle('collapsed', state.sidebarCollapsed);
      saveSidebarState();
    }
  }

  function closeSidebarMobile() {
    elements.sidebar.classList.remove('open');
    elements.sidebarOverlay.classList.remove('active');
  }

  function saveSidebarState() {
    localStorage.setItem('sidebar_collapsed', state.sidebarCollapsed);
  }

  function loadSidebarState() {
    const saved = localStorage.getItem('sidebar_collapsed');
    if (saved !== null) {
      state.sidebarCollapsed = saved === 'true';
      elements.sidebar?.classList.toggle('collapsed', state.sidebarCollapsed);
    }
  }

  // ========================================
  // THEME
  // ========================================
  function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    applyTheme();
    saveTheme();
    updateThemeIcon();
  }

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
  }

  function saveTheme() {
    localStorage.setItem('theme', state.theme);
  }

  function loadTheme() {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    state.theme = saved || (prefersDark ? 'dark' : 'light');
    applyTheme();
    updateThemeIcon();
  }

  function updateThemeIcon() {
    const sunIcon = elements.themeToggle?.querySelector('.sun-icon');
    const moonIcon = elements.themeToggle?.querySelector('.moon-icon');

    if (sunIcon && moonIcon) {
      if (state.theme === 'dark') {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
      } else {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
      }
    }
  }

  // ========================================
  // NOTIFICATIONS
  // ========================================
  function toggleNotificationDropdown() {
    let dropdown = document.querySelector('.notification-dropdown');

    if (dropdown) {
      dropdown.classList.toggle('active');
      return;
    }

    // Create dropdown
    dropdown = createNotificationDropdown();
    elements.notificationBtn.parentElement.appendChild(dropdown);

    // Position
    const rect = elements.notificationBtn.getBoundingClientRect();
    dropdown.style.top = `${rect.bottom + 8}px`;
    dropdown.style.right = '0';

    // Load notifications
    loadNotifications();

    // Force reflow then show
    requestAnimationFrame(() => dropdown.classList.add('active'));
  }

  function createNotificationDropdown() {
    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown-menu notification-dropdown';
    dropdown.style.minWidth = '360px';
    dropdown.style.maxHeight = '400px';
    dropdown.innerHTML = `
      <div class="dropdown-header" style="padding: var(--space-3) var(--space-4); border-bottom: 1px solid hsl(var(--color-border)); display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 600;">Thông báo</span>
        <button class="btn btn-ghost btn-sm" data-action="mark-all-read">Đánh dấu đã đọc</button>
      </div>
      <div class="dropdown-list" style="overflow-y: auto; max-height: 320px;"></div>
      <div class="dropdown-footer" style="padding: var(--space-3); border-top: 1px solid hsl(var(--color-border)); text-align: center;">
        <a href="notifications.html" class="btn btn-outline btn-sm">Xem tất cả</a>
      </div>
    `;

    dropdown.querySelector('[data-action="mark-all-read"]').addEventListener('click', markAllNotificationsRead);
    return dropdown;
  }

  async function loadNotifications() {
    const listEl = document.querySelector('.notification-dropdown .dropdown-list');
    if (!listEl) return;

    listEl.innerHTML = '<div class="skeleton skeleton-text" style="margin: var(--space-2) var(--space-3); width: 80%;"></div><div class="skeleton skeleton-text" style="margin: var(--space-2) var(--space-3); width: 60%;"></div>';

    try {
      const data = await API.notifications.getList({ limit: 10 });
      state.notifications = data.items || data;
      renderNotifications();
      updateUnreadBadge();
    } catch (err) {
      console.error('Failed to load notifications:', err);
      listEl.innerHTML = '<div class="empty-state" style="padding: var(--space-6);"><p>Không thể tải thông báo</p></div>';
    }
  }

  function renderNotifications() {
    const listEl = document.querySelector('.notification-dropdown .dropdown-list');
    if (!listEl) return;

    if (!state.notifications.length) {
      listEl.innerHTML = '<div class="empty-state" style="padding: var(--space-6);"><p>Không có thông báo mới</p></div>';
      return;
    }

    listEl.innerHTML = state.notifications.map(notif => `
      <button class="dropdown-item notification-item ${!notif.isRead ? 'unread' : ''}" data-id="${notif.id}" style="text-align: left; justify-content: flex-start; padding: var(--space-3) var(--space-4);">
        <div style="flex: 1; min-width: 0;">
          <p style="font-weight: ${!notif.isRead ? '600' : '500'}; color: hsl(var(--color-text-primary)); margin-bottom: 2px;">${escapeHtml(notif.title)}</p>
          <p style="font-size: var(--text-xs); color: hsl(var(--color-text-muted));">${escapeHtml(notif.message)}</p>
          <span style="font-size: var(--text-xs); color: hsl(var(--color-text-muted));">${formatRelativeTime(notif.createdAt)}</span>
        </div>
        ${!notif.isRead ? '<span class="badge badge-primary" style="font-size: 10px; padding: 2px 6px;">Mới</span>' : ''}
      </button>
    `).join('');

    // Add click handlers
    listEl.querySelectorAll('.notification-item').forEach(item => {
      item.addEventListener('click', () => handleNotificationClick(item.dataset.id));
    });
  }

  async function handleNotificationClick(id) {
    const notif = state.notifications.find(n => n.id === id);
    if (!notif) return;

    // Mark as read
    if (!notif.isRead) {
      try {
        await API.notifications.markAsRead(id);
        notif.isRead = true;
        renderNotifications();
        updateUnreadBadge();
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }

    // Navigate or handle action
    if (notif.actionUrl) {
      window.location.href = notif.actionUrl;
    }

    // Close dropdown
    document.querySelector('.notification-dropdown')?.classList.remove('active');
  }

  async function markAllNotificationsRead() {
    try {
      await API.notifications.markAllAsRead();
      state.notifications.forEach(n => n.isRead = true);
      renderNotifications();
      updateUnreadBadge();
      showToast('success', 'Thành công', 'Đã đánh dấu tất cả thông báo là đã đọc');
    } catch (err) {
      showToast('error', 'Lỗi', 'Không thể đánh dấu đã đọc');
    }
  }

  function updateUnreadBadge() {
    const unread = state.notifications.filter(n => !n.isRead).length;
    state.unreadCount = unread;

    if (elements.notificationBadge) {
      if (unread > 0) {
        elements.notificationBadge.textContent = unread > 99 ? '99+' : unread;
        elements.notificationBadge.style.display = 'flex';
      } else {
        elements.notificationBadge.style.display = 'none';
      }
    }
  }

  function startNotificationPolling() {
    // Poll every 30 seconds
    setInterval(() => {
      if (API.auth.isAuthenticated()) {
        API.notifications.getUnreadCount()
          .then(data => {
            state.unreadCount = data.count || 0;
            updateUnreadBadge();
          })
          .catch(err => console.error('Notification poll error:', err));
      }
    }, 30000);
  }

  // ========================================
  // TOAST NOTIFICATIONS
  // ========================================
  function showToast(type, title, message, duration = 5000) {
    if (!elements.toastContainer) {
      createToastContainer();
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
      success: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
      error: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
      warning: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
      info: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
    };

    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || icons.info}</div>
      <div class="toast-content">
        <div class="toast-title">${escapeHtml(title)}</div>
        <div class="toast-message">${escapeHtml(message)}</div>
      </div>
      <button class="toast-close" aria-label="Đóng">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => removeToast(toast));
    elements.toastContainer.appendChild(toast);

    // Auto remove
    if (duration > 0) {
      setTimeout(() => removeToast(toast), duration);
    }

    return toast;
  }

  function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
    elements.toastContainer = container;
  }

  function removeToast(toast) {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove());
  }

  // ========================================
  // MODALS
  // ========================================
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const overlay = modal.closest('.modal-overlay');
    if (overlay) {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';

      // Focus first input
      const firstInput = modal.querySelector('input, select, textarea');
      setTimeout(() => firstInput?.focus(), 100);
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const overlay = modal.closest('.modal-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-overlay.active').forEach(overlay => {
      overlay.classList.remove('active');
    });
    document.body.style.overflow = '';
  }

  // Bind modal close buttons
  document.addEventListener('click', e => {
    if (e.target.matches('[data-modal-close]') || e.target.closest('[data-modal-close]')) {
      const overlay = e.target.closest('.modal-overlay');
      overlay?.classList.remove('active');
      document.body.style.overflow = '';
    }

    // Close on overlay click
    if (e.target.classList.contains('modal-overlay')) {
      e.target.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // ========================================
  // LOADING STATES
  // ========================================
  function showLoading(container, type = 'spinner') {
    if (!container) return;

    if (type === 'spinner') {
      container.innerHTML = `
        <div class="flex justify-center items-center" style="padding: var(--space-12);">
          <div class="spinner"></div>
        </div>
      `;
    } else if (type === 'skeleton') {
      container.innerHTML = Array(5).fill(0).map(() => `
        <div class="card" style="margin-bottom: var(--space-4);">
          <div class="card-body">
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-text" style="width: 80%;"></div>
            <div class="skeleton skeleton-text" style="width: 60%;"></div>
          </div>
        </div>
      `).join('');
    }
  }

  function hideLoading(container) {
    // Container will be replaced with actual content
  }

  // ========================================
  // TABLE RENDERING
  // ========================================
  function renderTable(container, options) {
    const {
      columns,
      data,
      keyField = 'id',
      actions = [],
      emptyMessage = 'Không có dữ liệu',
      rowClass = '',
      rowClick = null
    } = options;

    if (!data || !data.length) {
      container.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <p class="empty-state-title">Không tìm thấy dữ liệu</p>
          <p class="empty-state-message">${escapeHtml(emptyMessage)}</p>
        </div>
      `;
      return;
    }

    const thead = columns.map(col => `
      <th style="width: ${col.width || 'auto'}; min-width: ${col.minWidth || '80px'};">
        ${escapeHtml(col.label)}
      </th>
    `).join('');

    const tbody = data.map(row => {
      const rowData = columns.map(col => {
        let value = getNestedValue(row, col.field);

        if (col.render) {
          return col.render(value, row);
        }

        if (col.type === 'badge') {
          const variant = col.badgeVariant?.(value, row) || 'secondary';
          return `<span class="badge badge-${variant}">${escapeHtml(value)}</span>`;
        }

        if (col.type === 'date') {
          return value ? formatDate(value) : '-';
        }

        if (col.type === 'datetime') {
          return value ? formatDateTime(value) : '-';
        }

        if (col.type === 'currency') {
          return formatCurrency(value);
        }

        return escapeHtml(value ?? '-');
      }).join('');

      const actionHtml = actions.length ? `
        <td style="white-space: nowrap;">
          <div class="flex gap-1">
            ${actions.map(action => `
              <button class="btn btn-ghost btn-sm action-btn" data-action="${action.name}" data-id="${row[keyField]}" title="${escapeHtml(action.label)}">
                ${action.icon}
              </button>
            `).join('')}
          </div>
        </td>
      ` : '';

      return `
        <tr data-id="${row[keyField]}" class="${rowClass(row) || ''}" style="cursor: ${rowClick ? 'pointer' : 'default'};">
          ${rowData}
          ${actionHtml}
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <div class="table-container">
        <table class="table">
          <thead><tr>${thead}${actions.length ? '<th style="width: 100px;">Thao tác</th>' : ''}</tr></thead>
          <tbody>${tbody}</tbody>
        </table>
      </div>
    `;

    // Bind action buttons
    container.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const action = actions.find(a => a.name === btn.dataset.action);
        if (action) action.handler(btn.dataset.id, btn);
      });
    });

    // Bind row click
    if (rowClick) {
      container.querySelectorAll('tbody tr').forEach(tr => {
        tr.addEventListener('click', e => {
          if (!e.target.closest('.action-btn')) {
            rowClick(tr.dataset.id, tr);
          }
        });
      });
    }
  }

  // ========================================
  // FORM HANDLING
  // ========================================
  function bindForm(formId, submitHandler, options = {}) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', async e => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn?.innerHTML;

      // Validate
      if (!validateForm(form)) return;

      // Collect data
      const formData = new FormData(form);
      const data = {};
      formData.forEach((value, key) => {
        // Handle arrays (checkboxes with same name)
        if (data[key]) {
          if (!Array.isArray(data[key])) data[key] = [data[key]];
          data[key].push(value);
        } else {
          data[key] = value;
        }
      });

      // Show loading
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="spinner-sm"></div> Đang xử lý...';
      }

      try {
        await submitHandler(data, form);
        showToast('success', 'Thành công', options.successMessage || 'Lưu thành công');

        if (options.onSuccess) options.onSuccess(data);
        if (options.closeModal) closeModal(options.closeModal);
        if (options.resetForm) form.reset();
      } catch (err) {
        showToast('error', 'Lỗi', err.message || 'Có lỗi xảy ra, vui lòng thử lại');
        if (options.onError) options.onError(err);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      }
    });
  }

  function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');

    requiredFields.forEach(field => {
      const errorEl = field.parentElement.querySelector('.form-error');
      if (!field.value.trim()) {
        isValid = false;
        field.classList.add('error');
        if (errorEl) errorEl.textContent = 'Trường này là bắt buộc';
      } else {
        field.classList.remove('error');
        if (errorEl) errorEl.textContent = '';
      }
    });

    // Email validation
    form.querySelectorAll('input[type="email"]').forEach(field => {
      if (field.value && !isValidEmail(field.value)) {
        isValid = false;
        field.classList.add('error');
        const errorEl = field.parentElement.querySelector('.form-error');
        if (errorEl) errorEl.textContent = 'Email không hợp lệ';
      }
    });

    return isValid;
  }

  function populateForm(formId, data) {
    const form = document.getElementById(formId);
    if (!form) return;

    Object.keys(data).forEach(key => {
      const field = form.querySelector(`[name="${key}"]`);
      if (!field) return;

      if (field.type === 'checkbox') {
        field.checked = data[key];
      } else if (field.type === 'radio') {
        const radio = form.querySelector(`[name="${key}"][value="${data[key]}"]`);
        if (radio) radio.checked = true;
      } else if (field.tagName === 'SELECT' && field.multiple) {
        Array.from(field.options).forEach(opt => {
          opt.selected = Array.isArray(data[key]) && data[key].includes(opt.value);
        });
      } else {
        field.value = data[key] ?? '';
      }
    });
  }

  function clearForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.reset();
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    form.querySelectorAll('.form-error').forEach(el => el.textContent = '');
  }

  // ========================================
  // PAGINATION
  // ========================================
  function renderPagination(container, options) {
    const {
      currentPage = 1,
      totalPages = 1,
      totalItems = 0,
      onPageChange
    } = options;

    if (totalPages <= 1) {
      container.innerHTML = '';
      return;
    }

    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    container.innerHTML = `
      <nav class="pagination" aria-label="Phân trang">
        <button class="pagination-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''} aria-label="Trang trước">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        ${start > 1 ? `
          <button class="pagination-btn" data-page="1">1</button>
          ${start > 2 ? '<span class="pagination-ellipsis">...</span>' : ''}
        ` : ''}
        ${pages.map(p => `
          <button class="pagination-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>
        `).join('')}
        ${end < totalPages ? `
          ${end < totalPages - 1 ? '<span class="pagination-ellipsis">...</span>' : ''}
          <button class="pagination-btn" data-page="${totalPages}">${totalPages}</button>
        ` : ''}
        <button class="pagination-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''} aria-label="Trang sau">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
        <span class="pagination-info" style="margin-left: var(--space-4); font-size: var(--text-sm); color: hsl(var(--color-text-muted));">
          Trang ${currentPage} / ${totalPages} (${totalItems} mục)
        </span>
      </nav>
    `;

    container.querySelectorAll('.pagination-btn[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.dataset.page);
        if (page !== currentPage && page >= 1 && page <= totalPages) {
          onPageChange(page);
        }
      });
    });
  }

  // ========================================
  // SEARCH & FILTER
  // ========================================
  function bindSearch(inputId, callback, debounceMs = 300) {
    const input = document.getElementById(inputId);
    if (!input) return;

    let timeoutId;
    input.addEventListener('input', e => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        callback(e.target.value.trim());
      }, debounceMs);
    });

    // Clear button
    const clearBtn = input.parentElement?.querySelector('.search-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        input.value = '';
        callback('');
        input.focus();
      });
      input.addEventListener('input', () => {
        clearBtn.style.display = input.value ? 'flex' : 'none';
      });
    }
  }

  function bindFilter(selectId, callback) {
    const select = document.getElementById(selectId);
    if (!select) return;

    select.addEventListener('change', e => {
      callback(e.target.value);
    });
  }

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================
  function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }

  function getNestedValue(obj, path) {
    return path.split('.').reduce((o, k) => (o || {})[k], obj);
  }

  function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('vi-VN');
  }

  function formatDateTime(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }

  function formatCurrency(value) {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }

  function formatRelativeTime(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return formatDate(dateStr);
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  function debounce(fn, ms) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), ms);
    };
  }

  function handleLogout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      API.auth.logout().finally(() => {
        window.location.href = 'login.html';
      });
    }
  }

  // ========================================
  // PAGE INITIALIZATION HOOK
  // ========================================
  function initPage() {
    // Override in each page
    const pageInit = window.pageInit;
    if (typeof pageInit === 'function') {
      pageInit();
    }
  }

  // ========================================
  // PUBLIC API
  // ========================================
  return {
    init,
    state,
    elements,

    // Sidebar
    toggleSidebar,
    closeSidebarMobile,

    // Theme
    toggleTheme,

    // Notifications
    showToast,

    // Modals
    openModal,
    closeModal,
    closeAllModals,

    // Loading
    showLoading,

    // Tables
    renderTable,

    // Forms
    bindForm,
    validateForm,
    populateForm,
    clearForm,

    // Pagination
    renderPagination,

    // Search/Filter
    bindSearch,
    bindFilter,

    // Utils
    escapeHtml,
    getNestedValue,
    formatDate,
    formatDateTime,
    formatCurrency,
    formatRelativeTime,
    generateId,
    debounce
  };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// Global access for inline handlers
window.App = App;
window.API = API;
