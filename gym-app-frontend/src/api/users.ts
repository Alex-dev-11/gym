import apiClient from "./apiClient";
import type { UserResponseDto, CreateUserDto, UpdateUserDto } from "../types";

export const usersApi = {
  getAll: async (): Promise<UserResponseDto[]> => {
    const response = await apiClient.get<UserResponseDto[]>("/users");
    return response.data;
  },

  create: async (data: CreateUserDto): Promise<UserResponseDto> => {
    const response = await apiClient.post<UserResponseDto>("/users", data);
    return response.data;
  },
  
  update: async (id: number, data: UpdateUserDto) => {
    const response = await apiClient.put<UserResponseDto>(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  updateStatus: async (id: number, isActive: boolean) => {
    await apiClient.patch(`/users/${id}/status`, { isActive });
  },
};
