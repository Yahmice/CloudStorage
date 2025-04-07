# Инструкция по развертыванию проекта 

## Требования
- Python 3.1+
- Django 3.0+
- Node.js 18.0+
- React 18.0+
- PostgreSql 17.4
- Nginx 1.27+
- Gunicorn 23.0

## Развертывание VPS

### 1. Подготовка сервера
```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка необходимых пакетов
sudo apt install python3 python3-pip python3-venv nginx gunicorn postgresq postgresql-contrib -y
```

### 2. Настройка базы данных
```bash
# Создание базы данных и пользователя
sudo -u postgres psql
CREATE DATABASE cloudstorage;
CREATE USER clouduser WITH PASSWORD 'your_password';
ALTER ROLE clouduser SET client_encoding TO 'utf-8';
ALTER ROLE clouduser SET default_transaction_isolation TO 'read commited';
ALTER ROLE clouduser SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE cloudstorage TO clouduser;
\q
```

### 3. Настройка бекенда
```bash
# Клонирование репозитория
git clone https://github.com/Yahmice/CloudStorage/
cd CloudStorage/backend

# Создание виртуального окружения
python3 -m venv env
source env/bin/activate

# Установка зависимостей
pip install -r Requirements.txt

# Применение миграций
python manage.py migrate

# Создание суперпользователя
python manage.py createsuperuser

# Сбор статических файлов
python manage.py collectstatic
```

### 4. Настройка фронтенда
```bash
cd ../frontend

# Установка зависимостей
npm install

# Сборка проекта
npm run build
```
### 5. Настройка gunicorn
```bash
# Создаем файл gunicorn.service с содержимым
sudo nano /etc/systemd/system/gunicorn.service


[Unit]
Description=gunicorn service
After=network.target
[Service]
User=your_user
Group=www-data
WorkingDirectory=/home/yah/CloudStorage/backend
ExecStart=/path/to/CloudStorage/backend/env/bin/gunicorn --access-logfile -\
         --workers=3 \
         --bind unix:/path/to/CloudStorage/backend/cloud/project.sock cloud.wsgi:application
[Install]
WantedBy=multi-user.target
```

## 6. Настройка Nginx
```bash
# Создаём файл для nginx
sudo nano ../../etc/nginx/sites-enabled/your_project_name

server {
  listen 80;
  server_name 89.104.67.132;
  root /home/yah/CloudStorage/frontend/dist/;
  index index.html;
  location / {
    try_files $uri $uri/ /index.html;
  }
}
server {
  listen 8000;
  server_name 89.104.67.132;
  location / {
    proxy_pass http://unix:/home/yah/CloudStorage/backend/cloud/project.sock;
  }
  location /static/ {
    alias /home/yah/CloudStorage/backend/staticfiles/;
  }
  location /storage/ {
    alias /home/yah/CloudStorage/backend/storage/;
    internal;
  }
  location /media/ {
    alias /home/yah/CloudStorage/backend/media/;
    expires 7d;
    internal;
  }
}
```


### 7. Запуск приложения
```bash
sudo systemctl start gunicorn
sudo systemctl enable gunicorn

sydo systemctl start nginx

sudo ufw allow 'Nginx Full'
```










