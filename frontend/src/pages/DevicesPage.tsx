import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, deviceApi } from '../lib/api';
import { Device, CreateDeviceDto, UpdateDeviceDto, DevicePagedResult, DeviceWarrantyExpiry,
  getDeviceCategoryLabel, getDeviceStatusLabel, getDeviceStatusColor } from '../types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  Plus, Search, Edit, Trash2, Eye, ChevronLeft, ChevronRight,
  Cpu, AlertTriangle, Calendar, X, Filter
} from 'lucide-react';
import { format } from 'date-fns';

const deviceSchema = z.object({
  code: z.string().min(1, 'Mã thiết bị không được để trống').max(20),
  serialNumber: z.string().min(1, 'Số serial không được để trống').max(100),
  name: z.string().min(1, 'Tên thiết bị không được để trống').max(100),
  model: z.string().max(100).optional().or(z.literal('')),
  brand: z.string().max(100).optional().or(z.literal('')),
  category: z.number().min(1).max(7),
  purchaseDate: z.string().min(1, 'Ngày mua không được để trống'),
  warrantyExpiryDate: z.string().optional().or(z.literal('')),
  purchasePrice: z.number().min(0, 'Giá mua phải lớn hơn hoặc bằng 0'),
  specifications: z.string().optional().or(z.literal('')),
  status: z.number().min(1).max(5),
  location: z.string().max(200).optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  customerId: z.number().min(1, 'Khách hàng không hợp lệ'),
});

type DeviceForm = z.infer<typeof deviceSchema>;

export function DevicesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | ''>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [viewingDevice, setViewingDevice] = useState<Device | null>(null);
  const [showExpiring, setShowExpiring] = useState(false);

  const { data: result, isLoading } = useQuery({
    queryKey: ['devices', page, pageSize, search, statusFilter],
    queryFn: () => deviceApi.getAll({ page, pageSize, search }).then(r => r.data as DevicePagedResult),
    placeholderData: (previous) => previous,
  });

  const { data: customers } = useQuery({
    queryKey: ['customers', 'all'],
    queryFn: () => api.get('/customers', { params: { pageSize: 1000 } }).then(r => r.data.items),
  });

  const { data: expiringDevices } = useQuery({
    queryKey: ['devices', 'warranty-expiring'],
    queryFn: () => deviceApi.getWarrantyExpiring(30).then(r => r.data as DeviceWarrantyExpiry[]),
    enabled: showExpiring,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateDeviceDto) => deviceApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success('Tạo thiết bị thành công');
      setIsModalOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Tạo thiết bị thất bại'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateDeviceDto) => deviceApi.update(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success('Cập nhật thiết bị thành công');
      setIsModalOpen(false);
      setEditingDevice(null);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Cập nhật thiết bị thất bại'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deviceApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success('Xóa thiết bị thành công');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Xóa thiết bị thất bại'),
  });

  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<DeviceForm>({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      code: '',
      serialNumber: '',
      name: '',
      model: '',
      brand: '',
      category: 1,
      purchaseDate: format(new Date(), 'yyyy-MM-dd'),
      warrantyExpiryDate: '',
      purchasePrice: 0,
      specifications: '',
      status: 1,
      location: '',
      notes: '',
      customerId: 0,
    },
  });

  const onSubmit = (data: DeviceForm) => {
    const submitData = {
      code: data.code,
      serialNumber: data.serialNumber,
      name: data.name,
      model: data.model,
      brand: data.brand,
      category: data.category,
      purchaseDate: data.purchaseDate,
      warrantyExpiryDate: data.warrantyExpiryDate || undefined,
      purchasePrice: data.purchasePrice,
      specifications: data.specifications,
      status: data.status,
      location: data.location,
      notes: data.notes,
      customerId: data.customerId,
    };
    if (editingDevice) {
      updateMutation.mutate({ ...submitData, id: editingDevice.id });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const openCreateModal = () => {
    setEditingDevice(null);
    reset({
      code: '',
      serialNumber: '',
      name: '',
      model: '',
      brand: '',
      category: 1,
      purchaseDate: format(new Date(), 'yyyy-MM-dd'),
      warrantyExpiryDate: '',
      purchasePrice: 0,
      specifications: '',
      status: 1,
      location: '',
      notes: '',
      customerId: customers?.[0]?.id || 0,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (device: Device) => {
    setEditingDevice(device);
    reset({
      code: device.code,
      serialNumber: device.serialNumber,
      name: device.name,
      model: device.model || '',
      brand: device.brand || '',
      category: device.category,
      purchaseDate: format(new Date(device.purchaseDate), 'yyyy-MM-dd'),
      warrantyExpiryDate: device.warrantyExpiryDate ? format(new Date(device.warrantyExpiryDate), 'yyyy-MM-dd') : '',
      purchasePrice: device.purchasePrice,
      specifications: device.specifications || '',
      status: device.status,
      location: device.location || '',
      notes: device.notes || '',
      customerId: device.customerId,
    });
    setIsModalOpen(true);
  };

  const openViewModal = (device: Device) => {
    setViewingDevice(device);
  };

  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa thiết bị này?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading && !result) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý thiết bị</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Danh sách thiết bị và trạng thái bảo hành</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExpiring(!showExpiring)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              showExpiring
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
            {showExpiring ? 'Ẩn cảnh báo' : 'Xem hết hạn BH'}
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Thêm thiết bị
          </button>
        </div>
      </div>

      {/* Expiring Warranty Banner */}
      {showExpiring && expiringDevices && expiringDevices.length > 0 && (
        <div className="rounded-xl border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              <div>
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                  {expiringDevices.length} thiết bị sắp hết hạn bảo hành (30 ngày)
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  {expiringDevices.filter(d => d.daysRemaining <= 7).length} thiết bị hết hạn trong 7 ngày
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowExpiring(false)}
              className="text-yellow-600 dark:text-yellow-400 hover:underline text-sm"
            >
              Đóng
            </button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-yellow-700 dark:text-yellow-300">
                  <th className="p-2">Mã TB</th>
                  <th className="p-2">Tên thiết bị</th>
                  <th className="p-2">Serial</th>
                  <th className="p-2">Hết hạn</th>
                  <th className="p-2">Còn lại</th>
                  <th className="p-2">Khách hàng</th>
                </tr>
              </thead>
              <tbody>
                {expiringDevices.slice(0, 10).map((device, idx) => (
                  <tr key={idx} className={device.daysRemaining <= 7 ? 'bg-yellow-100 dark:bg-yellow-900/30' : ''}>
                    <td className="p-2 font-mono">{device.code}</td>
                    <td className="p-2">{device.name}</td>
                    <td className="p-2 font-mono text-xs">{device.serialNumber}</td>
                    <td className="p-2">{format(new Date(device.warrantyExpiryDate), 'dd/MM/yyyy')}</td>
                    <td className="p-2 font-medium">
                      {device.daysRemaining} ngày
                    </td>
                    <td className="p-2">{device.customerName} ({device.customerPhone})</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã, tên, serial, model..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Trạng thái</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value === '' ? '' : Number(e.target.value)); setPage(1); }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Tất cả</option>
              <option value={1}>Đang sử dụng</option>
              <option value={2}>Đang bảo trì</option>
              <option value={3}>Đang bảo hành</option>
              <option value={4}>Đã thanh lý</option>
              <option value={5}>Mất/Hỏng</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Hiển thị</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mã TB</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tên thiết bị</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Serial</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Danh mục</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Khách hàng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ngày mua</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hết BH</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {result?.items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    Không tìm thấy thiết bị nào
                  </td>
                </tr>
              ) : (
                result?.items.map((device) => (
                  <tr key={device.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-gray-900 dark:text-white">{device.code}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{device.name}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-mono text-xs">{device.serialNumber}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{getDeviceCategoryLabel(device.category)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDeviceStatusColor(device.status)}`}>
                        {getDeviceStatusLabel(device.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{device.customerName}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
                      {format(new Date(device.purchaseDate), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
                      {device.warrantyExpiryDate 
                        ? (() => {
                            const days = Math.ceil((new Date(device.warrantyExpiryDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                            const color = days <= 7 ? 'text-red-600' : days <= 30 ? 'text-yellow-600' : 'text-green-600';
                            return (
                              <span className={`${color} font-medium`}>
                                {format(new Date(device.warrantyExpiryDate!), 'dd/MM/yyyy')}
                                {' '}({days > 0 ? days : 0} ngày)
                              </span>
                            );
                          })()
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openViewModal(device)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(device)}
                          className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(device.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {result && result.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Hiển thị <span className="font-medium">{((page - 1) * pageSize) + 1}</span> đến{' '}
              <span className="font-medium">{Math.min(page * pageSize, result.totalCount)}</span> của{' '}
              <span className="font-medium">{result.totalCount}</span> kết quả
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: Math.min(5, result.totalPages) }, (_, i) => {
                let pageNum: number;
                if (result.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= result.totalPages - 2) {
                  pageNum = result.totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      page === pageNum
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === result.totalPages}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-in">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingDevice ? 'Chỉnh sửa thiết bị' : 'Thêm thiết bị mới'}
              </h2>
              <button
                onClick={() => { setIsModalOpen(false); setEditingDevice(null); }}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mã thiết bị *</label>
                  <input
                    {...register('code')}
                    className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.code ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="VD: TB001"
                    disabled={!!editingDevice}
                  />
                  {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số Serial *</label>
                  <input
                    {...register('serialNumber')}
                    className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.serialNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Số serial duy nhất"
                  />
                  {errors.serialNumber && <p className="mt-1 text-sm text-red-500">{errors.serialNumber.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên thiết bị *</label>
                  <input
                    {...register('name')}
                    className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="VD: Laptop Dell XPS 15"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model</label>
                  <input
                    {...register('model')}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="VD: XPS 9520"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thương hiệu</label>
                  <input
                    {...register('brand')}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="VD: Dell"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Danh mục *</label>
                  <select
                    {...register('category', { valueAsNumber: true })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={1}>Máy tính/Laptop</option>
                    <option value={2}>Máy in</option>
                    <option value={3}>Máy quét</option>
                    <option value={4}>Thiết bị mạng</option>
                    <option value={5}>Server</option>
                    <option value={6}>Thiết bị ngoại vi</option>
                    <option value={7}>Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ngày mua *</label>
                  <input
                    {...register('purchaseDate')}
                    type="date"
                    className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.purchaseDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.purchaseDate && <p className="mt-1 text-sm text-red-500">{errors.purchaseDate.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hết bảo hành</label>
                  <input
                    {...register('warrantyExpiryDate')}
                    type="date"
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Giá mua (VNĐ) *</label>
                  <input
                    {...register('purchasePrice', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    step="1000"
                    className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.purchasePrice ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="0"
                  />
                  {errors.purchasePrice && <p className="mt-1 text-sm text-red-500">{errors.purchasePrice.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trạng thái *</label>
                  <select
                    {...register('status', { valueAsNumber: true })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={1}>Đang sử dụng</option>
                    <option value={2}>Đang bảo trì</option>
                    <option value={3}>Đang bảo hành</option>
                    <option value={4}>Đã thanh lý</option>
                    <option value={5}>Mất/Hỏng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Khách hàng *</label>
                  <select
                    {...register('customerId', { valueAsNumber: true })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={0}>Chọn khách hàng</option>
                    {customers?.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.code} - {c.fullName}</option>
                    ))}
                  </select>
                  {errors.customerId && <p className="mt-1 text-sm text-red-500">{errors.customerId.message}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thông số kỹ thuật</label>
                <textarea
                  {...register('specifications')}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Cấu hình chi tiết..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vị trí</label>
                <input
                  {...register('location')}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="VD: Phòng máy tính tầng 2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ghi chú</label>
                <textarea
                  {...register('notes')}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Ghi chú thêm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setEditingDevice(null); }}
                  className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-in">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Chi tiết thiết bị</h2>
              <button
                onClick={() => setViewingDevice(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Mã thiết bị</p>
                  <p className="font-mono text-lg text-gray-900 dark:text-white">{viewingDevice.code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Serial</p>
                  <p className="font-mono text-gray-900 dark:text-white">{viewingDevice.serialNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tên thiết bị</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingDevice.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Model</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingDevice.model || 'Chưa cung cấp'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Thương hiệu</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingDevice.brand || 'Chưa cung cấp'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Danh mục</p>
                  <p className="font-medium text-gray-900 dark:text-white">{getDeviceCategoryLabel(viewingDevice.category)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Trạng thái</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDeviceStatusColor(viewingDevice.status)}`}>
                    {getDeviceStatusLabel(viewingDevice.status)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Khách hàng</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingDevice.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ngày mua</p>
                  <p className="font-medium text-gray-900 dark:text-white">{format(new Date(viewingDevice.purchaseDate), 'dd/MM/yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Hết bảo hành</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {viewingDevice.warrantyExpiryDate 
                      ? (() => {
                          const days = Math.ceil((new Date(viewingDevice.warrantyExpiryDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                          return `${format(new Date(viewingDevice.warrantyExpiryDate!), 'dd/MM/yyyy')} (${days > 0 ? days : 0} ngày)`;
                        })()
                      : 'Chưa cung cấp'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Giá mua</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingDevice.purchasePrice.toLocaleString('vi-VN')} VNĐ</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Thông số kỹ thuật</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingDevice.specifications || 'Không có'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Vị trí</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingDevice.location || 'Không có'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ghi chú</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingDevice.notes || 'Không có'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ngày tạo</p>
                  <p className="font-medium text-gray-900 dark:text-white">{format(new Date(viewingDevice.createdAt), 'dd/MM/yyyy HH:mm')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
