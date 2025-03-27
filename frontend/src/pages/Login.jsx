import React, { useState } from "react";
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
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/login/`, {
        method: "POST",
        credentials: 'include',  // Важно для работы с сессиями
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: formData.username, password: formData.password })
      });

      const data = await response.json();

      if (response.ok) {
        // Больше не сохраняем токен
        navigate('/dashboard');
      } else {
        setError(data.error || 'Произошла ошибка при входе');
      }
    } catch (error) {
      setError('Произошла ошибка при подключении к серверу');
    } finally {
      setLoading(false);
    }
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
  