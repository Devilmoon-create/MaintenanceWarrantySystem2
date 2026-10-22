import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Customer, Device, MaintenanceRequest, WarrantyClaim, DeviceWarrantyExpiry } from '../types';
import {
  Users, Cpu, Wrench, ShieldCheck, AlertTriangle,
  TrendingUp, Clock, CheckCircle, XCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface DashboardStats {
  totalCustomers: number;
  totalDevices: number;
  activeMaintenance: number;
  pendingWarranty: number;
  warrantyExpiringSoon: number;
  warrantyExpiringCritical: number;
}

const statCards = [
  {
    name: 'Tổng khách hàng',
    key: 'totalCustomers' as keyof DashboardStats,
    icon: Users,
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    textColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    name: 'Tổng thiết bị',
    key: 'totalDevices' as keyof DashboardStats,
    icon: Cpu,
    color: 'bg-green-500',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    textColor: 'text-green-600 dark:text-green-400',
  },
  {
    name: 'Bảo trì đang thực hiện',
    key: 'activeMaintenance' as keyof DashboardStats,
    icon: Wrench,
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    textColor: 'text-yellow-600 dark:text-yellow-400',
  },
  {
    name: 'Bảo hành chờ xử lý',
    key: 'pendingWarranty' as keyof DashboardStats,
    icon: ShieldCheck,
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    textColor: 'text-purple-600 dark:text-purple-400',
  },
];

export function DashboardPage() {
  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ['customers', 'all'],
    queryFn: () => api.get('/customers', { params: { pageSize: 1 } }).then(r => r.data),
  });

  const { data: devices, isLoading: devicesLoading } = useQuery({
    queryKey: ['devices', 'all'],
    queryFn: () => api.get('/devices', { params: { pageSize: 1 } }).then(r => r.data),
  });

  const { data: maintenance, isLoading: maintenanceLoading } = useQuery({
    queryKey: ['maintenance', 'active'],
    queryFn: () => api.get('/maintenancerequests', { params: { status: 4, pageSize: 1 } }).then(r => r.data),
  });

  const { data: warranty, isLoading: warrantyLoading } = useQuery({
    queryKey: ['warranty', 'pending'],
    queryFn: () => api.get('/warrantyclaims', { params: { status: 1, pageSize: 1 } }).then(r => r.data),
  });

  const { data: warrantyExpiring } = useQuery({
    queryKey: ['devices', 'warranty-expiring'],
    queryFn: () => api.get('/devices/warranty-expiring', { params: { days: 30 } }).then(r => r.data),
  });

  const stats: DashboardStats = {
    totalCustomers: customers?.totalCount || 0,
    totalDevices: devices?.totalCount || 0,
    activeMaintenance: maintenance?.totalCount || 0,
    pendingWarranty: warranty?.totalCount || 0,
    warrantyExpiringSoon: warrantyExpiring?.filter((d: DeviceWarrantyExpiry) => d.daysRemaining <= 30).length || 0,
    warrantyExpiringCritical: warrantyExpiring?.filter((d: DeviceWarrantyExpiry) => d.daysRemaining <= 7).length || 0,
  };

  const isLoading = customersLoading || devicesLoading || maintenanceLoading || warrantyLoading;

  // Recent activities - fetch recent maintenance and warranty
  const { data: recentMaintenance } = useQuery({
    queryKey: ['maintenance', 'recent'],
    queryFn: () => api.get('/maintenancerequests', { params: { pageSize: 5, page: 1 } }).then(r => r.data),
  });

  const { data: recentWarranty } = useQuery({
    queryKey: ['warranty', 'recent'],
    queryFn: () => api.get('/warrantyclaims', { params: { pageSize: 5, page: 1 } }).then(r => r.data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  const recentActivities = [
    ...(recentMaintenance?.items || []).slice(0, 3).map((m: MaintenanceRequest) => ({
      type: 'maintenance' as const,
      title: m.title,
      subtitle: `${m.deviceName} - ${m.customerName}`,
      time: m.requestDate,
      status: m.status,
      href: `/maintenance`,
    })),
    ...(recentWarranty?.items || []).slice(0, 3).map((w: WarrantyClaim) => ({
      type: 'warranty' as const,
      title: w.title,
      subtitle: `${w.deviceName} - ${w.customerName}`,
      time: w.claimDate,
      status: w.status,
      href: `/warranty`,
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Tổng quan hệ thống bảo trì và bảo hành thiết bị
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Cập nhật: {format(new Date(), 'HH:mm:ss dd/MM/yyyy')}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.key} className={`rounded-xl border p-6 ${stat.bgColor} transition-shadow hover:shadow-md`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats[stat.key].toLocaleString('vi-VN')}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Warranty Alert Section */}
      {(stats.warrantyExpiringCritical > 0 || stats.warrantyExpiringSoon > 0) && (
        <div className="rounded-xl border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-yellow-500">
              <AlertTriangle className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                Cảnh báo bảo hành sắp hết hạn
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Có <strong>{stats.warrantyExpiringCritical}</strong> thiết bị hết hạn trong 7 ngày
                {stats.warrantyExpiringSoon > stats.warrantyExpiringCritical && (
                  <> và <strong>{stats.warrantyExpiringSoon - stats.warrantyExpiringCritical}</strong> thiết bị trong 30 ngày</>
                )}
              </p>
            </div>
            <a
              href="/devices"
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0"
            >
              Xem chi tiết
            </a>
          </div>
        </div>
      )}

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Thao tác nhanh</h3>
            <div className="space-y-2">
              <a
                href="/customers"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Thêm khách hàng mới</span>
              </a>
              <a
                href="/devices"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Cpu className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Đăng ký thiết bị mới</span>
              </a>
              <a
                href="/maintenance"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Wrench className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tạo yêu cầu bảo trì</span>
              </a>
              <a
                href="/warranty"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nộp yêu cầu bảo hành</span>
              </a>
            </div>
          </div>

          {/* System Status */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Trạng thái hệ thống</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">API Server</span>
                <span className="flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Hoạt động
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
                <span className="flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Kết nối
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Authentication</span>
                <span className="flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Hoạt động
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Hoạt động gần đây</h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentActivities.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  Chưa có hoạt động gần đây
                </div>
              ) : (
                recentActivities.map((activity, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'maintenance'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30'
                          : 'bg-purple-100 dark:bg-purple-900/30'
                      }`}>
                        {activity.type === 'maintenance' ? (
                          <Wrench className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        ) : (
                          <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {activity.subtitle}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {format(new Date(activity.time), 'HH:mm dd/MM/yyyy')}
                        </p>
                      </div>
                      <a
                        href={activity.href}
                        className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        Xem
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
