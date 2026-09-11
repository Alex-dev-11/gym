import { useState, useEffect, useCallback } from "react";
import { membershipsApi, type MembershipsFilter } from "../api/memberships";
import type { MembershipResponseDto } from "../types";

export function useMemberships(initialFilter?: MembershipsFilter) {
  const [memberships, setMemberships] = useState<MembershipResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<MembershipsFilter>(initialFilter || {});

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await membershipsApi.getAll(filter);
      setMemberships(data);
      setError(null);
    } catch (err) {
      setError("Не удалось загрузить список абонементов");
      console.error("Error reloading memberships:", err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const data = await membershipsApi.getAll(filter);
        if (isMounted) {
          setMemberships(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError("Не удалось загрузить список абонементов");
          console.error("Error loading memberships:", err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [filter]);

  const updateFilter = useCallback((newFilter: MembershipsFilter) => {
    setFilter(newFilter);
  }, []);

  return {
    memberships,
    loading,
    error,
    filter,
    reload,
    updateFilter,
  };
}
