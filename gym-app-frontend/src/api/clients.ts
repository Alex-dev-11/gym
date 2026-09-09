// src/api/clients.ts
import apiClient from "./client";
import type {
  ClientResponseDto,
  CreateClientDto,
  UpdateClientDto,
} from "../types";

// 1. ДОБАВЛЕНО: Интерфейс для параметров фильтрации
export interface ClientsFilter {
  search?: string;
  status?: string;
}

export const clientsApi = {
  // 2. ИЗМЕНЕНО: Добавлен параметр filter и объект { params: filter }
  getAll: (filter?: ClientsFilter) => {
    return apiClient.get<ClientResponseDto[]>("/clients", {
      params: filter, // Axios сам превратит объект в строку: ?search=Иван&status=active
    });
  },

  // Остальное без изменений
  getById: (id: number) => {
    return apiClient.get<ClientResponseDto>(`/clients/${id}`);
  },

  create: (data: CreateClientDto) => {
    return apiClient.post<ClientResponseDto>("/clients", data);
  },

  update: (id: number, data: UpdateClientDto) => {
    return apiClient.put<ClientResponseDto>(`/clients/${id}`, data);
  },

  delete: (id: number) => {
    return apiClient.delete(`/clients/${id}`);
  },
};
