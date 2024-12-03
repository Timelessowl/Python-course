# Система выполнения запросов по расписанию

## Приложение для планирования и выполнения произвольных запросов с возможностью уведомлений, результатов и управления через веб-интерфейс.

## Содержание
- [Требования](#Требования)
- [Установка](#установка)
- [Запуск приложения](#запуск-приложения)
  - [Запуск Redis](#запуск-redis)
  - [Запуск Celery](#запуск-celery)
  - [Запуск бэкенда](#запуск-бэкенда)
  - [Запуск фронтенда](#запуск-фронтенда)


### Требования
**В виду использовния Redis рекомендуется использовать UNIX-подобную систему**

- Python 3.x
- Node.js(>= 18.0) и npm 
- PostgreSQL
- Redis


### Установка
1. Склонируйте этот репозиторий в любую удобную директорию
1. Перейдите в директорию **backend**
1. Создайте и активируйте витуальное окружение
    ```
    python -m venv venv
    source venv/bin/activate
    ```
1. Установите зависимости
    ```
    pip install -r requirements.txt
    ```

1. Перейдите в директорию **frontend**
1. Установите зависимости:
    ```
    npm install
    ```
1. Создайте базу данных PostgreSQL:
    ```
    CREATE DATABASE scheduled_query_db;
    ```
1. Настройте параметры подключения в backend/settings.py

    Обновите настройки DATABASES с вашим именем базы данных, пользователем и паролем.
1. Создайте и примените миграции
    ```
    python manage.py makemigrations
    python manage.py migrate
    ```

### Запуск приложения
1. Убедитесь, что сервис Redis запущен. Для этого выполните:
    ```
    redis-server
    ```
1. Перейдите в директорию **backend**
    ```
    cd backend
    ```
1. Запустите Celery worker для выполнения задач по требованию
    ```
    celery -A backend worker --loglevel=info
    ```
1. Запустите Celery beat для выполнения задач по расписанию
    ```
    celery -A backend beat --loglevel=info
    ```
1. Запустите сервер
    ```
    python manage.py runserver
    ```
1. Запустите фронтенд
    ```
    cd ../frontend
    npm start
    ```

**Если на устройстве установлен tmux можно исопльзовать скрипт launchApp**