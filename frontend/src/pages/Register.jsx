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
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/register/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/login');
      } else {
        setError(data.error || 'Произошла ошибка при регистрации');
      }
    } catch (error) {
      setError('Произошла ошибка при подключении к серверу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2>Регистрация</h2>
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
  