import { Modal, Form, Input, Select, message } from 'antd';
import { useEffect, useState } from 'react';
import { usersApi } from '../../api/users';
import { employeesApi } from '../../api/employees';
import { USER_ROLES, type CreateUserDto, type TrainerSelectDto } from '../../types';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserFormModal({ open, onClose, onSuccess }: Props) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState<TrainerSelectDto[]>([]);

  useEffect(() => {
    if (open) {
      form.resetFields();
      // ✅ API уже возвращает чистый массив
      employeesApi.getActiveTrainers()
        .then(setEmployees)
        .catch(() => message.error('Не удалось загрузить список сотрудников'));
    }
  }, [open, form]);

  const handleSubmit = async (values: CreateUserDto) => {
    setSubmitting(true);
    try {
      await usersApi.create(values);
      message.success('Пользователь создан');
      onSuccess();
      onClose();
    } catch (error: any) {
      message.error(error.response?.data?.error || error.response?.data?.message || 'Ошибка создания');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Новый пользователь"
      open={open}
      onOk={() => form.submit()}
      onCancel={onClose}
      confirmLoading={submitting}
      okText="Создать"
      cancelText="Отмена"
      destroyOnHidden
      width={500}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
        <Form.Item name="login" label="Логин" rules={[{ required: true, message: 'Введите логин' }, { min: 3, message: 'Минимум 3 символа' }, { pattern: /^[a-zA-Z0-9_]+$/, message: 'Только латиница, цифры и _' }]}>
          <Input prefix={<UserOutlined />} placeholder="ivanov_admin" />
        </Form.Item>

        <Form.Item name="password" label="Пароль" rules={[{ required: true, message: 'Введите пароль' }, { min: 6, message: 'Минимум 6 символов' }]}>
          <Input.Password prefix={<LockOutlined />} placeholder="Введите пароль" />
        </Form.Item>

        <Form.Item name="role" label="Роль" rules={[{ required: true, message: 'Выберите роль' }]} initialValue="operator">
          <Select>
            {Object.entries(USER_ROLES).map(([value, { label }]) => (
              <Select.Option key={value} value={value}>{label}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="employeeId" label="Сотрудник (опционально)">
          <Select
            placeholder="Обезличенный пользователь"
            allowClear
            showSearch
            optionFilterProp="label"
            options={employees.map(e => ({ value: e.id, label: e.fullName }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}