// src/types/index.ts

// ===== КЛИЕНТЫ =====
export interface ClientResponseDto {
  id: number;
  lastName: string;
  firstName: string;
  patronymic?: string;
  phone: string;
  email?: string;
  registrationDate: string; // DateTime приходит как ISO-строка
  status: string; // 'active' | 'inactive' | 'blacklisted'
  isDeleted: boolean;
}

export interface CreateClientDto {
  lastName: string;
  firstName: string;
  patronymic?: string;
  phone: string;
  email?: string;
}

export interface UpdateClientDto {
  lastName?: string;
  firstName?: string;
  patronymic?: string;
  phone?: string;
  email?: string;
  status?: string;
}

// ===== АБОНЕМЕНТЫ =====
export interface MembershipResponseDto {
  id: number;
  clientId: number;
  type: string; // 'single' | 'month' | 'year'
  startDate: string;
  endDate: string;
  totalVisits: number;
  usedVisits: number;
  status: string; // 'active' | 'completed' | 'expired' | 'cancelled'
}

export interface CreateMembershipDto {
  clientId: number;
  type: string;
  startDate: string; // Формат YYYY-MM-DD
}

// ===== ПОСЕЩЕНИЯ =====
export interface VisitResponseDto {
  id: number;
  membershipId: number;
  trainerId?: number;
  processedByUserId?: number;
  visitTime: string;
}

export interface CreateVisitDto {
  membershipId: number;
  trainerId?: number;
}

// ===== ОШИБКИ API =====
// Тип для стандартизированной ошибки от ExceptionHandlingMiddleware
export interface ApiError {
  error: string;
  statusCode: number;
}
