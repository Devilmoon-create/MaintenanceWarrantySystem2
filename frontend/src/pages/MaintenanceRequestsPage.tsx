import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, maintenanceApi } from '../lib/api';
import { MaintenanceRequest, CreateMaintenanceRequestDto, UpdateMaintenanceRequestDto, MaintenanceRequestPagedResult, MaintenanceRequestStatusUpdateDto,
  getMaintenanceStatusLabel, getMaintenanceStatusColor, getPriorityLabel, getPriorityColor, getMaintenanceTypeLabel } from '../types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  Plus, Search, Edit, Trash2, Eye, ChevronLeft, ChevronRight,
  Wrench, AlertTriangle, Calendar, X, Filter, Truck, CheckCircle, Clock
} from 'lucide-react';
import { format } from 'date-fns';

const maintenanceSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống').max(200),
  description: z.string().min(1, 'Mô tả không được để trống'),
  type: z.number().min(1).max(4),
  priority: z.number().min(1).max(4),
  scheduledDate: z.string().optional().or(z.literal('')),
  estimatedCost: z.number().min(0, 'Chi phí dự kiến phải lớn hơn hoặc bằng 0'),
  customerNotes: z.string().optional().or(z.literal('')),
  deviceId: z.number().min(1, 'Thiết bị không hợp lệ'),
  customerId: z.number().min(1, 'Khách hàng không hợp lệ'),
});

const updateMaintenanceSchema = z.object({
  id: z.number(),
  title: z.string().min(1, 'Tiêu đề không được để trống').max(200),
  description: z.string().min(1, 'Mô tả không được để trống'),
  type: z.number().min(1).max(4),
  priority: z.number().min(1).max(4),
  status: z.number().min(1).max(8),
  scheduledDate: z.string().optional().or(z.literal('')),
  startedAt: z.string().optional().or(z.literal('')),
  completedAt: z.string().optional().or(z.literal('')),
  estimatedCost: z.number().min(0),
  actualCost: z.number().min(0),
  technicianNotes: z.string().optional().or(z.literal('')),
  customerNotes: z.string().optional().or(z.literal('')),
  replacementParts: z.string().optional().or(z.literal('')),
  assignedTechnicianId: z.number().optional(),
});

const statusUpdateSchema = z.object({
  id: z.number(),
  status: z.number().min(1).max(8),
  technicianNotes: z.string().optional().or(z.literal('')),
  startedAt: z.string().optional().or(z.literal('')),
  completedAt: z.string().optional().or(z.literal('')),
  actualCost: z.number().min(0).optional(),
  replacementParts: z.string().optional().or(z.literal('')),
});

type MaintenanceForm = z.infer<typeof maintenanceSchema>;
type UpdateMaintenanceForm = z.infer<typeof updateMaintenanceSchema>;
type StatusUpdateForm = z.infer<typeof statusUpdateSchema>;

export function MaintenanceRequestsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | ''>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<MaintenanceRequest | null>(null);
  const [viewingRequest, setViewingRequest] = useState<MaintenanceRequest | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<MaintenanceRequest | null>(null);

  const { data: result, isLoading } = useQuery({
    queryKey: ['maintenance', page, pageSize, search, statusFilter],
    queryFn: () => maintenanceApi.getAll({ page, pageSize, search, status: statusFilter || undefined }).then(r => r.data as MaintenanceRequestPagedResult),
    placeholderData: (previous) => previous,
  });

  const { data: devices } = useQuery({
    queryKey: ['devices', 'all'],
    queryFn: () => api.get('/devices', { params: { pageSize: 1000 } }).then(r => r.data.items),
  });

  const { data: customers } = useQuery({
    queryKey: ['customers', 'all'],
    queryFn: () => api.get('/customers', { params: { pageSize: 1000 } }).then(r => r.data.items),
  });

  const { data: technicians } = useQuery({
    queryKey: ['users', 'technicians'],
    queryFn: () => api.get('/users', { params: { role: 3, pageSize: 100 } }).then(r => r.data.items).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateMaintenanceRequestDto) => maintenanceApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      toast.success('Tạo yêu cầu bảo trì thành công');
      setIsModalOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Tạo yêu cầu bảo trì thất bại'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateMaintenanceRequestDto) => maintenanceApi.update(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      toast.success('Cập nhật yêu cầu bảo trì thành công');
      setIsModalOpen(false);
      setEditingRequest(null);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Cập nhật yêu cầu bảo trì thất bại'),
  });

  const statusMutation = useMutation({
    mutationFn: (data: MaintenanceRequestStatusUpdateDto) => maintenanceApi.updateStatus(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      toast.success('Cập nhật trạng thái thành công');
      setIsStatusModalOpen(false);
      setUpdatingStatus(null);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Cập nhật trạng thái thất bại'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => maintenanceApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      toast.success('Xóa yêu cầu bảo trì thành công');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Xóa yêu cầu bảo trì thất bại'),
  });

  const { register, handleSubmit, reset, formState: { errors }, watch, setValue } = useForm<MaintenanceForm>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 1,
      priority: 2,
      scheduledDate: '',
      estimatedCost: 0,
      customerNotes: '',
      deviceId: 0,
      customerId: 0,
    },
  });

  const { register: registerStatus, handleSubmit: handleSubmitStatus, reset: resetStatus, formState: { errors: statusErrors } } = useForm<StatusUpdateForm>({
    resolver: zodResolver(statusUpdateSchema),
    defaultValues: {
      id: 0,
      status: 1,
      technicianNotes: '',
      startedAt: '',
      completedAt: '',
      actualCost: 0,
      replacementParts: '',
    },
  });

  const onSubmit = (data: MaintenanceForm) => {
    const submitData = {
      title: data.title,
      description: data.description,
      type: data.type,
      priority: data.priority,
      scheduledDate: data.scheduledDate || undefined,
      estimatedCost: data.estimatedCost,
      customerNotes: data.customerNotes,
      deviceId: data.deviceId,
      customerId: data.customerId,
    };
    createMutation.mutate(submitData);
  };

  const onSubmitStatus = (data: StatusUpdateForm) => {
    const submitData = {
      id: data.id,
      status: data.status,
      technicianNotes: data.technicianNotes,
      startedAt: data.startedAt || undefined,
      completedAt: data.completedAt || undefined,
      actualCost: data.actualCost || undefined,
      replacementParts: data.replacementParts || undefined,
    };
    statusMutation.mutate(submitData);
  };

  const openCreateModal = () => {
    setEditingRequest(null);
    reset({
      title: '',
      description: '',
      type: 1,
      priority: 2,
      scheduledDate: '',
      estimatedCost: 0,
      customerNotes: '',
      deviceId: devices?.[0]?.id || 0,
      customerId: customers?.[0]?.id || 0,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (request: MaintenanceRequest) => {
    setEditingRequest(request);
    reset({
      title: request.title,
      description: request.description,
      type: request.type,
      priority: request.priority,
      scheduledDate: request.scheduledDate ? format(new Date(request.scheduledDate), 'yyyy-MM-dd') : '',
      estimatedCost: request.estimatedCost,
      customerNotes: request.customerNotes || '',
      deviceId: request.deviceId,
      customerId: request.customerId,
    });
    setIsModalOpen(true);
  };

  const openViewModal = (request: MaintenanceRequest) => {
    setViewingRequest(request);
  };

  const openStatusModal = (request: MaintenanceRequest) => {
    setUpdatingStatus(request);
    resetStatus({
      id: request.id,
      status: request.status,
      technicianNotes: request.technicianNotes || '',
      startedAt: request.startedAt ? format(new Date(request.startedAt), 'yyyy-MM-dd') : '',
      completedAt: request.completedAt ? format(new Date(request.completedAt), 'yyyy-MM-dd') : '',
      actualCost: request.actualCost,
      replacementParts: request.replacementParts || '',
    });
    setIsStatusModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa yêu cầu bảo trì này?')) {
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý bảo trì</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Danh sách yêu cầu bảo trì thiết bị</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Tạo yêu cầu mới
        </button>
      </div>

      {/* Search & Filter */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã, tiêu đề, thiết bị..."
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
              <option value={1}>Chờ duyệt</option>
              <option value={2}>Đã duyệt</option>
              <option value={3}>Đã lên lịch</option>
              <option value={4}>Đang thực hiện</option>
              <option value={5}>Chờ linh kiện</option>
              <option value={6}>Hoàn thành</option>
              <option value={7}>Đã hủy</option>
              <option value={8}>Từ chối</option>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mã YC</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tiêu đề</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Loại</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ưu tiên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Thiết bị</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Khách hàng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ngày YC</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {result?.items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    Không tìm thấy yêu cầu bảo trì nào
                  </td>
                </tr>
              ) : (
                result?.items.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-gray-900 dark:text-white">{request.requestCode}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white max-w-xs truncate">{request.title}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">{getMaintenanceTypeLabel(request.type)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                        {getPriorityLabel(request.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMaintenanceStatusColor(request.status)}`}>
                        {getMaintenanceStatusLabel(request.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{request.deviceName}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{request.customerName}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
                      {format(new Date(request.requestDate), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openViewModal(request)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(request)}
                          className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openStatusModal(request)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Cập nhật trạng thái"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(request.id)}
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
                {editingRequest ? 'Chỉnh sửa yêu cầu bảo trì' : 'Tạo yêu cầu bảo trì mới'}
              </h2>
              <button
                onClick={() => { setIsModalOpen(false); setEditingRequest(null); }}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tiêu đề *</label>
                  <input
                    {...register('title')}
                    className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="VD: Bảo trì định kỳ máy in"
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mô tả *</label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Mô tả chi tiết công việc bảo trì..."
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loại bảo trì *</label>
                  <select
                    {...register('type', { valueAsNumber: true })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={1}>Bảo trì định kỳ</option>
                    <option value={2}>Bảo trì sửa chữa</option>
                    <option value={3}>Khẩn cấp</option>
                    <option value={4}>Nâng cấp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ưu tiên *</label>
                  <select
                    {...register('priority', { valueAsNumber: true })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={1}>Thấp</option>
                    <option value={2}>Bình thường</option>
                    <option value={3}>Cao</option>
                    <option value={4}>Khẩn cấp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ngày dự kiến</label>
                  <input
                    {...register('scheduledDate')}
                    type="date"
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chi phí dự kiến (VNĐ) *</label>
                  <input
                    {...register('estimatedCost', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    step="10000"
                    className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.estimatedCost ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="0"
                  />
                  {errors.estimatedCost && <p className="mt-1 text-sm text-red-500">{errors.estimatedCost.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thiết bị *</label>
                  <select
                    {...register('deviceId', { valueAsNumber: true })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={0}>Chọn thiết bị</option>
                    {devices?.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.code} - {d.name} ({d.customerName})</option>
                    ))}
                  </select>
                  {errors.deviceId && <p className="mt-1 text-sm text-red-500">{errors.deviceId.message}</p>}
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ghi chú khách hàng</label>
                <textarea
                  {...register('customerNotes')}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Yêu cầu đặc biệt từ khách hàng..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setEditingRequest(null); }}
                  className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Đang tạo...' : 'Tạo yêu cầu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {isStatusModalOpen && updatingStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md animate-slide-in">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Cập nhật trạng thái</h2>
              <button
                onClick={() => { setIsStatusModalOpen(false); setUpdatingStatus(null); }}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitStatus(onSubmitStatus)} className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Mã YC: {updatingStatus.requestCode}</p>
                <p className="font-medium text-gray-900 dark:text-white">{updatingStatus.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trạng thái mới *</label>
                <select
                  {...registerStatus('status', { valueAsNumber: true })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value={1}>Chờ duyệt</option>
                  <option value={2}>Đã duyệt</option>
                  <option value={3}>Đã lên lịch</option>
                  <option value={4}>Đang thực hiện</option>
                  <option value={5}>Chờ linh kiện</option>
                  <option value={6}>Hoàn thành</option>
                  <option value={7}>Đã hủy</option>
                  <option value={8}>Từ chối</option>
                </select>
                {statusErrors.status && <p className="mt-1 text-sm text-red-500">{statusErrors.status.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ngày bắt đầu</label>
                <input
                  {...registerStatus('startedAt')}
                  type="date"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ngày hoàn thành</label>
                <input
                  {...registerStatus('completedAt')}
                  type="date"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chi phí thực tế (VNĐ)</label>
                <input
                  {...registerStatus('actualCost', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="10000"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Linh kiện thay thế</label>
                <textarea
                  {...registerStatus('replacementParts')}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Danh sách linh kiện đã thay thế..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ghi chú kỹ thuật</label>
                <textarea
                  {...registerStatus('technicianNotes')}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Ghi chú từ kỹ thuật viên..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => { setIsStatusModalOpen(false); setUpdatingStatus(null); }}
                  className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={statusMutation.isPending}
                  className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {statusMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-in">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Chi tiết yêu cầu bảo trì</h2>
              <button
                onClick={() => setViewingRequest(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Mã yêu cầu</p>
                  <p className="font-mono text-lg text-gray-900 dark:text-white">{viewingRequest.requestCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tiêu đề</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingRequest.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Loại</p>
                  <p className="font-medium text-gray-900 dark:text-white">{getMaintenanceTypeLabel(viewingRequest.type)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ưu tiên</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(viewingRequest.priority)}`}>
                    {getPriorityLabel(viewingRequest.priority)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Trạng thái</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMaintenanceStatusColor(viewingRequest.status)}`}>
                    {getMaintenanceStatusLabel(viewingRequest.status)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Thiết bị</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingRequest.deviceName} ({viewingRequest.deviceCode})</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Khách hàng</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingRequest.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Kỹ thuật viên</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingRequest.technicianName || 'Chưa phân công'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ngày yêu cầu</p>
                  <p className="font-medium text-gray-900 dark:text-white">{format(new Date(viewingRequest.requestDate), 'dd/MM/yyyy HH:mm')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ngày dự kiến</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingRequest.scheduledDate ? format(new Date(viewingRequest.scheduledDate), 'dd/MM/yyyy') : 'Chưa lên lịch'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ngày bắt đầu</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingRequest.startedAt ? format(new Date(viewingRequest.startedAt), 'dd/MM/yyyy HH:mm') : 'Chưa bắt đầu'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ngày hoàn thành</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingRequest.completedAt ? format(new Date(viewingRequest.completedAt), 'dd/MM/yyyy HH:mm') : 'Chưa hoàn thành'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Chi phí dự kiến</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingRequest.estimatedCost.toLocaleString('vi-VN')} VNĐ</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Chi phí thực tế</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingRequest.actualCost.toLocaleString('vi-VN')} VNĐ</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Mô tả</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingRequest.description}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ghi chú khách hàng</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingRequest.customerNotes || 'Không có'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ghi chú kỹ thuật</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingRequest.technicianNotes || 'Không có'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Linh kiện thay thế</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingRequest.replacementParts || 'Không có'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ngày tạo</p>
                  <p className="font-medium text-gray-900 dark:text-white">{format(new Date(viewingRequest.createdAt), 'dd/MM/yyyy HH:mm')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
