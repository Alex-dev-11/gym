import { Modal, Form, Input, Select, Switch, message } from 'antd';
import { useEffect, useState } from 'react';
import { usersApi } from '../../api/users';
import { employeesApi } from '../../api/employees';
import { 
  USER_ROLES, 
  type UserResponseDto, 
  type CreateUserDto, 
  type UpdateUserDto, 
  type EmployeeResponseDto 
} from '../../types';

interface Props {
  open: boolean;
  user: UserResponseDto | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserFormModal({ open, user, onClose, onSuccess }: Props) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const isEditMode = !!user;
  
  const [employees, setEmployees] = useState<EmployeeResponseDto[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    // Заполняем форму данными пользователя
    if (user) {
      form.setFieldsValue({
        login: user.login,
        role: user.role,
        employeeId: user.employeeId ?? null,
        isActive: user.isActive ?? true,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ isActive: true });
    }

    // 🔥 БЕЗОПАСНЫЙ АСИНХРОННЫЙ ПАТТЕРН: загрузка сотрудников
    const loadEmployees = async () => {
      setEmployeesLoading(true);
      try {
        const data = await employeesApi.getAdministrative();
        setEmployees(data);
      } catch {
        message.error("Не удалось загрузить список сотрудников");
      } finally {
        setEmployeesLoading(false);
      }
    };

    loadEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user?.id]);

  const handleSubmit = async (values: CreateUserDto | UpdateUserDto) => {
    setSubmitting(true);
    try {
      if (isEditMode && user) {
        const payload = { ...values };
        if (!payload.password) {
          delete (payload as any).password;
        }
        await usersApi.update(user.id, payload as UpdateUserDto);
        message.success('Пользователь обновлен');
      } else {
        await usersApi.create(values as CreateUserDto);
        message.success('Пользователь создан');
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
      title={isEditMode ? 'Редактировать пользователя' : 'Новый пользователь'}
      open={open}
      onOk={() => form.submit()}
      onCancel={onClose}
      confirmLoading={submitting}
      destroyOnHidden
      width={500}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="login" label="Логин" rules={[{ required: true, message: 'Введите логин' }]}>
          <Input placeholder="admin" disabled={isEditMode} />
        </Form.Item>
        
        {!isEditMode && (
          <Form.Item name="password" label="Пароль" rules={[{ required: true, message: 'Введите пароль' }]}>
            <Input.Password placeholder="••••••" />
          </Form.Item>
        )}

        <Form.Item name="role" label="Роль" rules={[{ required: true, message: 'Выберите роль' }]}>
          <Select placeholder="Выберите роль">
            {Object.entries(USER_ROLES).map(([value, { label }]) => (
              <Select.Option key={value} value={value}>{label}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="employeeId" label="Сотрудник (опционально)">
          <Select 
            placeholder="Выберите сотрудника" 
            allowClear 
            loading={employeesLoading}
            showSearch
            optionFilterProp="label"
          >
            {employees.map((emp) => (
              <Select.Option key={emp.id} value={emp.id} label={`${emp.lastName} ${emp.firstName}`}>
                {emp.lastName} {emp.firstName} {emp.patronymic || ''}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="isActive" label="Статус" valuePropName="checked">
          <Switch checkedChildren="Активен" unCheckedChildren="Неактивен" />
        </Form.Item>
      </Form>
    </Modal>
  );
}