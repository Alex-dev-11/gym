import { Modal, Form, Input, Select, message } from 'antd';
import { useEffect, useState } from 'react';
import { employeesApi } from '../../api/employees';
import { EMPLOYEE_POSITIONS, type EmployeeResponseDto, type CreateEmployeeDto, type UpdateEmployeeDto} from '../../types';

interface Props {
  open: boolean;
  employee: EmployeeResponseDto | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EmployeeFormModal({ open, employee, onClose, onSuccess }: Props) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const isEditMode = !!employee;
  const isInactive = employee?.isActive === false;

  useEffect(() => {
    if (open) {
      if (employee) {
        form.setFieldsValue({
          lastName: employee.lastName,
          firstName: employee.firstName,
          patronymic: employee.patronymic,
          phone: employee.phone,
          position: employee.position,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, employee, form]);

  const handleSubmit = async (values: CreateEmployeeDto | UpdateEmployeeDto) => {
    setSubmitting(true);
    try {
      if (isEditMode && employee) {
        await employeesApi.update(employee.id, values as UpdateEmployeeDto);
        message.success('Данные сотрудника обновлены');
      } else {
        await employeesApi.create(values as CreateEmployeeDto);
        message.success('Сотрудник добавлен');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Ошибка сохранения');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={isEditMode ? 'Редактировать сотрудника' : 'Новый сотрудник'}
      open={open}
      onOk={() => form.submit()}
      onCancel={onClose}
      confirmLoading={submitting}
      destroyOnHidden
      width={500}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} disabled={isInactive}>
        {isInactive && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
            ⚠️ Сотрудник деактивирован. Для редактирования сначала восстановите его.
          </div>
        )}

        <Form.Item name="lastName" label="Фамилия" rules={[{ required: true }]}>
          <Input placeholder="Иванов" />
        </Form.Item>
        <Form.Item name="firstName" label="Имя" rules={[{ required: true }]}>
          <Input placeholder="Иван" />
        </Form.Item>
        <Form.Item name="patronymic" label="Отчество">
          <Input placeholder="Иванович" />
        </Form.Item>
        <Form.Item name="phone" label="Телефон" rules={[{ required: true }]}>
          <Input placeholder="+7 (999) 123-45-67" />
        </Form.Item>
        <Form.Item name="position" label="Должность" rules={[{ required: true }]}>
          <Select placeholder="Выберите должность">
            {Object.entries(EMPLOYEE_POSITIONS).map(([value, { label }]) => (
              <Select.Option key={value} value={value}>{label}</Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}