import { useState, useEffect, useMemo } from 'react';
import { Layout as AntLayout, Menu, Button } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  UserOutlined, 
  CreditCardOutlined, 
  CalendarOutlined,
  MenuOutlined,
  SettingOutlined,
  LogoutOutlined,
  TeamOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = AntLayout;

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setCollapsed(mobile);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const userStr = localStorage.getItem('user');
  
  const userInfo = useMemo(() => {
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return { fullName: 'Пользователь', role: null };
      }
    }
    return { fullName: 'Пользователь', role: null };
  }, [userStr]);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const menuItems = useMemo(() => [
    { key: '/clients', icon: <UserOutlined />, label: 'Клиенты' },
    { key: '/memberships', icon: <CreditCardOutlined />, label: 'Абонементы' },
    { key: '/visits', icon: <CalendarOutlined />, label: 'Посещения' },
    ...(userInfo.role === 'admin' ? [
      { key: '/employees', icon: <TeamOutlined />, label: 'Сотрудники' },
      { key: '/users', icon: <SettingOutlined />, label: 'Пользователи' }
    ] : []),
  ], [userInfo.role]);

  return (
    <AntLayout style={{ minHeight: '100vh', minWidth: '100vw', overflowX: 'hidden' }}>
      <Sider 
        theme="light" 
        width={250} 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        collapsedWidth={80}
        style={{ 
          overflow: 'auto', 
          height: '100vh', 
          position: 'fixed', 
          left: 0, 
          top: 0, 
          bottom: 0, 
          zIndex: 1000,
          display: (isMobile && collapsed) ? 'none' : 'block'
        }}
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: 20,
          fontWeight: 'bold',
          borderBottom: '1px solid #f0f0f0',
          whiteSpace: 'nowrap',
          overflow: 'hidden'
        }}>
          {collapsed ? '🏋️' : '🏋️ Gym Management'}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => {
            navigate(key);
            if (isMobile) {
              setCollapsed(true);
            }
          }}
          style={{ borderRight: 0 }}
        />
      </Sider>

      <AntLayout style={{ 
        marginLeft: isMobile ? 0 : (collapsed ? 80 : 250), 
        transition: 'margin-left 0.2s' 
      }}>
        <Header style={{ 
          background: '#fff', 
          padding: isMobile ? '0 16px' : '0 24px', 
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 999
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isMobile && (
              <Button 
                type="text" 
                icon={<MenuOutlined />} 
                onClick={() => setCollapsed(!collapsed)} 
              />
            )}
            <div style={{ fontSize: 16, fontWeight: 500 }}>
              Система управления залом
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span className="hidden sm:inline text-gray-600 text-sm font-medium">
              {userInfo.fullName}
            </span>
            <Button 
              type="default" 
              danger 
              ghost 
              icon={<LogoutOutlined />} 
              onClick={handleLogout}
              title="Выйти из системы"
            >
              <span className="hidden sm:inline">Выйти</span>
            </Button>
          </div>
        </Header>

        <Content style={{ 
          margin: isMobile ? 12 : 24, 
          padding: isMobile ? 12 : 24, 
          background: '#fff', 
          borderRadius: 8, 
          minHeight: 'calc(100vh - 88px)' 
        }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
}