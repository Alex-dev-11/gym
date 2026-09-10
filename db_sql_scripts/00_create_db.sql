-- =========================================================
-- Скрипт создания пользователя и базы данных
-- Выполнять от имени суперпользователя (postgres)
-- =========================================================

-- Создаем пользователя (если его еще нет)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'gym_app_user') THEN
        CREATE USER gym_app_user WITH PASSWORD 'gym_app_user_pass';
        RAISE NOTICE 'Пользователь gym_app_user создан';
    ELSE
        RAISE NOTICE 'Пользователь gym_app_user уже существует';
    END IF;
END
$$;

-- Создаем базу данных (если её еще нет)
-- Примечание: CREATE DATABASE нельзя выполнять внутри транзакции или блока DO
SELECT 'CREATE DATABASE gym_db OWNER gym_app_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'gym_db')\gexec

-- Предоставляем права (на случай, если база уже существовала)
GRANT ALL PRIVILEGES ON DATABASE gym_db TO gym_app_user;

-- =========================================================
-- ГОТОВО! База данных и пользователь созданы.
-- Теперь можно выполнять скрипты 01_db_structure.sql и 02_seed_data.sql
-- =========================================================