export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  role?: 'individual' | 'institution' | 'admin'; // 个人账户、机构账户、管理员
  email?: string;
}

export interface AuthorizeUserRequest {
  userId: string;
  expiresAt: string; // ISO date string
}

export interface UpdatePermissionRequest {
  permissionId: string;
  expiresAt?: string;
  isActive?: boolean;
}

export interface UploadQualificationsRequest {
  institutionLicense: string; // 营业执照URL
  practiceLicense: string; // 许可证URL
  physicianCert: string; // 医师资格证URL
}

export interface AuditUserRequest {
  userId: string;
  auditStatus: 'approved' | 'rejected';
  auditRemark?: string;
}

export interface UpdateUserRequest {
  userId: string;
  username?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    role: string;
  };
}

export interface UserInfo {
  id: string;
  username: string;
  role: string;
  auditStatus?: string;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string | null;
  password?: string;
}
