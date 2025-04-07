import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/profile/`, {
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_SERVER_URL}/api/logout/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setIsAuthenticated(false);
      setIsAdmin(false);
      setUsername('');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, username, loading, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
