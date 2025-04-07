import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import './Login.css';
import './auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');

  // Получаем CSRF-токен при загрузке компонента
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        await fetch(`${import.meta.env.VITE_SERVER_URL}/api/login/`, {
          method: 'GET',
          credentials: 'include',
        });
        const token = getCookie('csrftoken');
        setCsrfToken(token);
      } catch (err) {
        console.error('Ошибка при получении CSRF-токена:', err);
      }
    };
    
    fetchCsrfToken();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Очищаем ошибку поля при изменении
    if (error[name]) {
      setError(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Получаем актуальный CSRF-токен из кук
      const currentToken = getCookie('csrftoken') || csrfToken;
      
      if (!currentToken) {
        throw new Error('CSRF-токен не найден. Пожалуйста, обновите страницу.');
      }

      console.log('Используемый CSRF-токен:', currentToken);
      
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/login/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': currentToken,
        },
        body: JSON.stringify({ username: formData.username, password: formData.password })
      });

      if (response.status === 403) {
        throw new Error('Ошибка авторизации: отказано в доступе (403). Возможно, проблема с CSRF-токеном.');
      }

      const data = await response.json();

      if (response.ok) {
        navigate('/dashboard');
      } else {
        setError(data.error || 'Произошла ошибка при входе');
      }
    } catch (error) {
      console.error('Ошибка при входе:', error);
      setError(error.message || 'Произошла ошибка при подключении к серверу');
    } finally {
      setLoading(false);
    }
  };

  // Функция для получения значения cookie по имени
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  return (
    <div className="login-container">
      <h2>Вход в систему</h2>
      {error && (
        <div className="error-message general-error">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Логин:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={error.username ? "error-input" : ""}
            required
          />
          {error.username && (
            <div className="error-message">{error.username}</div>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="password">Пароль:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={error.password ? "error-input" : ""}
            required
          />
          {error.password && (
            <div className="error-message">{error.password}</div>
          )}
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Вход...' : 'Войти'}
        </button>
        <div className="auth-links">
          <p>Нет аккаунта? <Link to="/register">Зарегистрироваться</Link></p>
        </div>
      </form>
      <Link to="/" className="back-button">
        <span className="back-arrow">←</span> На главную
      </Link>
    </div>
  );
};

export default Login;
  