import apiClient from "./apiClient";
import type {
  EmployeeResponseDto,
  CreateEmployeeDto,
  UpdateEmployeeDto,
} from "../types";

export const employeesApi = {
  getAll: async () => {
    const response = await apiClient.get<EmployeeResponseDto[]>("/employees");
    return response.data;
  },

  // Этот метод у вас уже был, оставляем для совместимости
  getActiveTrainers: async () => {
    const response = await apiClient.get<EmployeeResponseDto[]>(
      "/employees/trainers",
    );
    return response.data;
  },

  create: async (data: CreateEmployeeDto) => {
    const response = await apiClient.post<EmployeeResponseDto>(
      "/employees",
      data,
    );
    return response.data;
  },

  update: async (id: number, data: UpdateEmployeeDto) => {
    const response = await apiClient.put<EmployeeResponseDto>(
      `/employees/${id}`,
      data,
    );
    return response.data;
  },

  delete: async (id: number) => {
    await apiClient.delete(`/employees/${id}`);
  },
};
