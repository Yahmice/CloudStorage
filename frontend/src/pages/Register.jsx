import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import './Register.css';
import './auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: ""
  });
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);

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
    
    // Проверка совпадения паролей при изменении
    if (name === 'password' || name === 'password_confirm') {
      const password = name === 'password' ? value : formData.password;
      const passwordConfirm = name === 'password_confirm' ? value : formData.password_confirm;
      
      if (password && passwordConfirm && password !== passwordConfirm) {
        setError(prev => ({
          ...prev,
          password_confirm: "Пароли не совпадают"
        }));
      } else if (password && passwordConfirm && password === passwordConfirm) {
        setError(prev => ({
          ...prev,
          password_confirm: ""
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Проверка совпадения паролей перед отправкой
    if (formData.password !== formData.password_confirm) {
      setError(prev => ({
        ...prev,
        password_confirm: "Пароли не совпадают"
      }));
      return;
    }
    
    setError({});
    setLoading(true);

    try {
      // Сначала получаем CSRF-токен, делая GET-запрос
      const csrfResponse = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/register/`, {
        method: 'GET',
        credentials: 'include'
      });

      // Получаем CSRF-токен из кукиc
      const csrfToken = document.cookie.split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];

      if (!csrfToken) {
        throw new Error('Не удалось получить CSRF-токен');
      }

      // Отправляем запрос на регистрацию с CSRF-токеном
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/register/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/login');
      } else {
        if (typeof data === 'object') {
          // Обработка ошибок в формате {field: [error_message]}
          const newErrors = {};
          for (const [key, value] of Object.entries(data)) {
            if (Array.isArray(value)) {
              newErrors[key] = value[0];
            } else {
              newErrors[key] = value;
            }
          }
          setError(newErrors);
        } else {
          setError({ general: data.error || 'Произошла ошибка при регистрации' });
        }
      }
    } catch (error) {
      setError({ general: 'Произошла ошибка при подключении к серверу: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2>Регистрация</h2>
      {error.general && (
        <div className="error-message general-error">
          {error.general}
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
          <label htmlFor="email">Email:</label>
          <input 
            type="email" 
            id="email"
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            className={error.email ? "error-input" : ""}
            required 
          />
          {error.email && (
            <div className="error-message">{error.email}</div>
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
        <div className="form-group">
          <label htmlFor="password_confirm">Подтверждение пароля:</label>
          <input 
            type="password" 
            id="password_confirm"
            name="password_confirm" 
            value={formData.password_confirm} 
            onChange={handleChange} 
            className={error.password_confirm ? "error-input" : ""}
            required 
          />
          {error.password_confirm && (
            <div className="error-message">{error.password_confirm}</div>
          )}
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Регистрация..." : "Зарегистрироваться"}
        </button>
        <div className="auth-links">
          <p>Уже есть аккаунт? <Link to="/login">Войти</Link></p>
        </div>
      </form>
      <Link to="/" className="back-button">
        <span className="back-arrow">←</span> На главную
      </Link>
    </div>
  );
};

export default Register;
  