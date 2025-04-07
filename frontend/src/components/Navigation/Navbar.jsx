import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const API_URL = `${import.meta.env.VITE_SERVER_URL}/api`;

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState('');

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_URL}/profile/`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setIsAuthenticated(true);
        setIsAdmin(userData.is_admin);
        setUsername(userData.username);
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUsername('');
      }
    } catch (error) {
      console.error('Ошибка при проверке аутентификации:', error);
      setIsAuthenticated(false);
      setIsAdmin(false);
      setUsername('');
    }
  };

  // Проверяем авторизацию при первом рендеринге и изменении маршрута
  useEffect(() => {
    checkAuth();
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      const csrfToken = document.cookie.split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];

      const response = await fetch(`${API_URL}/logout/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        }
      });

      if (response.ok) {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUsername('');
        navigate('/login');
      }
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Файловое хранилище</Link>
      </div>
      <div className="navbar-menu">
        {isAuthenticated ? (
          <>
            <span className="nav-username">Привет, {username}</span>
            <Link to="/dashboard" className="nav-link">Хранилище</Link>
            {isAdmin && (
              <Link to="/admin" className="nav-link admin">Управление пользователями</Link>
            )}
            <button onClick={handleLogout} className="nav-button">Выход</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Вход</Link>
            <Link to="/register" className="nav-link">Регистрация</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 