import apiClient from "./apiClient";
import type { VisitResponseDto, CreateVisitDto, VisitsFilter } from "../types";

export const visitsApi = {
  getAll: async (filter?: VisitsFilter): Promise<VisitResponseDto[]> => {
    const response = await apiClient.get<VisitResponseDto[]>("/visits", {
      params: filter,
    });
    return response.data;
  },

  create: async (data: CreateVisitDto): Promise<VisitResponseDto> => {
    const response = await apiClient.post<VisitResponseDto>("/visits", data);
    return response.data;
  },
};
