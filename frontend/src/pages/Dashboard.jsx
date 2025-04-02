import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FileList from '../components/FileStorage/FileList';
import FileUpload from '../components/FileStorage/FileUpload';
import Navbar from '../components/Navigation/Navbar';
import './Dashboard.css';

const API_URL = `${import.meta.env.VITE_SERVER_URL}/api`;

const getHeaders = () => {
  const csrfToken = document.cookie.split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
    
  return {
    'Content-Type': 'application/json',
    'X-CSRFToken': csrfToken,
    'Accept': 'application/json'
  };
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_URL}/profile/`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          navigate('/login');
          return;
        }

        // После успешной проверки аутентификации загружаем файлы
        await fetchFiles();
      } catch (error) {
        console.error('Ошибка при проверке аутентификации:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const fetchFiles = async () => {
    try {
      const response = await fetch(`${API_URL}/files/`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Ошибка при загрузке файлов');
      }
      
      const data = await response.json();
      setFiles(data);
    } catch (err) {
      setError('Ошибка при загрузке списка файлов');
    }
  };

  const handleUpload = async (file, comment) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('comment', comment);

    try {
      // Получаем CSRF токен из куки
      const csrfToken = document.cookie.split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];

      const response = await fetch(`${API_URL}/files/upload/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-CSRFToken': csrfToken
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при загрузке файла');
      }

      setSuccessMessage('Файл успешно загружен');
      fetchFiles();
    } catch (err) {
      throw new Error(err.message || 'Ошибка при загрузке файла');
    }
  };

  const handleDelete = async (file) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот файл?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/files/${file.id}/`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error('Ошибка при удалении файла');
      }

      setSuccessMessage('Файл успешно удален');
      fetchFiles();
    } catch (err) {
      setError('Ошибка при удалении файла');
    }
  };

  const handleRename = async (fileId, newName) => {
    try {
      // Получаем CSRF токен из куки
      const csrfToken = document.cookie.split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];

      const response = await fetch(`${API_URL}/files/${fileId}/rename/`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({ name: newName })
      });

      if (!response.ok) {
        throw new Error('Ошибка при переименовании файла');
      }

      setSuccessMessage('Файл успешно переименован');
      fetchFiles();
    } catch (err) {
      setError('Ошибка при переименовании файла');
    }
  };

  const handleDownload = async (file) => {
    try {
      const response = await fetch(`${API_URL}/files/${file.id}/download/`, {
        credentials: 'include',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error('Ошибка при скачивании файла');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      fetchFiles();
    } catch (err) {
      setError('Ошибка при скачивании файла');
    }
  };

  const handleCopyLink = async (file) => {
    try {
      const response = await fetch(`${API_URL}/files/${file.id}/share/`, {
        credentials: 'include',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error('Ошибка при получении ссылки');
      }

      const data = await response.json();
      await navigator.clipboard.writeText(data.share_link);
      setSuccessMessage('Ссылка скопирована в буфер обмена');
    } catch (err) {
      setError('Ошибка при копировании ссылки');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_SERVER_URL}/api/logout/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      navigate('/login');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">Загрузка...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="dashboard">
        <h2>Файловое хранилище</h2>
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
        
        <FileUpload onUpload={handleUpload} />
        
        <FileList
          files={files}
          onDelete={handleDelete}
          onRename={handleRename}
          onDownload={handleDownload}
          onCopyLink={handleCopyLink}
          isAdmin={isAdmin}
        />
      </div>
    </>
  );
};

export default Dashboard;
  