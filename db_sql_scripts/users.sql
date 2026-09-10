-- =========================================================
-- ШАГ 1: Создаем тестового сотрудника (если его еще нет)
-- =========================================================
INSERT INTO employees (last_name, first_name, patronymic, phone, position, is_active)
VALUES ('Петров', 'Петр', 'Петрович', '+79001112233', 'administrator', true)
ON CONFLICT (phone) DO NOTHING;


-- =========================================================
-- ШАГ 2: Создаем ПРИВЯЗАННОГО пользователя (Администратор)
-- Логин: admin_linked
-- Пароль: 123456
-- Привязан к сотруднику "Петров П.П."
-- =========================================================
INSERT INTO system_users (login, password_hash, role, employee_id, is_active, created_at)
SELECT 
    'admin_linked',
    '$2a$11$OoAf2NGFhhCBXgvEfkSE3uQobyPuHg/TgUCQdbrqHc/BZE4XxP1QG', -- Это BCrypt хеш от "123456"
    'admin',
    id, -- Автоматически подставляем ID сотрудника по телефону
    true,
    CURRENT_TIMESTAMP
FROM employees
WHERE phone = '+79001112233'
ON CONFLICT (login) DO NOTHING;


-- =========================================================
-- ШАГ 3: Создаем ОБЕЗЛИЧЕННОГО пользователя (Оператор)
-- Логин: operator_anon
-- Пароль: 123456
-- НЕ привязан к сотруднику (employee_id = NULL)
-- =========================================================
INSERT INTO system_users (login, password_hash, role, employee_id, is_active, created_at)
VALUES (
    'operator_anon',
    '$2a$11$OoAf2NGFhhCBXgvEfkSE3uQobyPuHg/TgUCQdbrqHc/BZE4XxP1QG', -- Это BCrypt хеш от "123456"
    'operator',
    NULL, -- Явно указываем NULL, связи с сотрудником нет
    true,
    CURRENT_TIMESTAMP
)
ON CONFLICT (login) DO NOTHING;