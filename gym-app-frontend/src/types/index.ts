// ============ КЛИЕНТЫ ============
export type ClientStatus = "active" | "inactive" | "blacklist";

// Единый источник истины для статусов клиентов
export const CLIENT_STATUSES: Record<
  ClientStatus,
  { label: string; color: string }
> = {
  active: { label: "Активный", color: "success" },
  inactive: { label: "Неактивный", color: "default" },
  blacklist: { label: "Чёрный список", color: "error" },
};

export interface ClientResponseDto {
  id: number;
  lastName: string;
  firstName: string;
  patronymic?: string;
  phone: string;
  email?: string;
  registrationDate: string;
  status: ClientStatus;
  isDeleted: boolean;
}

export interface CreateClientDto {
  lastName: string;
  firstName: string;
  patronymic?: string;
  phone: string;
  email?: string;
}

export interface UpdateClientDto extends Partial<CreateClientDto> {
  status?: ClientStatus;
  isDeleted?: boolean;
}

// ============ АБОНЕМЕНТЫ ============
export type MembershipType = "single" | "month" | "year";
export type MembershipStatus = "active" | "completed" | "expired" | "cancelled";

// Единый источник истины для типов абонементов
export const MEMBERSHIP_TYPES: Record<
  MembershipType,
  { label: string; shortLabel: string; tableLabel: string; color: string }
> = {
  single: {
    label: "Разовое посещение",
    shortLabel: "1",
    tableLabel: "Разовый",
    color: "blue",
  },
  month: {
    label: "Месяц (безлимит)",
    shortLabel: "М",
    tableLabel: "Месяц",
    color: "green",
  },
  year: {
    label: "Год (безлимит)",
    shortLabel: "Г",
    tableLabel: "Год",
    color: "gold",
  },
};

export const MEMBERSHIP_STATUSES: Record<
  MembershipStatus,
  { label: string; color: string }
> = {
  active: { label: "Активен", color: "green" },
  completed: { label: "Завершён", color: "blue" },
  expired: { label: "Истёк", color: "orange" },
  cancelled: { label: "Отменён", color: "red" },
};

export interface MembershipResponseDto {
  id: number;
  clientId: number;
  clientFullName: string;
  type: MembershipType;
  startDate: string;
  endDate: string;
  status: MembershipStatus;
  totalVisits: number;
  usedVisits: number;
}

export interface CreateMembershipDto {
  clientId: number;
  type: MembershipType;
  startDate: string;
}

export interface MembershipsFilter {
  clientId?: number;
  status?: string;
}

// ============ ПОСЕЩЕНИЯ ============
export interface VisitResponseDto {
  id: number;
  membershipId: number;
  clientFullName: string;
  membershipType: string;
  trainerName?: string;
  visitTime: string;
}

export interface CreateVisitDto {
  membershipId: number;
  trainerId?: number;
}

export interface VisitsFilter {
  membershipId?: number;
}

// ============ СОТРУДНИКИ ============
export interface EmployeeResponseDto {
  id: number;
  fullName: string;
}

// ============ АВТОРИЗАЦИЯ ============
export interface LoginDto {
  login: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
  login: string;
  role: string;
  fullName: string;
}

// ============ ПОЛЬЗОВАТЕЛИ ============
export interface UserResponseDto {
  id: number;
  login: string;
  role: string;
  fullName: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateUserDto {
  login: string;
  password: string;
  role: string;
  employeeId?: number;
}

// ============ РОЛИ ПОЛЬЗОВАТЕЛЕЙ ============
export type UserRole = "admin" | "operator";

export const USER_ROLES: Record<UserRole, { label: string; color: string }> = {
  admin: { label: "Администратор", color: "red" },
  operator: { label: "Оператор", color: "blue" },
};

// 

export type EmployeePosition = "administrator" | "trainer";

export const EMPLOYEE_POSITIONS: Record<EmployeePosition, { label: string }> = {
  administrator: { label: "Администратор" },
  trainer: { label: "Тренер" },
};

export interface EmployeeResponseDto {
  id: number;
  lastName: string;
  firstName: string;
  patronymic?: string;
  phone: string;
  position: EmployeePosition;
  isActive: boolean;
}

export interface CreateEmployeeDto {
  lastName: string;
  firstName: string;
  patronymic?: string;
  phone: string;
  position: EmployeePosition;
}

export interface UpdateEmployeeDto extends Partial<CreateEmployeeDto> {
  isActive?: boolean;
}