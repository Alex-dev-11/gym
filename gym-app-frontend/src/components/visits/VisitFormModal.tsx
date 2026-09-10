import { useState, useEffect } from "react";
import { Modal, Form, Select, Button, message } from "antd";
import { visitsApi } from "../../api/visits";
import { membershipsApi } from "../../api/memberships";
import { employeesApi } from "../../api/employees";
import type {
  CreateVisitDto,
  MembershipResponseDto,
  EmployeeResponseDto,
  MembershipType,
} from "../../types";
import { MEMBERSHIP_TYPES } from "../../types";

interface VisitFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const VisitFormModal: React.FC<VisitFormModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm<CreateVisitDto>();
  const [loading, setLoading] = useState(false);

  const [activeMemberships, setActiveMemberships] = useState<MembershipResponseDto[]>([]);
  const [membershipsLoading, setMembershipsLoading] = useState(false);

  const [trainers, setTrainers] = useState<EmployeeResponseDto[]>([]);
  const [trainersLoading, setTrainersLoading] = useState(false);

  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  useEffect(() => {
    if (!open) return;

    const loadData = async () => {
      setMembershipsLoading(true);
      try {
        const data = await membershipsApi.getAll({ status: "active" });
        const list = Array.isArray(data) ? data : (data as unknown as { data: MembershipResponseDto[] }).data ?? [];
        setActiveMemberships(list);
      } catch {
        message.error("Не удалось загрузить список абонементов");
      } finally {
        setMembershipsLoading(false);
      }

      setTrainersLoading(true);
      try {
        const data = await employeesApi.getActiveTrainers();
        const list = Array.isArray(data) ? data : (data as unknown as { data: EmployeeResponseDto[] }).data ?? [];
        setTrainers(list);
      } catch {
        message.error("Не удалось загрузить список тренеров");
      } finally {
        setTrainersLoading(false);
      }
    };

    loadData();
  }, [open]);

  const handleSubmit = async (values: CreateVisitDto) => {
    setLoading(true);
    try {
      await visitsApi.create(values);
      message.success("Посещение успешно зарегистрировано!");
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to create visit:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Регистрация посещения"
      open={open}
      onCancel={onClose}
      afterOpenChange={(isOpen) => {
        if (!isOpen) {
          form.resetFields();
        }
      }}
      destroyOnHidden
      footer={null}
      width={isMobile ? '95%' : 500}
      style={isMobile ? { top: 20 } : undefined}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          name="membershipId"
          label="Абонемент"
          rules={[{ required: true, message: "Пожалуйста, выберите абонемент" }]}
        >
          <Select
            placeholder="Выберите активный абонемент"
            loading={membershipsLoading}
            showSearch
            optionFilterProp="label"
            options={activeMemberships.map((m) => ({
              value: m.id,
              label: `${m.clientFullName} — ${MEMBERSHIP_TYPES[m.type as MembershipType]?.tableLabel || m.type}`,
            }))}
            notFoundContent={
              membershipsLoading ? "Загрузка..." : "Нет активных абонементов"
            }
          />
        </Form.Item>

        <Form.Item name="trainerId" label="Тренер (опционально)">
          <Select
            placeholder="Выберите тренера"
            loading={trainersLoading}
            showSearch
            optionFilterProp="label"
            allowClear
            options={trainers.map((t) => ({
              value: t.id,
              label: t.fullName,
            }))}
            notFoundContent={
              trainersLoading ? "Загрузка..." : "Нет доступных тренеров"
            }
          />
        </Form.Item>

        <Form.Item className="mb-0 flex justify-end gap-2">
          <Button onClick={onClose}>Отмена</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Зарегистрировать
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};