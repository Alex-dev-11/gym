import api from "./apiClient"; // Твой настроенный экземпляр Axios
import type { VisitResponseDto, CreateVisitDto, VisitsFilter } from "../types";

/**
 * Получение списка посещений с опциональной фильтрацией.
 * Параметры передаются через [FromQuery] на бэкенде.
 */
export const visitsApi = {
  getAll: async (filter?: VisitsFilter): Promise<VisitResponseDto[]> => {
    // Axios автоматически преобразует объект filter в query-строку: ?membershipId=5
    const response = await api.get<VisitResponseDto[]>("/api/visits", {
      params: filter,
    });
    return response.data;
  },

  /**
   * Регистрация нового посещения.
   * Бэкенд сам проверит статус абонемента, спишет визит и закроет абонемент при необходимости.
   */
  create: async (data: CreateVisitDto): Promise<VisitResponseDto> => {
    const response = await api.post<VisitResponseDto>("/api/visits", data);
    return response.data;
  },
};
