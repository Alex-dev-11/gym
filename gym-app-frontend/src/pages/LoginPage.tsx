import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import type { LoginDto } from '../types';

export function LoginPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleSubmit = async (values: LoginDto) => {
    //console.log('=== КНОПКА НАЖАТА, НАЧИНАЕМ ОТПРАВКУ ===', values);

    try {
      //console.log('Отправляем запрос на бэкенд...');
      const response = await authApi.login(values);
      //console.log('Успешный ответ от бэкенда:', response);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({
        login: response.login,
        role: response.role,
        fullName: response.fullName
      }));

      message.success('Вход выполнен успешно');
      navigate('/clients', { replace: true });
      
    } catch (error: any) {
      //console.error('=== ПОЙМАНА ОШИБКА В COMPONENTE ===', error);
      
      // Если ошибка не была показана интерсептором, показываем её здесь
      if (error.response?.status !== 401) {
        message.error(error.response?.data?.message || 'Произошла ошибка при входе');
      }
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#f0f2f5' 
    }}>
      <Card style={{ width: 400 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Вход в систему</h2>
        
        {/* 👇 Убедитесь, что form={form} и onFinish={handleSubmit} присутствуют */}
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
        >
          <Form.Item
            name="login"
            rules={[{ required: true, message: 'Пожалуйста, введите логин!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Логин"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Пожалуйста, введите пароль!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Пароль"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            {/* 👇 htmlType="submit" обязателен для запуска onFinish */}
            <Button type="primary" htmlType="submit" size="large" block>
              Войти
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}