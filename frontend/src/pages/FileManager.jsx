import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './FileManager.css';

// Компонент для отображения ошибок
const ErrorAlert = ({ error, onClose }) => {
    if (!error) return null;
    
    return (
        <div className="alert alert-danger">
            {error}
            <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
    );
};

// Компонент формы загрузки файла
const UploadForm = ({ onUpload, loading }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [comment, setComment] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('comment', comment);

        await onUpload(formData);
        setSelectedFile(null);
        setComment('');
    };

    return (
        <form onSubmit={handleSubmit} className="upload-form">
            <div className="form-group">
                <label>Выберите файл:</label>
                <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="form-control"
                />
            </div>
            <div className="form-group">
                <label>Комментарий:</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Введите комментарий к файлу"
                    className="form-control"
                />
            </div>
            <button type="submit" disabled={loading || !selectedFile} className="btn btn-primary">
                {loading ? 'Загрузка...' : 'Загрузить файл'}
            </button>
        </form>
    );
};

// Компонент таблицы файлов
const FilesTable = ({ files, onDelete, onRename, onCopyLink }) => {
    return (
        <div className="files-table">
            <table>
                <thead>
                    <tr>
                        <th>Имя файла</th>
                        <th>Комментарий</th>
                        <th>Размер</th>
                        <th>Загружен</th>
                        <th>Последнее скачивание</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {files.map(file => (
                        <tr key={file.id}>
                            <td>{file.original_name}</td>
                            <td>{file.comment}</td>
                            <td>{file.file_size}</td>
                            <td>{new Date(file.upload_date).toLocaleString('ru')}</td>
                            <td>
                                {file.last_download
                                    ? new Date(file.last_download).toLocaleString('ru')
                                    : 'Нет скачиваний'}
                            </td>
                            <td>
                                <div className="btn-group">
                                    <a
                                        href={`${process.env.REACT_APP_API_URL}${file.share_link}`}
                                        className="btn btn-success"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Скачать
                                    </a>
                                    <button
                                        onClick={() => onRename(file.id, file.original_name)}
                                        className="btn btn-info"
                                    >
                                        Переименовать
                                    </button>
                                    <button
                                        onClick={() => onCopyLink(file.share_link)}
                                        className="btn btn-secondary"
                                    >
                                        Копировать ссылку
                                    </button>
                                    <button
                                        onClick={() => onDelete(file.id)}
                                        className="btn btn-danger"
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const FileManager = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Загрузка списка файлов
    const fetchFiles = useCallback(async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/files/`, {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`
                }
            });
            setFiles(response.data);
        } catch (err) {
            setError('Ошибка при загрузке списка файлов');
            console.error(err);
            if (err.response?.status === 401) {
                // Если токен недействителен, перенаправляем на страницу входа
                window.location.href = '/login';
            }
        }
    }, []);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    // Обработчик загрузки файла
    const handleUpload = async (formData) => {
        setLoading(true);
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/files/`, formData, {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            await fetchFiles();
        } catch (err) {
            setError('Ошибка при загрузке файла');
            console.error(err);
        }
        setLoading(false);
    };

    // Обработчик удаления файла
    const handleDelete = async (fileId) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот файл?')) {
            return;
        }

        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/files/${fileId}/`, {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`
                }
            });
            await fetchFiles();
        } catch (err) {
            setError('Ошибка при удалении файла');
            console.error(err);
        }
    };

    // Обработчик переименования файла
    const handleRename = async (fileId, currentName) => {
        const newName = window.prompt('Введите новое имя файла:', currentName);
        if (!newName || newName === currentName) {
            return;
        }

        try {
            await axios.post(
                `${process.env.REACT_APP_API_URL}/api/files/${fileId}/rename/`,
                { new_name: newName },
                {
                    headers: {
                        'Authorization': `Token ${localStorage.getItem('token')}`
                    }
                }
            );
            await fetchFiles();
        } catch (err) {
            setError('Ошибка при переименовании файла');
            console.error(err);
        }
    };

    // Обработчик копирования ссылки
    const handleCopyLink = (link) => {
        const fullLink = `${process.env.REACT_APP_API_URL}${link}`;
        navigator.clipboard.writeText(fullLink)
            .then(() => alert('Ссылка скопирована в буфер обмена'))
            .catch(() => setError('Ошибка при копировании ссылки'));
    };

    return (
        <div className="file-manager">
            <h1>Файловое хранилище</h1>
            
            <ErrorAlert error={error} onClose={() => setError(null)} />
            
            <UploadForm onUpload={handleUpload} loading={loading} />
            
            <FilesTable
                files={files}
                onDelete={handleDelete}
                onRename={handleRename}
                onCopyLink={handleCopyLink}
            />
        </div>
    );
};

export default FileManager;