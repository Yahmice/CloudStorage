import React, { useState } from "react";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  console.log("Отправляемые данные:", formData);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("")
    try {
      const response = await fetch('http://127.0.0.1:8000/api/register/', {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        }),
      });

      const responseData = await response.json(); 

      console.log("Ответ сервера:", responseData);

      if (!response.ok) throw new Error("Ошибка регистрации");
      alert("Регистрация успешна!");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="register-container">
      <h2>Регистрация</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" name="username" placeholder="Логин" value={formData.username} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Пароль" value={formData.password} onChange={handleChange} required />
        <button type="submit">Зарегистрироваться</button>
      </form>
    </div>
  );
};
  
  export default Register;
  