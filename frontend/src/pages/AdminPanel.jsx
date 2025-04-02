import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navigation/Navbar';
import './AdminPanel.css';

const API_URL = `${import.meta.env.VITE_SERVER_URL}/api`;

// Функция для получения CSRF токена
const getCsrfToken = () => {
    return document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1] || '';
};

const AdminPanel = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        checkAdminAccess();
        fetchUsers();
    }, []);

    const checkAdminAccess = async () => {
        try {
            const csrfToken = getCsrfToken();
            if (!csrfToken) {
                throw new Error('Отсутствует CSRF токен. Пожалуйста, войдите снова.');
            }

            const response = await fetch(`${API_URL}/profile/`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                }
            });

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('Ошибка CSRF токена. Пожалуйста, обновите страницу.');
                }
                throw new Error('Требуется вход в систему');
            }

            const userData = await response.json();
            if (!userData.is_admin) {
                throw new Error('Доступ запрещен. Требуются права администратора.');
            }
        } catch (error) {
            setError(error.message);
            // Даем пользователю время прочитать сообщение об ошибке
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        }
    };

    const fetchUsers = async () => {
        try {
            const csrfToken = getCsrfToken();
            if (!csrfToken) {
                throw new Error('Отсутствует CSRF токен');
            }

            const response = await fetch(`${API_URL}/users/`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                }
            });

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('Ошибка CSRF токена');
                }
                throw new Error('Ошибка при получении списка пользователей');
            }

            const data = await response.json();
            setUsers(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
            return;
        }

        try {
            const csrfToken = getCsrfToken();
            if (!csrfToken) {
                throw new Error('Отсутствует CSRF токен');
            }

            const response = await fetch(`${API_URL}/users/${userId}/`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                }
            });

            if (!response.ok) {
                throw new Error('Ошибка при удалении пользователя');
            }

            setSuccessMessage('Пользователь успешно удален');
            setUsers(users.filter(user => user.id !== userId));
        } catch (error) {
            setError(error.message);
        }
    };

    const handleToggleAdmin = async (userId, isCurrentlyAdmin) => {
        try {
            const csrfToken = getCsrfToken();
            if (!csrfToken) {
                throw new Error('Отсутствует CSRF токен');
            }

            const response = await fetch(`${API_URL}/users/${userId}/toggle_admin/`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                }
            });

            if (!response.ok) {
                throw new Error('Ошибка при изменении прав пользователя');
            }

            const data = await response.json();
            setSuccessMessage(`Права администратора ${data.is_admin ? 'назначены' : 'удалены'}`);
            
            // Обновляем список пользователей
            setUsers(users.map(user => 
                user.id === userId ? { ...user, is_admin: data.is_admin } : user
            ));
        } catch (error) {
            setError(error.message);
        }
    };

    const viewUserFiles = (userId, username) => {
        navigate(`/dashboard?user=${userId}`, { state: { username } });
    };

    // Отображение состояния загрузки
    if (loading) {
        return (
            <>
                <Navbar />
                <div className="admin-panel">
                    <div className="loading">Загрузка...</div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="admin-panel">
                <h2>Управление пользователями</h2>
                
                {error && (
                    <div className="error-message" onClick={() => setError('')}>
                        {error}
                    </div>
                )}
                
                {successMessage && (
                    <div className="success-message" onClick={() => setSuccessMessage('')}>
                        {successMessage}
                    </div>
                )}

                <div className="users-table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Логин</th>
                                <th>Email</th>
                                <th>Дата регистрации</th>
                                <th>Администратор</th>
                                <th>Хранилище</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>{new Date(user.date_joined).toLocaleString('ru-RU')}</td>
                                    <td>
                                        <span className={user.is_admin ? 'badge-admin' : 'badge-user'}>
                                            {user.is_admin ? 'Да' : 'Нет'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="storage-info">
                                            <div>Файлов: {user.total_files || 0}</div>
                                            <div>Размер: {formatFileSize(user.total_storage || 0)}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button 
                                                className="action-button view" 
                                                onClick={() => viewUserFiles(user.id, user.username)}
                                            >
                                                Файлы
                                            </button>
                                            <button 
                                                className={`action-button ${user.is_admin ? 'revoke' : 'grant'}`}
                                                onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                                            >
                                                {user.is_admin ? 'Отозвать права' : 'Сделать админом'}
                                            </button>
                                            <button 
                                                className="action-button delete"
                                                onClick={() => handleDeleteUser(user.id)}
                                            >
                                                Удалить
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {users.length === 0 && (
                        <div className="no-users">Пользователи не найдены</div>
                    )}
                </div>
            </div>
        </>
    );
};

// Вспомогательная функция для форматирования размера файлов
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default AdminPanel; 