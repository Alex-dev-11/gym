import { Modal, Form, Input, Select, Switch, message } from 'antd';
import { useEffect, useState } from 'react';
import { employeesApi } from '../../api/employees';
import { 
  EMPLOYEE_POSITIONS, 
  type EmployeeResponseDto, 
  type CreateEmployeeDto, 
  type UpdateEmployeeDto
} from '../../types';

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

  useEffect(() => {
    if (open) {
      if (employee) {
        form.setFieldsValue({
          lastName: employee.lastName ?? '',
          firstName: employee.firstName ?? '',
          patronymic: employee.patronymic ?? null,
          phone: employee.phone ?? null,
          position: employee.position ?? 'administrator',
          isActive: employee.isActive ?? true, // <-- Статус загружается
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ isActive: true, position: 'administrator' });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, employee?.id]); // <-- Защита от бесконечного цикла

  const handleSubmit = async (values: CreateEmployeeDto | UpdateEmployeeDto) => {
  setSubmitting(true);
  try {
    // 🔥 КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Превращаем пустую строку в null
    const payload = {
      ...values,
      phone: values.phone === '' ? null : values.phone,
      patronymic: values.patronymic === '' ? null : values.patronymic,
    };

    if (isEditMode && employee) {
      await employeesApi.update(employee.id, payload as UpdateEmployeeDto);
      message.success('Данные сотрудника обновлены');
    } else {
      await employeesApi.create(payload as CreateEmployeeDto);
      message.success('Сотрудник добавлен');
    }
    onSuccess();
    onClose();
  } catch (error: unknown) {
    const err = error as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } };
    const errorMsg = err.response?.data?.errors 
      ? Object.values(err.response.data.errors).flat().join('\n')
      : (err.response?.data?.message || 'Ошибка сохранения');
    message.error(errorMsg);
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
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="lastName" label="Фамилия" rules={[{ required: true, message: 'Введите фамилию' }]}>
          <Input placeholder="Иванов" />
        </Form.Item>
        <Form.Item name="firstName" label="Имя" rules={[{ required: true, message: 'Введите имя' }]}>
          <Input placeholder="Иван" />
        </Form.Item>
        <Form.Item name="patronymic" label="Отчество">
          <Input placeholder="Иванович" />
        </Form.Item>
        <Form.Item name="phone" label="Телефон">
          <Input placeholder="+7 (999) 123-45-67" />
        </Form.Item>
        <Form.Item name="position" label="Должность" rules={[{ required: true, message: 'Выберите должность' }]}>
          <Select placeholder="Выберите должность">
            {Object.entries(EMPLOYEE_POSITIONS).map(([value, { label }]) => (
              <Select.Option key={value} value={value}>{label}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* 🔥 ПЕРЕКЛЮЧАТЕЛЬ СТАТУСА */}
        <Form.Item name="isActive" label="Статус" valuePropName="checked">
          <Switch checkedChildren="Активен" unCheckedChildren="Неактивен" />
        </Form.Item>
      </Form>
    </Modal>
  );
}