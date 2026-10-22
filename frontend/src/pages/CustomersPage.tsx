import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, customerApi } from '../lib/api';
import { Customer, CreateCustomerDto, UpdateCustomerDto, CustomerPagedResult, getCustomerTypeLabel } from '../types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  Plus, Search, Edit, Trash2, Eye, ChevronLeft, ChevronRight,
  User, Phone, Mail, Building, AlertCircle, X
} from 'lucide-react';
import { format } from 'date-fns';

const customerSchema = z.object({
  code: z.string().min(1, 'Mã khách hàng không được để trống').max(20),
  fullName: z.string().min(1, 'Họ tên không được để trống').max(100),
  phone: z.string().min(1, 'Số điện thoại không được để trống').max(20),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  taxCode: z.string().max(20).optional().or(z.literal('')),
  companyName: z.string().max(200).optional().or(z.literal('')),
  type: z.number().min(1).max(2),
  notes: z.string().optional().or(z.literal('')),
});

type CustomerForm = z.infer<typeof customerSchema>;

export function CustomersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);

  const { data: result, isLoading } = useQuery({
    queryKey: ['customers', page, pageSize, search],
    queryFn: () => customerApi.getAll({ page, pageSize, search }).then(r => r.data as CustomerPagedResult),
    placeholderData: (previous) => previous,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCustomerDto) => customerApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Tạo khách hàng thành công');
      setIsModalOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Tạo khách hàng thất bại'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateCustomerDto) => customerApi.update(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Cập nhật khách hàng thành công');
      setIsModalOpen(false);
      setEditingCustomer(null);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Cập nhật khách hàng thất bại'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => customerApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Xóa khách hàng thành công');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Xóa khách hàng thất bại'),
  });

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      code: '',
      fullName: '',
      phone: '',
      email: '',
      address: '',
      taxCode: '',
      companyName: '',
      type: 1,
      notes: '',
    },
  });

  const onSubmit = (data: CustomerForm) => {
    const submitData = {
      code: data.code,
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      address: data.address,
      taxCode: data.taxCode,
      companyName: data.companyName,
      type: data.type,
      notes: data.notes,
    };
    if (editingCustomer) {
      updateMutation.mutate({ ...submitData, id: editingCustomer.id });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const openCreateModal = () => {
    setEditingCustomer(null);
    reset({
      code: '',
      fullName: '',
      phone: '',
      email: '',
      address: '',
      taxCode: '',
      companyName: '',
      type: 1,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    reset({
      code: customer.code,
      fullName: customer.fullName,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
      taxCode: customer.taxCode || '',
      companyName: customer.companyName || '',
      type: customer.type,
      notes: customer.notes || '',
    });
    setIsModalOpen(true);
  };

  const openViewModal = (customer: Customer) => {
    setViewingCustomer(customer);
  };

  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý khách hàng</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Danh sách khách hàng và thông tin chi tiết</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Thêm khách hàng
        </button>
      </div>

      {/* Search & Filter */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã, tên, điện thoại, email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mã KH</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Họ tên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Loại</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Điện thoại</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Địa chỉ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ngày tạo</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {result?.items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    Không tìm thấy khách hàng nào
                  </td>
                </tr>
              ) : (
                result?.items.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-gray-900 dark:text-white">{customer.code}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{customer.fullName}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        {customer.type === 1
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}">
                        {getCustomerTypeLabel(customer.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{customer.phone}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{customer.email || '-'}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 max-w-xs truncate">{customer.address || '-'}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
                      {format(new Date(customer.createdAt), 'dd/MM/yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openViewModal(customer)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(customer)}
                          className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
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
                {editingCustomer ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}
              </h2>
              <button
                onClick={() => { setIsModalOpen(false); setEditingCustomer(null); }}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mã khách hàng *</label>
                  <input
                    {...register('code')}
                    className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.code ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="VD: KH001"
                    disabled={!!editingCustomer}
                  />
                  {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Họ tên *</label>
                  <input
                    {...register('fullName')}
                    className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.fullName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Nguyễn Văn A"
                  />
                  {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số điện thoại *</label>
                  <input
                    {...register('phone')}
                    className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="0901234567"
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    {...register('email')}
                    className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="nguyenvana@email.com"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loại khách hàng *</label>
                  <select
                    {...register('type', { valueAsNumber: true })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={1}>Cá nhân</option>
                    <option value={2}>Doanh nghiệp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mã số thuế</label>
                  <input
                    {...register('taxCode')}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Chỉ cho doanh nghiệp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên công ty</label>
                  <input
                    {...register('companyName')}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Chỉ cho doanh nghiệp"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Địa chỉ</label>
                <textarea
                  {...register('address')}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Địa chỉ liên hệ"
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
                  onClick={() => { setIsModalOpen(false); setEditingCustomer(null); }}
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
      {viewingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-in">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Chi tiết khách hàng</h2>
              <button
                onClick={() => setViewingCustomer(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Mã khách hàng</p>
                  <p className="font-mono text-lg text-gray-900 dark:text-white">{viewingCustomer.code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Loại</p>
                  <p className="font-medium text-gray-900 dark:text-white">{getCustomerTypeLabel(viewingCustomer.type)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Họ tên</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingCustomer.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Điện thoại</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingCustomer.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingCustomer.email || 'Chưa cung cấp'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Địa chỉ</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingCustomer.address || 'Chưa cung cấp'}</p>
                </div>
                {viewingCustomer.taxCode && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Mã số thuế</p>
                    <p className="font-medium text-gray-900 dark:text-white">{viewingCustomer.taxCode}</p>
                  </div>
                )}
                {viewingCustomer.companyName && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tên công ty</p>
                    <p className="font-medium text-gray-900 dark:text-white">{viewingCustomer.companyName}</p>
                  </div>
                )}
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ghi chú</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingCustomer.notes || 'Không có'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ngày tạo</p>
                  <p className="font-medium text-gray-900 dark:text-white">{format(new Date(viewingCustomer.createdAt), 'dd/MM/yyyy HH:mm')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
