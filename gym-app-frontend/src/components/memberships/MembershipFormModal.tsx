import { Modal, Form, Select, DatePicker, message } from 'antd';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { membershipsApi } from '../../api/memberships';
import { clientsApi } from '../../api/clients';
import type { ClientResponseDto, CreateMembershipDto } from '../../types';
import { MEMBERSHIP_TYPES } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function MembershipFormModal({ open, onClose, onSuccess }: Props) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [clients, setClients] = useState<ClientResponseDto[]>([]);
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  useEffect(() => {
    if (open) {
      form.resetFields();
      // ✅ ИСПРАВЛЕНО: data - это уже массив, response.data больше не нужен
      clientsApi.getAll().then(data => {
        const activeClients = data.filter(c => c.status === 'active' && !c.isDeleted);
        setClients(activeClients);
      });
    }
  }, [open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const createData: CreateMembershipDto = {
        clientId: values.clientId,
        type: values.type,
        startDate: values.startDate.format('YYYY-MM-DD'),
      };

      await membershipsApi.create(createData);
      message.success('Абонемент успешно создан');
      
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error: any) {
      if (error.errorFields) return;
      console.error('Error creating membership:', error);
      message.error('Ошибка создания абонемента');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Новый абонемент"
      open={open}
      onOk={handleSubmit}
      onCancel={() => { form.resetFields(); onClose(); }}
      confirmLoading={submitting}
      okText="Создать"
      cancelText="Отмена"
      destroyOnHidden
      width={isMobile ? '95%' : 500}
      style={isMobile ? { top: 20 } : undefined}
    >
      <Form form={form} layout="vertical" autoComplete="off">
        <Form.Item label="Клиент" name="clientId" rules={[{ required: true, message: 'Выберите клиента' }]}>
          <Select
            placeholder="Выберите клиента"
            showSearch
            optionFilterProp="label"
            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            options={clients.map(c => ({
              value: c.id,
              label: `${c.lastName} ${c.firstName} (${c.phone})`,
            }))}
          />
        </Form.Item>

        <Form.Item label="Тип абонемента" name="type" rules={[{ required: true, message: 'Выберите тип абонемента' }]}>
          <Select placeholder="Выберите тип">
            {Object.entries(MEMBERSHIP_TYPES).map(([value, { label }]) => (
              <Select.Option key={value} value={value}>{label}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Дата начала" name="startDate" rules={[{ required: true, message: 'Выберите дату начала' }]} initialValue={dayjs()}>
          <DatePicker 
            style={{ width: '100%' }}
            format="YYYY-MM-DD"
            disabledDate={(current) => !!current && current < dayjs().startOf('day')}
          />
        </Form.Item>
        
        <div style={{ color: '#888', fontSize: '12px', marginTop: '-10px', marginBottom: '10px' }}>
          * Бэкенд автоматически рассчитает дату окончания и закроет предыдущий абонемент клиента, если он был активен.
        </div>
      </Form>
    </Modal>
  );
}