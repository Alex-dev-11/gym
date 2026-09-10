-- =========================================================
-- Скрипт заполнения тестовыми данными для Gym Management System
-- Запуск: psql -U gym_app_user -d gym_db -f seed_data.sql
-- =========================================================

BEGIN;

-- =========================================================
-- ШАГ 1: Сотрудники (тренеры и администраторы)
-- =========================================================
INSERT INTO employees (last_name, first_name, patronymic, phone, position, is_active) VALUES
('Петров', 'Петр', 'Петрович', '+79001112233', 'administrator', true),
('Сидоров', 'Алексей', 'Иванович', '+79002223344', 'trainer', true),
('Кузнецова', 'Мария', 'Сергеевна', '+79003334455', 'trainer', true),
('Волков', 'Дмитрий', 'Александрович', '+79004445566', 'trainer', true)
ON CONFLICT (phone) DO NOTHING;


-- =========================================================
-- ШАГ 2: Пользователи системы (для авторизации)
-- =========================================================

-- Администратор (привязан к сотруднику)
INSERT INTO system_users (login, password_hash, role, employee_id, is_active, created_at)
SELECT 
    'admin_linked',
    '$2a$11$OoAf2NGFhhCBXgvEfkSE3uQobyPuHg/TgUCQdbrqHc/BZE4XxP1QG',
    'admin',
    id,
    true,
    CURRENT_TIMESTAMP
FROM employees
WHERE phone = '+79001112233'
ON CONFLICT (login) DO NOTHING;

-- Оператор (обезличенный, без привязки к сотруднику)
INSERT INTO system_users (login, password_hash, role, employee_id, is_active, created_at)
VALUES (
    'operator_anon',
    '$2a$11$OoAf2NGFhhCBXgvEfkSE3uQobyPuHg/TgUCQdbrqHc/BZE4XxP1QG',
    'operator',
    NULL,
    true,
    CURRENT_TIMESTAMP
)
ON CONFLICT (login) DO NOTHING;

-- =========================================================
-- ШАГ 3: Клиенты (разные статусы для демонстрации фильтров)
-- =========================================================
INSERT INTO clients (last_name, first_name, patronymic, phone, email, status, is_deleted, registration_date) VALUES
('Иванов', 'Иван', 'Иванович', '+79111111111', 'ivanov@mail.ru', 'active', false, CURRENT_DATE - INTERVAL '90 days'),
('Смирнова', 'Анна', 'Петровна', '+79222222222', 'smirnova@gmail.com', 'active', false, CURRENT_DATE - INTERVAL '60 days'),
('Попов', 'Сергей', 'Александрович', '+79333333333', 'popov@yandex.ru', 'inactive', false, CURRENT_DATE - INTERVAL '180 days'),
('Васильева', 'Ольга', 'Дмитриевна', '+79444444444', 'vasilieva@mail.ru', 'active', false, CURRENT_DATE - INTERVAL '30 days'),
('Федоров', 'Алексей', 'Николаевич', '+79555555555', 'fedorov@gmail.com', 'blacklisted', false, CURRENT_DATE - INTERVAL '365 days'),
('Николаева', 'Екатерина', 'Сергеевна', '+79666666666', 'nikolaeva@yandex.ru', 'active', false, CURRENT_DATE - INTERVAL '15 days'),
('Михайлов', 'Андрей', 'Владимирович', '+79777777777', 'mikhailov@mail.ru', 'inactive', true, CURRENT_DATE - INTERVAL '400 days')
ON CONFLICT (phone) DO NOTHING;

-- =========================================================
-- ШАГ 4: Абонементы (разные типы и статусы)
-- =========================================================

-- Активный месячный абонемент (безлимит)
INSERT INTO memberships (client_id, type, start_date, end_date, status, total_visits, used_visits)
SELECT id, 'month', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '15 days', 'active', 999, 12
FROM clients WHERE phone = '+79111111111';

-- Активный годовой абонемент (безлимит)
INSERT INTO memberships (client_id, type, start_date, end_date, status, total_visits, used_visits)
SELECT id, 'year', CURRENT_DATE - INTERVAL '100 days', CURRENT_DATE + INTERVAL '265 days', 'active', 999, 85
FROM clients WHERE phone = '+79222222222';

-- Завершенный разовый абонемент (все визиты использованы)
INSERT INTO memberships (client_id, type, start_date, end_date, status, total_visits, used_visits)
SELECT id, 'single', CURRENT_DATE - INTERVAL '45 days', CURRENT_DATE - INTERVAL '15 days', 'completed', 1, 1
FROM clients WHERE phone = '+79333333333';

-- Истекший месячный абонемент (прошла дата окончания)
INSERT INTO memberships (client_id, type, start_date, end_date, status, total_visits, used_visits)
SELECT id, 'month', CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE - INTERVAL '30 days', 'expired', 999, 8
FROM clients WHERE phone = '+79444444444';

-- Отмененный абонемент
INSERT INTO memberships (client_id, type, start_date, end_date, status, total_visits, used_visits)
SELECT id, 'month', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '20 days', 'cancelled', 999, 0
FROM clients WHERE phone = '+79555555555';

-- Активный разовый абонемент (визит еще не использован)
INSERT INTO memberships (client_id, type, start_date, end_date, status, total_visits, used_visits)
SELECT id, 'single', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'active', 1, 0
FROM clients WHERE phone = '+79666666666';

-- =========================================================
-- ШАГ 5: Посещения (разные тренеры и даты)
-- =========================================================

-- Посещения для Иванова (месячный абонемент, разные тренеры)
INSERT INTO visits (membership_id, trainer_id, processed_by_user_id, visit_time)
SELECT 
    m.id,
    e.id,
    u.id,
    CURRENT_DATE - INTERVAL '14 days' + (random() * INTERVAL '10 hours')
FROM memberships m
CROSS JOIN (SELECT id FROM employees WHERE position = 'trainer' LIMIT 1) e
CROSS JOIN (SELECT id FROM system_users WHERE login = 'operator_anon') u
WHERE m.client_id = (SELECT id FROM clients WHERE phone = '+79111111111')
LIMIT 1;

-- Еще несколько посещений для Иванова
INSERT INTO visits (membership_id, trainer_id, processed_by_user_id, visit_time)
SELECT 
    m.id,
    (SELECT id FROM employees WHERE phone = '+79003334455'),
    u.id,
    CURRENT_DATE - INTERVAL '10 days' + (random() * INTERVAL '10 hours')
FROM memberships m
CROSS JOIN (SELECT id FROM system_users WHERE login = 'operator_anon') u
WHERE m.client_id = (SELECT id FROM clients WHERE phone = '+79111111111')
LIMIT 1;

-- Посещение для Смирновой (годовой абонемент)
INSERT INTO visits (membership_id, trainer_id, processed_by_user_id, visit_time)
SELECT 
    m.id,
    (SELECT id FROM employees WHERE phone = '+79004445566'),
    u.id,
    CURRENT_DATE - INTERVAL '5 days' + (random() * INTERVAL '10 hours')
FROM memberships m
CROSS JOIN (SELECT id FROM system_users WHERE login = 'admin_linked') u
WHERE m.client_id = (SELECT id FROM clients WHERE phone = '+79222222222')
LIMIT 1;

-- Посещение для Попова (разовый абонемент, использован)
INSERT INTO visits (membership_id, trainer_id, processed_by_user_id, visit_time)
SELECT 
    m.id,
    (SELECT id FROM employees WHERE phone = '+79002223344'),
    u.id,
    CURRENT_DATE - INTERVAL '20 days' + (random() * INTERVAL '10 hours')
FROM memberships m
CROSS JOIN (SELECT id FROM system_users WHERE login = 'operator_anon') u
WHERE m.client_id = (SELECT id FROM clients WHERE phone = '+79333333333')
LIMIT 1;

COMMIT;

-- =========================================================
-- ГОТОВО! Тестовые данные добавлены.
-- =========================================================