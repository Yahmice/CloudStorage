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
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Очищаем ошибку поля при изменении
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('http://127.0.0.1:8000/api/register/', {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("Ответ сервера:", data);

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user_id', data.user_id);
        localStorage.setItem('username', data.username);
        navigate('/dashboard');
      } else {
        const newErrors = {};
        // Обработка ошибок валидации с бэкенда
        if (typeof data === 'object') {
          Object.keys(data).forEach(key => {
            if (Array.isArray(data[key])) {
              newErrors[key] = data[key][0];
            } else {
              newErrors[key] = data[key];
            }
          });
        } else {
          newErrors.general = "Ошибка регистрации";
        }
        setErrors(newErrors);
      }
    } catch (err) {
      console.error("Ошибка:", err);
      setErrors({ general: "Ошибка сети, попробуйте позже" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2>Регистрация</h2>
      {errors.general && (
        <div className="error-message general-error">
          {errors.general}
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
            className={errors.username ? "error-input" : ""}
            required 
          />
          {errors.username && (
            <div className="error-message">{errors.username}</div>
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
            className={errors.email ? "error-input" : ""}
            required 
          />
          {errors.email && (
            <div className="error-message">{errors.email}</div>
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
            className={errors.password ? "error-input" : ""}
            required 
          />
          {errors.password && (
            <div className="error-message">{errors.password}</div>
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
            className={errors.password_confirm ? "error-input" : ""}
            required 
          />
          {errors.password_confirm && (
            <div className="error-message">{errors.password_confirm}</div>
          )}
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Регистрация..." : "Зарегистрироваться"}
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
  