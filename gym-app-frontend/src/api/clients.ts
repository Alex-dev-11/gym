import apiClient from "./apiClient";
import type {
  ClientResponseDto,
  CreateClientDto,
  UpdateClientDto,
} from "../types";

export interface ClientsFilter {
  search?: string;
  status?: string;
}

export const clientsApi = {
  getAll: async (filter?: ClientsFilter) => {
    const response = await apiClient.get<ClientResponseDto[]>("/clients", {
      params: filter,
    });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get<ClientResponseDto>(`/clients/${id}`);
    return response.data;
  },

  create: async (data: CreateClientDto) => {
    const response = await apiClient.post<ClientResponseDto>("/clients", data);
    return response.data;
  },

  update: async (id: number, data: UpdateClientDto) => {
    const response = await apiClient.put<ClientResponseDto>(
      `/clients/${id}`,
      data,
    );
    return response.data;
  },

  delete: async (id: number) => {
    await apiClient.delete(`/clients/${id}`);
  },
};
