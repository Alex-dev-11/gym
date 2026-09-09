import httpClient from "./apiClient";
import type { EmployeeResponseDto } from "../types";

export const employeesApi = {
  getActiveTrainers: async (): Promise<EmployeeResponseDto[]> => {
    const response = await httpClient.get<EmployeeResponseDto[]>(
      "/employees/trainers",
    );
    return response.data;
  },
};
