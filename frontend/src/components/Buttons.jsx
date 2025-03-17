import React from "react";
import { Link } from "react-router-dom";
import "../index.css";

const AuthButtons = () => {
  return (
    <div className="auth-buttons">
      <Link to="/register" className="btn btn-register">Регистрация</Link>
      <Link to="/login" className="btn btn-login">Вход</Link>
      <Link to="/file-manager" className="btn btn-file-manager">Файловый менеджер</Link>
    </div>
  );
};

export default AuthButtons;
