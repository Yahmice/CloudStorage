import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Добро пожаловать в Cloud Storage</h1>
        <p className="home-description">
          Безопасное хранение и управление вашими файлами в облаке
        </p>
        <div className="home-buttons">
          <Link to="/login" className="home-button primary">
            Войти
          </Link>
          <Link to="/register" className="home-button secondary">
            Регистрация
          </Link>
        </div>
        <a 
          href="http://127.0.0.1:8000/admin/" 
          className="admin-button"
          target="_blank"
          rel="noopener noreferrer"
        >
          Панель администратора
        </a>
      </div>
    </div>
  );
};

export default Home;
