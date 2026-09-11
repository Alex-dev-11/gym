import apiClient from "./apiClient";
import type { MembershipResponseDto, CreateMembershipDto } from "../types";

export interface MembershipsFilter {
  clientId?: number;
  status?: string;
}

export const membershipsApi = {
  getAll: async (filter?: MembershipsFilter) => {
    const response = await apiClient.get<MembershipResponseDto[]>(
      "/memberships",
      {
        params: filter,
      },
    );
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get<MembershipResponseDto>(
      `/memberships/${id}`,
    );
    return response.data;
  },

  create: async (data: CreateMembershipDto) => {
    const response = await apiClient.post<MembershipResponseDto>(
      "/memberships",
      data,
    );
    return response.data;
  },
};
