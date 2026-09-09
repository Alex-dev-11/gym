// src/components/clients/ClientFormModal.tsx
import { Modal, Form, Input, message, Select, Alert } from 'antd';
import { useEffect, useState } from 'react';
import { clientsApi } from '../../api/clients';
import type { ClientResponseDto, CreateClientDto, UpdateClientDto } from '../../types';
import { CLIENT_STATUSES } from '../../types'; // 👈 Импортируем конфиг

interface Props {
  open: boolean;
  editingClient: ClientResponseDto | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ClientFormModal({ open, editingClient, onClose, onSuccess }: Props) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  
  const isEditMode = !!editingClient;
  const isDeleted = editingClient?.isDeleted;

  useEffect(() => {
    if (open) {
      if (editingClient) {
        form.setFieldsValue({
          lastName: editingClient.lastName,
          firstName: editingClient.firstName,
          patronymic: editingClient.patronymic,
          phone: editingClient.phone,
          email: editingClient.email,
          status: editingClient.status,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, editingClient, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      if (isEditMode && editingClient) {
        const updateData: UpdateClientDto = values;
        await clientsApi.update(editingClient.id, updateData);
        message.success('Клиент обновлён');
      } else {
        const createData: CreateClientDto = values;
        await clientsApi.create(createData);
        message.success('Клиент создан');
      }

      form.resetFields();
      onSuccess();
      onClose();
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      console.error('Error saving client:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };
// 👈 АДАПТИВНОСТЬ: динамическая ширина модалки
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const modalWidth = typeof window !== 'undefined' && window.innerWidth < 768 ? '95%' : 520;
  const modalStyle: React.CSSProperties = isMobile ? { top: 20 } : {};
  
  return (
    <Modal
      title={isEditMode ? 'Редактировать клиента' : 'Новый клиент'}
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={submitting}
      okText="Сохранить"
      cancelText="Отмена"
      destroyOnHidden
      width={modalWidth}       // 👈 АДАПТИВНОСТЬ
      style={modalStyle} 
    >
      {isDeleted && (
        <Alert
          message="Клиент в архиве"
          description="Чтобы изменить данные, сначала восстановите клиента из общего списка."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
        disabled={isDeleted}
      >
        <Form.Item
          label="Фамилия"
          name="lastName"
          rules={[{ required: true, message: 'Введите фамилию' }]}
        >
          <Input placeholder="Иванов" />
        </Form.Item>

        <Form.Item
          label="Имя"
          name="firstName"
          rules={[{ required: true, message: 'Введите имя' }]}
        >
          <Input placeholder="Иван" />
        </Form.Item>

        <Form.Item
          label="Отчество"
          name="patronymic"
        >
          <Input placeholder="Иванович" />
        </Form.Item>

        <Form.Item
          label="Телефон"
          name="phone"
          rules={[
            { required: true, message: 'Введите телефон' },
            { pattern: /^\+?[0-9\s\-()]{10,20}$/, message: 'Некорректный формат' }
          ]}
        >
          <Input placeholder="+7 (999) 123-45-67" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[{ type: 'email', message: 'Некорректный email' }]}
        >
          <Input placeholder="example@mail.com" />
        </Form.Item>

        {isEditMode && (
          <Form.Item
            label="Статус клиента"
            name="status"
            rules={[{ required: true, message: 'Выберите статус' }]}
          >
            <Select placeholder="Выберите статус">
              {/* 👇 Автоматическая генерация опций из конфига */}
              {Object.entries(CLIENT_STATUSES).map(([value, { label }]) => (
                <Select.Option key={value} value={value}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}