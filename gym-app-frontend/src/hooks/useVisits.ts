import { useState, useEffect, useCallback } from "react";
import { visitsApi } from "../api/visits";
import type { VisitResponseDto, VisitsFilter } from "../types";

export function useVisits(initialFilter?: VisitsFilter) {
  const [visits, setVisits] = useState<VisitResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<VisitsFilter>(initialFilter || {});

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await visitsApi.getAll(filter);
      setVisits(data);
      setError(null);
    } catch (err) {
      setError("Не удалось загрузить список посещений");
      console.error("Error reloading visits:", err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const data = await visitsApi.getAll(filter);
        if (isMounted) {
          setVisits(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError("Не удалось загрузить список посещений");
          console.error("Error loading visits:", err);
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

  const updateFilter = useCallback((newFilter: VisitsFilter) => {
    setFilter(newFilter);
  }, []);

  return {
    visits,
    loading,
    error,
    filter,
    reload,
    updateFilter,
  };
}
