import { useState, useEffect, useCallback } from "react";
import { employeesApi } from "../api/employees";
import type { EmployeeResponseDto } from "../types";

export function useEmployees() {
  const [employees, setEmployees] = useState<EmployeeResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await employeesApi.getAll();
      setEmployees(data);
      setError(null);
    } catch (err) {
      setError("Не удалось загрузить список сотрудников");
      console.error("Error reloading employees:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const data = await employeesApi.getAll();
        if (isMounted) {
          setEmployees(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError("Не удалось загрузить список сотрудников");
          console.error("Error loading employees:", err);
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
  }, []);

  return {
    employees,
    loading,
    error,
    reload,
  };
}
