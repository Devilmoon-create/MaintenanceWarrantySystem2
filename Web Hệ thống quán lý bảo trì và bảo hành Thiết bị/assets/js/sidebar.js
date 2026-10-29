/**
 * Sidebar Component - Hệ thống Quản lý Bảo Trì & Bảo Hành Thiết Bị
 * Tự động inject sidebar vào tất cả các trang
 * 
 * Cách dùng: <script src="assets/js/sidebar.js"></script>
 * Đặt <div id="sidebar-container"></div> trong body
 */

(function () {
  'use strict';

  // Menu cấu trúc đầy đủ
  const MENU = [
    {
      section: 'Tổng quan',
      items: [
        {
          label: 'Dashboard',
          href: 'index.html',
          page: 'dashboard',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`
        }
      ]
    },
    {
      // Tương tự "Phần Quản lý Bán Hàng" → "Tiếp Nhận & Xử Lý Dịch Vụ"
      section: 'Tiếp nhận & Xử lý',
      items: [
        {
          label: 'Tạo phiếu dịch vụ',
          href: 'reception.html',
          page: 'reception',
          badge: 'POS',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>`
        },
        {
          label: 'Thanh toán dịch vụ',
          href: 'payment.html',
          page: 'payment',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>`
        },
        {
          label: 'Hoàn trả thiết bị',
          href: 'returns.html',
          page: 'returns',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 .49-3.7L1 10"></path></svg>`
        },
        {
          label: 'Báo cáo cuối ngày',
          href: 'daily-report.html',
          page: 'daily-report',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><line x1="8" y1="14" x2="8" y2="14"></line><line x1="12" y1="14" x2="12" y2="14"></line><line x1="16" y1="14" x2="16" y2="14"></line></svg>`
        }
      ]
    },
    {
      // Tương tự "Quản lý sản phẩm, loại sản phẩm" → thiết bị
      section: 'Quản lý Thiết bị',
      items: [
        {
          label: 'Danh sách thiết bị',
          href: 'devices.html',
          page: 'devices',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><path d="M8 21h8"></path><path d="M12 17v4"></path></svg>`
        },
        {
          label: 'Loại thiết bị',
          href: 'categories.html',
          page: 'categories',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`
        }
      ]
    },
    {
      // Tương tự "Phiếu bảo trì/bảo hành"
      section: 'Bảo trì & Bảo hành',
      items: [
        {
          label: 'Tất cả phiếu dịch vụ',
          href: 'maintenance.html',
          page: 'maintenance',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`
        },
        {
          label: 'Phiếu bảo trì',
          href: 'maintenance.html?tab=maintenance',
          page: 'maintenance-tab',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`
        },
        {
          label: 'Phiếu bảo hành',
          href: 'maintenance.html?tab=warranty',
          page: 'warranty-tab',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`
        },
        {
          label: 'Lịch bảo trì định kỳ',
          href: 'maintenance.html?tab=schedule',
          page: 'schedule-tab',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`
        }
      ]
    },
    {
      // Tương tự "Quản lý kho" → kho linh kiện/vật tư
      section: 'Kho Linh kiện & Vật tư',
      items: [
        {
          label: 'Danh mục linh kiện',
          href: 'spare-parts.html',
          page: 'spare-parts',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`
        },
        {
          label: 'Phiếu nhập linh kiện',
          href: 'import-invoices.html',
          page: 'import-invoices',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>`
        },
        {
          label: 'Kiểm kho linh kiện',
          href: 'inventory-check.html',
          page: 'inventory-check',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>`
        }
      ]
    },
    {
      // Tương tự "Quản lý hóa đơn xuất/nhập" → hóa đơn dịch vụ
      section: 'Hóa đơn & Tài chính',
      items: [
        {
          label: 'Hóa đơn dịch vụ',
          href: 'service-invoices.html',
          page: 'service-invoices',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`
        },
        {
          label: 'Giá dịch vụ',
          href: 'service-pricing.html',
          page: 'service-pricing',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`
        },
        {
          label: 'Lịch sử thay đổi giá',
          href: 'price-history.html',
          page: 'price-history',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`
        }
      ]
    },
    {
      // Tương tự "Quản lý khách hàng, nhà cung cấp, nhân viên"
      section: 'Quản lý Đối tác',
      items: [
        {
          label: 'Khách hàng',
          href: 'customers.html',
          page: 'customers',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`
        },
        {
          label: 'Nhà cung cấp',
          href: 'suppliers.html',
          page: 'suppliers',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>`
        }
      ]
    },
    {
      // Tương tự "Quản lý nhân viên, phân quyền"
      section: 'Nhân sự & Phân quyền',
      items: [
        {
          label: 'Quản lý nhân viên',
          href: 'users.html',
          page: 'users',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`
        },
        {
          label: 'Phân quyền hệ thống',
          href: 'roles.html',
          page: 'roles',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`
        }
      ]
    },
    {
      // Tương tự "Thống kê báo cáo doanh thu"
      section: 'Báo cáo & Thống kê',
      items: [
        {
          label: 'Thống kê doanh thu',
          href: 'reports.html',
          page: 'reports',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`
        },
        {
          label: 'Sản phẩm bán chạy',
          href: 'reports.html?view=top-services',
          page: 'top-services',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`
        },
        {
          label: 'Tồn kho linh kiện',
          href: 'reports.html?view=inventory',
          page: 'inventory-report',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>`
        },
        {
          label: 'Cài đặt hệ thống',
          href: 'settings.html',
          page: 'settings',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`
        }
      ]
    }
  ];

  /**
   * Tạo HTML sidebar dựa trên MENU config và page hiện tại
   */
  function buildSidebar(currentPage) {
    const navSections = MENU.map(section => {
      const items = section.items.map(item => {
        const isActive = item.page === currentPage;
        const badgeHtml = item.badge
          ? `<span class="badge badge-primary" style="font-size:9px;padding:2px 5px;margin-left:auto;">${item.badge}</span>`
          : '';
        return `
          <a href="${item.href}" class="nav-item${isActive ? ' active' : ''}" data-page="${item.page}">
            ${item.icon}
            <span>${item.label}</span>
            ${badgeHtml}
          </a>`;
      }).join('');

      return `
        <div class="nav-section">
          <div class="nav-section-title">${section.section}</div>
          ${items}
        </div>`;
    }).join('');

    return `
      <div class="sidebar-overlay" aria-hidden="true"></div>
      <aside class="sidebar" role="navigation" aria-label="Menu chính">
        <div class="sidebar-header">
          <a href="index.html" class="sidebar-logo" aria-label="Trang chủ">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M8 21h8"></path><path d="M12 17v4"></path>
              <circle cx="8" cy="7" r="2"></circle><circle cx="16" cy="7" r="2"></circle>
            </svg>
            <span>BảoTrìPro</span>
          </a>
        </div>

        <nav class="sidebar-nav" aria-label="Điều hướng chính">
          ${navSections}
        </nav>

        <div class="sidebar-footer">
          <div class="user-info" id="sidebar-user-info">
            <div class="user-avatar" id="sidebar-avatar">AD</div>
            <div class="user-details">
              <div class="user-name" id="sidebar-username">Admin User</div>
              <div class="user-role" id="sidebar-role">Quản trị viên</div>
            </div>
          </div>
          <div class="mt-3">
            <button class="btn btn-outline w-full" data-action="logout" id="sidebar-logout-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </aside>`;
  }

  /**
   * Tạo Header HTML
   */
  function buildHeader(pageTitle) {
    return `
      <header class="top-header" role="banner">
        <div class="header-left">
          <button class="sidebar-toggle" aria-label="Thu gọn/mở rộng menu" aria-expanded="false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <h1 class="page-title" id="page-title">${pageTitle || 'Dashboard'}</h1>
        </div>

        <div class="header-right">
          <div class="search-box" role="search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="search" id="global-search" placeholder="Tìm kiếm..." aria-label="Tìm kiếm toàn cục" autocomplete="off">
          </div>

          <button class="theme-toggle" aria-label="Chuyển đổi giao diện sáng/tối" title="Ctrl+Shift+L">
            <svg class="sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none;">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            <svg class="moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </button>

          <div class="dropdown" id="notif-dropdown-wrapper">
            <button class="notification-btn" id="notif-btn" aria-label="Thông báo" aria-haspopup="true" aria-expanded="false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span class="notification-badge" id="notif-badge" style="display:none;">0</span>
            </button>
          </div>

          <div class="dropdown" id="user-dropdown-wrapper">
            <button class="notification-btn" id="user-menu-btn" style="padding:0; background:none; display:flex; align-items:center; gap:6px;" aria-label="Menu người dùng" aria-haspopup="true" aria-expanded="false">
              <div class="user-avatar" id="header-avatar" style="width:32px; height:32px; font-size:var(--text-xs);">AD</div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div class="dropdown-menu" id="user-dropdown-menu" style="min-width:220px;">
              <div style="padding:var(--space-3) var(--space-4); border-bottom:1px solid hsl(var(--color-border));">
                <p style="font-weight:600;" id="header-username">Admin User</p>
                <p style="font-size:var(--text-xs); color:hsl(var(--color-text-muted));" id="header-email">admin@baotripro.vn</p>
              </div>
              <a href="profile.html" class="dropdown-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span>Hồ sơ cá nhân</span>
              </a>
              <a href="settings.html" class="dropdown-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                <span>Cài đặt</span>
              </a>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item danger" id="header-logout-btn" data-action="logout">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      </header>`;
  }

  /**
   * Detect trang hiện tại từ data-page attribute trên body hoặc filename
   */
  function detectCurrentPage() {
    const bodyPage = document.body.dataset.page;
    if (bodyPage) return bodyPage;

    const path = window.location.pathname;
    const filename = path.split('/').pop().replace('.html', '');
    return filename === 'index' ? 'dashboard' : filename;
  }

  /**
   * Detect tiêu đề trang từ data-title attribute trên body hoặc <title>
   */
  function detectPageTitle() {
    return document.body.dataset.title || document.title.split(' - ')[0] || 'Dashboard';
  }

  /**
   * Inject sidebar và header
   */
  function inject() {
    // Chỉ inject nếu trang không phải login
    if (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) return;

    const currentPage = detectCurrentPage();
    const pageTitle = detectPageTitle();

    // Inject sidebar before body first child
    const sidebarHtml = buildSidebar(currentPage);
    document.body.insertAdjacentHTML('afterbegin', sidebarHtml);

    // Inject header as first child of .main-content
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      const headerHtml = buildHeader(pageTitle);
      mainContent.insertAdjacentHTML('afterbegin', headerHtml);
    }

    // Bind user dropdown toggle
    const userMenuBtn = document.getElementById('user-menu-btn');
    const userDropdownMenu = document.getElementById('user-dropdown-menu');
    if (userMenuBtn && userDropdownMenu) {
      userMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdownMenu.classList.toggle('active');
      });
    }

    // Update user info if API is available
    if (typeof API !== 'undefined' && API.auth.isAuthenticated()) {
      API.auth.getProfile().then(user => {
        const name = user.fullName || user.username || 'Admin User';
        const initial = name.charAt(0).toUpperCase();
        const role = user.roleName || user.role || 'Nhân viên';
        const email = user.email || '';

        ['sidebar-username', 'header-username'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.textContent = name;
        });
        ['sidebar-avatar', 'header-avatar'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.textContent = initial;
        });
        const roleEl = document.getElementById('sidebar-role');
        if (roleEl) roleEl.textContent = role;
        const emailEl = document.getElementById('header-email');
        if (emailEl) emailEl.textContent = email;
      }).catch(() => {});
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }

})();
