// src/api/memberships.ts
import apiClient from "./apiClient";
import type { MembershipResponseDto, CreateMembershipDto } from "../types";

// Интерфейс для параметров фильтрации
export interface MembershipsFilter {
  clientId?: number;
  status?: string;
}

export const membershipsApi = {
  // Получить все абонементы с опциональной фильтрацией
  getAll: (filter?: MembershipsFilter) => {
    return apiClient.get<MembershipResponseDto[]>("/memberships", {
      params: filter,
    });
  },

  // Получить абонемент по ID
  getById: (id: number) => {
    return apiClient.get<MembershipResponseDto>(`/memberships/${id}`);
  },

  // Создать абонемент
  create: (data: CreateMembershipDto) => {
    return apiClient.post<MembershipResponseDto>("/memberships", data);
  },
};
