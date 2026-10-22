import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, warrantyApi } from '../lib/api';
import { WarrantyClaim, CreateWarrantyClaimDto, UpdateWarrantyClaimDto, WarrantyClaimPagedResult, WarrantyClaimStatusUpdateDto,
  getWarrantyStatusLabel, getWarrantyStatusColor, getWarrantyTypeLabel } from '../types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  Plus, Search, Edit, Trash2, Eye, ChevronLeft, ChevronRight,
  ShieldCheck, AlertTriangle, Calendar, X, Filter, CheckCircle, Clock, RotateCcw
} from 'lucide-react';
import { format } from 'date-fns';

const warrantySchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống').max(200),
  description: z.string().min(1, 'Mô tả không được để trống'),
  defectDescription: z.string().min(1, 'Mô tả lỗi không được để trống'),
  type: z.number().min(1).max(3),
  claimAmount: z.number().min(0, 'Số tiền yêu cầu phải lớn hơn hoặc bằng 0'),
  attachments: z.string().optional().or(z.literal('')),
  deviceId: z.number().min(1, 'Thiết bị không hợp lệ'),
  customerId: z.number().min(1, 'Khách hàng không hợp lệ'),
});

const updateWarrantySchema = z.object({
  id: z.number(),
  title: z.string().min(1, 'Tiêu đề không được để trống').max(200),
  description: z.string().min(1, 'Mô tả không được để trống'),
  defectDescription: z.string().min(1, 'Mô tả lỗi không được để trống'),
  type: z.number().min(1).max(3),
  status: z.number().min(1).max(7),
  approvedDate: z.string().optional().or(z.literal('')),
  resolvedDate: z.string().optional().or(z.literal('')),
  claimAmount: z.number().min(0),
  approvedAmount: z.number().min(0),
  resolution: z.string().optional().or(z.literal('')),
  rejectionReason: z.string().optional().or(z.literal('')),
  attachments: z.string().optional().or(z.literal('')),
  processedById: z.number().optional(),
});

const statusUpdateSchema = z.object({
  id: z.number(),
  status: z.number().min(1).max(7),
  comment: z.string().min(1, 'Nhận xét không được để trống khi thay đổi trạng thái'),
  approvedAmount: z.number().min(0).optional(),
  resolution: z.string().optional().or(z.literal('')),
  rejectionReason: z.string().optional().or(z.literal('')),
});

type WarrantyForm = z.infer<typeof warrantySchema>;
type UpdateWarrantyForm = z.infer<typeof updateWarrantySchema>;
type StatusUpdateForm = z.infer<typeof statusUpdateSchema>;

export function WarrantyClaimsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | ''>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [editingClaim, setEditingClaim] = useState<WarrantyClaim | null>(null);
  const [viewingClaim, setViewingClaim] = useState<WarrantyClaim | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<WarrantyClaim | null>(null);

  const { data: result, isLoading } = useQuery({
    queryKey: ['warranty', page, pageSize, search, statusFilter],
    queryFn: () => warrantyApi.getAll({ page, pageSize, search, status: statusFilter || undefined }).then(r => r.data as WarrantyClaimPagedResult),
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

  const createMutation = useMutation({
    mutationFn: (data: CreateWarrantyClaimDto) => warrantyApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warranty'] });
      toast.success('Tạo yêu cầu bảo hành thành công');
      setIsModalOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Tạo yêu cầu bảo hành thất bại'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateWarrantyClaimDto) => warrantyApi.update(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warranty'] });
      toast.success('Cập nhật yêu cầu bảo hành thành công');
      setIsModalOpen(false);
      setEditingClaim(null);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Cập nhật yêu cầu bảo hành thất bại'),
  });

  const statusMutation = useMutation({
    mutationFn: (data: WarrantyClaimStatusUpdateDto) => warrantyApi.updateStatus(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warranty'] });
      toast.success('Cập nhật trạng thái thành công');
      setIsStatusModalOpen(false);
      setUpdatingStatus(null);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Cập nhật trạng thái thất bại'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => warrantyApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warranty'] });
      toast.success('Xóa yêu cầu bảo hành thành công');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Xóa yêu cầu bảo hành thất bại'),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<WarrantyForm>({
    resolver: zodResolver(warrantySchema),
    defaultValues: {
      title: '',
      description: '',
      defectDescription: '',
      type: 1,
      claimAmount: 0,
      attachments: '',
      deviceId: 0,
      customerId: 0,
    },
  });

  const { register: registerStatus, handleSubmit: handleSubmitStatus, reset: resetStatus, formState: { errors: statusErrors } } = useForm<StatusUpdateForm>({
    resolver: zodResolver(statusUpdateSchema),
    defaultValues: {
      id: 0,
      status: 1,
      comment: '',
      approvedAmount: 0,
      resolution: '',
      rejectionReason: '',
    },
  });

  const onSubmit = (data: WarrantyForm) => {
    const submitData = {
      title: data.title,
      description: data.description,
      defectDescription: data.defectDescription,
      type: data.type,
      claimAmount: data.claimAmount,
      attachments: data.attachments,
      deviceId: data.deviceId,
      customerId: data.customerId,
    };
    createMutation.mutate(submitData);
  };

  const onSubmitStatus = (data: StatusUpdateForm) => {
    const submitData = {
      id: data.id,
      status: data.status,
      comment: data.comment,
      approvedAmount: data.approvedAmount,
      resolution: data.resolution,
      rejectionReason: data.rejectionReason,
    };
    statusMutation.mutate(submitData);
  };

  const openCreateModal = () => {
    setEditingClaim(null);
    reset({
      title: '',
      description: '',
      defectDescription: '',
      type: 1,
      claimAmount: 0,
      attachments: '',
      deviceId: devices?.[0]?.id || 0,
      customerId: customers?.[0]?.id || 0,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (claim: WarrantyClaim) => {
    setEditingClaim(claim);
    reset({
      title: claim.title,
      description: claim.description,
      defectDescription: claim.defectDescription,
      type: claim.type,
      claimAmount: claim.claimAmount,
      attachments: claim.attachments || '',
      deviceId: claim.deviceId,
      customerId: claim.customerId,
    });
    setIsModalOpen(true);
  };

  const openViewModal = (claim: WarrantyClaim) => {
    setViewingClaim(claim);
  };

  const openStatusModal = (claim: WarrantyClaim) => {
    setUpdatingStatus(claim);
    resetStatus({
      id: claim.id,
      status: claim.status,
      comment: '',
      approvedAmount: claim.approvedAmount,
      resolution: claim.resolution || '',
      rejectionReason: claim.rejectionReason || '',
    });
    setIsStatusModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa yêu cầu bảo hành này?')) {
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý bảo hành</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Danh sách yêu cầu bảo hành thiết bị</p>
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
              <option value={1}>Đã nộp</option>
              <option value={2}>Đang xem xét</option>
              <option value={3}>Đã duyệt</option>
              <option value={4}>Đang xử lý</option>
              <option value={5}>Đã giải quyết</option>
              <option value={6}>Từ chối</option>
              <option value={7}>Đã hủy</option>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mã BH</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tiêu đề</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Loại</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Thiết bị</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Khách hàng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ngày nộp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Số tiền</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {result?.items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    Không tìm thấy yêu cầu bảo hành nào
                  </td>
                </tr>
              ) : (
                result?.items.map((claim) => (
                  <tr key={claim.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-gray-900 dark:text-white">{claim.claimCode}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white max-w-xs truncate">{claim.title}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">{getWarrantyTypeLabel(claim.type)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getWarrantyStatusColor(claim.status)}`}>
                        {getWarrantyStatusLabel(claim.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{claim.deviceName}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{claim.customerName}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
                      {format(new Date(claim.claimDate), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                      {claim.claimAmount.toLocaleString('vi-VN')} VNĐ
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openViewModal(claim)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(claim)}
                          className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openStatusModal(claim)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                          title="Cập nhật trạng thái"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(claim.id)}
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
                {editingClaim ? 'Chỉnh sửa yêu cầu bảo hành' : 'Tạo yêu cầu bảo hành mới'}
              </h2>
              <button
                onClick={() => { setIsModalOpen(false); setEditingClaim(null); }}
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
                    placeholder="VD: Yêu cầu bảo hành màn hình"
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
                    placeholder="Mô tả chi tiết yêu cầu..."
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mô tả lỗi *</label>
                  <textarea
                    {...register('defectDescription')}
                    rows={3}
                    className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.defectDescription ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Mô tả chi tiết lỗi/hỏng hóc của thiết bị..."
                  />
                  {errors.defectDescription && <p className="mt-1 text-sm text-red-500">{errors.defectDescription.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loại yêu cầu *</label>
                  <select
                    {...register('type', { valueAsNumber: true })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={1}>Sửa chữa</option>
                    <option value={2}>Đổi mới</option>
                    <option value={3}>Hoàn tiền</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số tiền yêu cầu (VNĐ) *</label>
                  <input
                    {...register('claimAmount', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    step="10000"
                    className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.claimAmount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="0"
                  />
                  {errors.claimAmount && <p className="mt-1 text-sm text-red-500">{errors.claimAmount.message}</p>}
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Đính kèm (link/file)</label>
                <input
                  {...register('attachments')}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Link Google Drive, OneDrive, hoặc đường dẫn file..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setEditingClaim(null); }}
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
                <p className="text-sm text-gray-500 dark:text-gray-400">Mã BH: {updatingStatus.claimCode}</p>
                <p className="font-medium text-gray-900 dark:text-white">{updatingStatus.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trạng thái mới *</label>
                <select
                  {...registerStatus('status', { valueAsNumber: true })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value={1}>Đã nộp</option>
                  <option value={2}>Đang xem xét</option>
                  <option value={3}>Đã duyệt</option>
                  <option value={4}>Đang xử lý</option>
                  <option value={5}>Đã giải quyết</option>
                  <option value={6}>Từ chối</option>
                  <option value={7}>Đã hủy</option>
                </select>
                {statusErrors.status && <p className="mt-1 text-sm text-red-500">{statusErrors.status.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nhận xét *</label>
                <textarea
                  {...registerStatus('comment')}
                  rows={2}
                  className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    statusErrors.comment ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Nhận xét về thay đổi trạng thái..."
                />
                {statusErrors.comment && <p className="mt-1 text-sm text-red-500">{statusErrors.comment.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số tiền duyệt (VNĐ)</label>
                <input
                  {...registerStatus('approvedAmount', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="10000"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phương án giải quyết</label>
                <textarea
                  {...registerStatus('resolution')}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Mô tả cách thức giải quyết..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lý do từ chối</label>
                <textarea
                  {...registerStatus('rejectionReason')}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Lý do từ chối yêu cầu..."
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
      {viewingClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-in">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Chi tiết yêu cầu bảo hành</h2>
              <button
                onClick={() => setViewingClaim(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Mã bảo hành</p>
                  <p className="font-mono text-lg text-gray-900 dark:text-white">{viewingClaim.claimCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tiêu đề</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingClaim.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Loại</p>
                  <p className="font-medium text-gray-900 dark:text-white">{getWarrantyTypeLabel(viewingClaim.type)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Trạng thái</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getWarrantyStatusColor(viewingClaim.status)}`}>
                    {getWarrantyStatusLabel(viewingClaim.status)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Thiết bị</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingClaim.deviceName} ({viewingClaim.deviceCode})</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Khách hàng</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingClaim.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Người xử lý</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingClaim.processedByName || 'Chưa phân công'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ngày nộp</p>
                  <p className="font-medium text-gray-900 dark:text-white">{format(new Date(viewingClaim.claimDate), 'dd/MM/yyyy HH:mm')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ngày duyệt</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingClaim.approvedDate ? format(new Date(viewingClaim.approvedDate), 'dd/MM/yyyy HH:mm') : 'Chưa duyệt'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ngày giải quyết</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingClaim.resolvedDate ? format(new Date(viewingClaim.resolvedDate), 'dd/MM/yyyy HH:mm') : 'Chưa giải quyết'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Số tiền yêu cầu</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingClaim.claimAmount.toLocaleString('vi-VN')} VNĐ</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Số tiền duyệt</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingClaim.approvedAmount.toLocaleString('vi-VN')} VNĐ</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Mô tả</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingClaim.description}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Mô tả lỗi</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingClaim.defectDescription}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phương án giải quyết</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingClaim.resolution || 'Chưa có'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Lý do từ chối</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingClaim.rejectionReason || 'Không có'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Đính kèm</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingClaim.attachments || 'Không có'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ngày tạo</p>
                  <p className="font-medium text-gray-900 dark:text-white">{format(new Date(viewingClaim.createdAt), 'dd/MM/yyyy HH:mm')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
