// src/components/clients/ClientFormModal.tsx
import { Modal, Form, Input, message } from 'antd';
import { useEffect, useState } from 'react';
import { clientsApi } from '../../api/clients';
import type { ClientResponseDto, CreateClientDto, UpdateClientDto } from '../../types';

// Пропсы (настройки), которые компонент ожидает от родителя
interface Props {
  open: boolean;                          // Открыто ли окно
  editingClient: ClientResponseDto | null; // Если null — создаём, если объект — редактируем
  onClose: () => void;                    // Функция для закрытия окна
  onSuccess: () => void;                  // Функция, которую нужно вызвать после успешного сохранения
}

export function ClientFormModal({ open, editingClient, onClose, onSuccess }: Props) {
  // Хук Ant Design для управления формой программно (сброс, заполнение)
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  
  // Если editingClient существует, значит мы в режиме редактирования
  const isEditMode = !!editingClient;

  // Этот эффект срабатывает каждый раз, когда окно открывается
  useEffect(() => {
    if (open) {
      if (editingClient) {
        // Режим редактирования: заполняем форму данными клиента
        form.setFieldsValue({
          lastName: editingClient.lastName,
          firstName: editingClient.firstName,
          patronymic: editingClient.patronymic,
          phone: editingClient.phone,
          email: editingClient.email,
        });
      } else {
        // Режим создания: очищаем форму от старых данных
        form.resetFields();
      }
    }
  }, [open, editingClient, form]);

  // Обработчик нажатия кнопки "Сохранить"
  const handleSubmit = async () => {
    try {
      // 1. Валидация полей. Если поля невалидны, Ant Design сам подсветит их красным и выбросит ошибку
      const values = await form.validateFields();
      setSubmitting(true);

      if (isEditMode && editingClient) {
        // 2. Режим редактирования: отправляем PUT
        const updateData: UpdateClientDto = values;
        await clientsApi.update(editingClient.id, updateData);
        message.success('Клиент обновлён');
      } else {
        // 2. Режим создания: отправляем POST
        const createData: CreateClientDto = values;
        await clientsApi.create(createData);
        message.success('Клиент создан');
      }

      // 3. Успех: очищаем форму, закрываем окно, уведомляем родителя
      form.resetFields();
      onSuccess(); // Вызовет reload() на странице, чтобы таблица обновилась
      onClose();
    } catch (error: any) {
      // Если это ошибка валидации Ant Design (не заполнены обязательные поля) - игнорируем, форма сама всё покажет
      if (error.errorFields) {
        return;
      }
      // Если это ошибка API (например, "Телефон уже занят") - наш interceptor в client.ts уже показал message.error
      // Здесь мы просто логируем в консоль, чтобы не закрывать модалку при ошибке сервера
      console.error('Error saving client:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Обработчик закрытия окна (крестик или кнопка "Отмена")
  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={isEditMode ? 'Редактировать клиента' : 'Новый клиент'}
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={submitting} // Показывает спиннер на кнопке "Сохранить" во время запроса
      okText="Сохранить"
      cancelText="Отмена"
      destroyOnHidden // Полностью уничтожает компонент при закрытии (хорошо для очистки памяти)
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
      >
        <Form.Item
          label="Фамилия"
          name="lastName" // Должно совпадать с полем в DTO
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
      </Form>
    </Modal>
  );
}