export type UserRole = '管理员' | '普通用户'
export type UserStatus = '启用' | '停用'

export type UserAccount = {
  id: string
  username: string
  displayName: string
  role: UserRole
  status: UserStatus
  passwordHash?: string
  avatarColor?: string
  phoneMasked: string
  createdAt: string
  lastLoginAt?: string
}

export type AuditLog = {
  id: string
  actor: string
  role: string
  action: string
  targetTable: string
  targetId: string
  detail: string
  createdAt: string
}

export type AuthUser = Omit<UserAccount, 'passwordHash'> & {
  avatarColor?: string
}

export type LoginCredentials = {
  username: string
  password: string
}

export type RegisterPayload = {
  username: string
  password: string
  displayName: string
  phone: string
}
