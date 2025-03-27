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
    const fetchFiles = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/files/`, {
                credentials: 'include'
            });
            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '/login';
                    return;
                }
                throw new Error('Ошибка при загрузке файлов');
            }
            const data = await response.json();
            setFiles(data);
        } catch (error) {
            console.error('Ошибка:', error);
            setError('Не удалось загрузить файлы');
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    // Обработчик загрузки файла
    const handleUpload = async (formData) => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/files/upload/`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Ошибка при загрузке файла');
            }

            const data = await response.json();
            setFiles(prevFiles => [...prevFiles, data]);
        } catch (error) {
            console.error('Ошибка:', error);
            setError('Не удалось загрузить файл');
        }
        setLoading(false);
    };

    // Обработчик удаления файла
    const handleDelete = async (fileId) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот файл?')) {
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/files/${fileId}/`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Ошибка при удалении файла');
            }

            setFiles(prevFiles => prevFiles.filter(f => f.id !== fileId));
        } catch (error) {
            console.error('Ошибка:', error);
            setError('Не удалось удалить файл');
        }
    };

    // Обработчик переименования файла
    const handleRename = async (fileId, currentName) => {
        const newName = window.prompt('Введите новое имя файла:', currentName);
        if (!newName || newName === currentName) {
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/files/${fileId}/rename/`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: newName })
            });

            if (!response.ok) {
                throw new Error('Ошибка при переименовании файла');
            }

            const updatedFile = await response.json();
            setFiles(prevFiles => prevFiles.map(file => 
                file.id === fileId ? updatedFile : file
            ));
        } catch (error) {
            console.error('Ошибка:', error);
            setError('Не удалось переименовать файл');
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