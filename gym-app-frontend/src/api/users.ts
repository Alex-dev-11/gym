import apiClient from "./apiClient";
import type { UserResponseDto, CreateUserDto } from "../types";

export const usersApi = {
  getAll: async (): Promise<UserResponseDto[]> => {
    const response = await apiClient.get<UserResponseDto[]>("/users");
    return response.data;
  },

  create: async (data: CreateUserDto): Promise<UserResponseDto> => {
    const response = await apiClient.post<UserResponseDto>("/users", data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};
