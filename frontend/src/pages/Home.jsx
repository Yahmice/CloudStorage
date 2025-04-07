import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated, isAdmin, checkAuth } = useAuth();
  
  // Проверяем авторизацию при каждом рендеринге компонента
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Добро пожаловать в Cloud Storage</h1>
        <p className="home-description">
          Безопасное хранение и управление вашими файлами в облаке
        </p>
        {!isAuthenticated ? (
          <div className="home-buttons">
            <Link to="/login" className="home-button primary">
              Войти
            </Link>
            <Link to="/register" className="home-button secondary">
              Регистрация
            </Link>
          </div>
        ) : (
          <div className="home-buttons">
            <Link to="/dashboard" className="home-button primary">
              Перейти в хранилище
            </Link>
            {isAdmin && (
              <Link to="/admin" className="home-button secondary">
                Панель администратора
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
