// Types for the application

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Customer {
  id: number;
  code: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  taxCode?: string;
  companyName?: string;
  type: number;
  notes?: string;
  createdAt: string;
}

export type CustomerPagedResult = PagedResult<Customer>;

export interface CreateCustomerDto {
  code: string;
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  taxCode?: string;
  companyName?: string;
  type: number;
  notes?: string;
}

export interface UpdateCustomerDto extends CreateCustomerDto {
  id: number;
}

export interface Device {
  id: number;
  code: string;
  serialNumber: string;
  name: string;
  model: string;
  brand: string;
  category: number;
  purchaseDate: string;
  warrantyExpiryDate?: string;
  purchasePrice: number;
  specifications?: string;
  status: number;
  location?: string;
  notes?: string;
  customerId: number;
  customerName: string;
  createdAt: string;
}

export type DevicePagedResult = PagedResult<Device>;

export interface CreateDeviceDto {
  code: string;
  serialNumber: string;
  name: string;
  model?: string;
  brand?: string;
  category: number;
  purchaseDate: string;
  warrantyExpiryDate?: string;
  purchasePrice: number;
  specifications?: string;
  status: number;
  location?: string;
  notes?: string;
  customerId: number;
}

export interface UpdateDeviceDto extends CreateDeviceDto {
  id: number;
}

export interface DeviceWarrantyExpiry {
  id: number;
  code: string;
  name: string;
  serialNumber: string;
  warrantyExpiryDate: string;
  daysRemaining: number;
  customerName: string;
  customerPhone: string;
}

export interface MaintenanceRequest {
  id: number;
  requestCode: string;
  title: string;
  description: string;
  type: number;
  priority: number;
  status: number;
  requestDate: string;
  scheduledDate?: string;
  startedAt?: string;
  completedAt?: string;
  estimatedCost: number;
  actualCost: number;
  technicianNotes?: string;
  customerNotes?: string;
  replacementParts?: string;
  deviceId: number;
  deviceName: string;
  deviceCode: string;
  customerId: number;
  customerName: string;
  assignedTechnicianId?: number;
  technicianName?: string;
  createdAt: string;
}

export type MaintenanceRequestPagedResult = PagedResult<MaintenanceRequest>;

export interface CreateMaintenanceRequestDto {
  title: string;
  description: string;
  type: number;
  priority: number;
  scheduledDate?: string;
  estimatedCost: number;
  customerNotes?: string;
  deviceId: number;
  customerId: number;
}

export interface UpdateMaintenanceRequestDto {
  id: number;
  title: string;
  description: string;
  type: number;
  priority: number;
  status: number;
  scheduledDate?: string;
  startedAt?: string;
  completedAt?: string;
  estimatedCost: number;
  actualCost: number;
  technicianNotes?: string;
  customerNotes?: string;
  replacementParts?: string;
  assignedTechnicianId?: number;
}

export interface MaintenanceRequestStatusUpdateDto {
  id: number;
  status: number;
  technicianNotes?: string;
  startedAt?: string;
  completedAt?: string;
  actualCost?: number;
  replacementParts?: string;
}

export interface WarrantyClaim {
  id: number;
  claimCode: string;
  title: string;
  description: string;
  defectDescription: string;
  type: number;
  status: number;
  claimDate: string;
  approvedDate?: string;
  resolvedDate?: string;
  claimAmount: number;
  approvedAmount: number;
  resolution?: string;
  rejectionReason?: string;
  attachments?: string;
  deviceId: number;
  deviceName: string;
  deviceCode: string;
  customerId: number;
  customerName: string;
  processedById?: number;
  processedByName?: string;
  createdAt: string;
}

export type WarrantyClaimPagedResult = PagedResult<WarrantyClaim>;

export interface CreateWarrantyClaimDto {
  title: string;
  description: string;
  defectDescription: string;
  type: number;
  claimAmount: number;
  attachments?: string;
  deviceId: number;
  customerId: number;
}

export interface UpdateWarrantyClaimDto {
  id: number;
  title: string;
  description: string;
  defectDescription: string;
  type: number;
  status: number;
  approvedDate?: string;
  resolvedDate?: string;
  claimAmount: number;
  approvedAmount: number;
  resolution?: string;
  rejectionReason?: string;
  attachments?: string;
  processedById?: number;
}

export interface WarrantyClaimStatusUpdateDto {
  id: number;
  status: number;
  comment: string;
  approvedAmount?: number;
  resolution?: string;
  rejectionReason?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  avatarUrl?: string;
  role: number;
  isActive: boolean;
  createdAt: string;
}

export const getRoleLabel = (role: number): string => {
  const labels: Record<number, string> = {
    1: 'Quản trị viên',
    2: 'Quản lý',
    3: 'Kỹ thuật viên',
    4: 'Khách hàng',
  };
  return labels[role] || 'Không xác định';
};

// Enums
export const CustomerType = {
  Individual: 1,
  Company: 2,
} as const;

export const DeviceCategory = {
  Computer: 1,
  Printer: 2,
  Scanner: 3,
  Network: 4,
  Server: 5,
  Peripheral: 6,
  Other: 7,
} as const;

export const DeviceStatus = {
  Active: 1,
  UnderMaintenance: 2,
  UnderWarranty: 3,
  Retired: 4,
  Lost: 5,
} as const;

export const MaintenanceType = {
  Preventive: 1,
  Corrective: 2,
  Emergency: 3,
  Upgrade: 4,
} as const;

export const MaintenancePriority = {
  Low: 1,
  Normal: 2,
  High: 3,
  Critical: 4,
} as const;

export const MaintenanceStatus = {
  Pending: 1,
  Approved: 2,
  Scheduled: 3,
  InProgress: 4,
  WaitingParts: 5,
  Completed: 6,
  Cancelled: 7,
  Rejected: 8,
} as const;

export const WarrantyClaimType = {
  Repair: 1,
  Replacement: 2,
  Refund: 3,
} as const;

export const WarrantyClaimStatus = {
  Submitted: 1,
  UnderReview: 2,
  Approved: 3,
  InProgress: 4,
  Resolved: 5,
  Rejected: 6,
  Cancelled: 7,
} as const;

export const UserRole = {
  Admin: 1,
  Manager: 2,
  Technician: 3,
  Customer: 4,
} as const;

// Helper functions
export const getDeviceCategoryLabel = (category: number): string => {
  const labels: Record<number, string> = {
    1: 'Máy tính/Laptop',
    2: 'Máy in',
    3: 'Máy quét',
    4: 'Thiết bị mạng',
    5: 'Server',
    6: 'Thiết bị ngoại vi',
    7: 'Khác',
  };
  return labels[category] || 'Không xác định';
};

export const getDeviceStatusLabel = (status: number): string => {
  const labels: Record<number, string> = {
    1: 'Đang sử dụng',
    2: 'Đang bảo trì',
    3: 'Đang bảo hành',
    4: 'Đã thanh lý',
    5: 'Mất/Hỏng',
  };
  return labels[status] || 'Không xác định';
};

export const getDeviceStatusColor = (status: number): string => {
  const colors: Record<number, string> = {
    1: 'bg-green-100 text-green-800',
    2: 'bg-yellow-100 text-yellow-800',
    3: 'bg-blue-100 text-blue-800',
    4: 'bg-gray-100 text-gray-800',
    5: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getMaintenanceStatusLabel = (status: number): string => {
  const labels: Record<number, string> = {
    1: 'Chờ duyệt',
    2: 'Đã duyệt',
    3: 'Đã lên lịch',
    4: 'Đang thực hiện',
    5: 'Chờ linh kiện',
    6: 'Hoàn thành',
    7: 'Đã hủy',
    8: 'Từ chối',
  };
  return labels[status] || 'Không xác định';
};

export const getMaintenanceStatusColor = (status: number): string => {
  const colors: Record<number, string> = {
    1: 'bg-gray-100 text-gray-800',
    2: 'bg-blue-100 text-blue-800',
    3: 'bg-indigo-100 text-indigo-800',
    4: 'bg-yellow-100 text-yellow-800',
    5: 'bg-orange-100 text-orange-800',
    6: 'bg-green-100 text-green-800',
    7: 'bg-red-100 text-red-800',
    8: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getWarrantyStatusLabel = (status: number): string => {
  const labels: Record<number, string> = {
    1: 'Đã nộp',
    2: 'Đang xem xét',
    3: 'Đã duyệt',
    4: 'Đang xử lý',
    5: 'Đã giải quyết',
    6: 'Từ chối',
    7: 'Đã hủy',
  };
  return labels[status] || 'Không xác định';
};

export const getWarrantyStatusColor = (status: number): string => {
  const colors: Record<number, string> = {
    1: 'bg-gray-100 text-gray-800',
    2: 'bg-blue-100 text-blue-800',
    3: 'bg-green-100 text-green-800',
    4: 'bg-yellow-100 text-yellow-800',
    5: 'bg-green-100 text-green-800',
    6: 'bg-red-100 text-red-800',
    7: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getPriorityLabel = (priority: number): string => {
  const labels: Record<number, string> = {
    1: 'Thấp',
    2: 'Bình thường',
    3: 'Cao',
    4: 'Khẩn cấp',
  };
  return labels[priority] || 'Không xác định';
};

export const getPriorityColor = (priority: number): string => {
  const colors: Record<number, string> = {
    1: 'bg-gray-100 text-gray-800',
    2: 'bg-blue-100 text-blue-800',
    3: 'bg-yellow-100 text-yellow-800',
    4: 'bg-red-100 text-red-800',
  };
  return colors[priority] || 'bg-gray-100 text-gray-800';
};

export const getMaintenanceTypeLabel = (type: number): string => {
  const labels: Record<number, string> = {
    1: 'Bảo trì định kỳ',
    2: 'Bảo trì sửa chữa',
    3: 'Khẩn cấp',
    4: 'Nâng cấp',
  };
  return labels[type] || 'Không xác định';
};

export const getWarrantyTypeLabel = (type: number): string => {
  const labels: Record<number, string> = {
    1: 'Sửa chữa',
    2: 'Đổi mới',
    3: 'Hoàn tiền',
  };
  return labels[type] || 'Không xác định';
};

export const getCustomerTypeLabel = (type: number): string => {
  return type === 1 ? 'Cá nhân' : 'Doanh nghiệp';
};
