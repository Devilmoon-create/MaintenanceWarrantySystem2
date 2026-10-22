import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import {
  LayoutDashboard,
  Users,
  Cpu,
  Wrench,
  ShieldCheck,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  AlertTriangle,
  User,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { DeviceWarrantyExpiry } from '../types';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [warrantyExpiring, setWarrantyExpiring] = useState<DeviceWarrantyExpiry[]>([]);
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Khách hàng', href: '/customers', icon: Users },
    { name: 'Thiết bị', href: '/devices', icon: Cpu },
    { name: 'Bảo trì', href: '/maintenance', icon: Wrench },
    { name: 'Bảo hành', href: '/warranty', icon: ShieldCheck },
    { name: 'Cài đặt', href: '/settings', icon: Settings },
  ];

  const fetchWarrantyExpiring = async () => {
    try {
      const response = await api.get('/devices/warranty-expiring', { params: { days: 30 } });
      setWarrantyExpiring(response.data || []);
    } catch (error) {
      console.error('Failed to fetch warranty expiring:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchWarrantyExpiring();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const expiringCount = warrantyExpiring.filter(d => d.daysRemaining <= 7).length;
  const expiringSoonCount = warrantyExpiring.filter(d => d.daysRemaining <= 30).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Sidebar"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">MaintWarranty</span>
            </div>
            <button
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="Main navigation">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
                  }`
              }
              onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" aria-hidden="true" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* User info & Logout */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.fullName || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role === 1 ? 'Quản trị' : user?.role === 2 ? 'Quản lý' : 'Kỹ thuật'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-gray-800 rounded-lg transition-colors mt-2"
            >
              <LogOut className="w-5 h-5" aria-hidden="true" />
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white hidden sm:block">
                Hệ thống Quản lý Bảo Trì/Bảo Hành
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Warranty notifications */}
              {(expiringCount > 0 || expiringSoonCount > 0) && (
                <div className="relative">
                  <button className="relative p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <Bell className="w-5 h-5" />
                    {(expiringCount > 0 || expiringSoonCount > 0) && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {expiringCount + expiringSoonCount > 9 ? '9+' : expiringCount + expiringSoonCount}
                      </span>
                    )}
                  </button>
                </div>
              )}

              {/* User menu - simplified */}
              <div className="hidden sm:flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.fullName}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {/* Warranty alert banner */}
          {(expiringCount > 0 || expiringSoonCount > 0) && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-3 animate-slide-in">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  Cảnh báo bảo hành
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Có <strong>{expiringCount}</strong> thiết bị sắp hết hạn bảo hành trong 7 ngày
                  {expiringSoonCount > expiringCount && (
                    <> và <strong>{expiringSoonCount - expiringCount}</strong> thiết bị trong 30 ngày</>
                  )}
                </p>
              </div>
              <NavLink
                to="/devices"
                className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline flex-shrink-0"
              >
                Xem chi tiết
              </NavLink>
            </div>
          )}

          <Outlet />
        </main>
      </div>
    </div>
  );
}
