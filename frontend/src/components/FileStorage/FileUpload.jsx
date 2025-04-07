import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import './FileUpload.css';

// Максимальный размер файла - 1 МБ (в байтах)
const MAX_FILE_SIZE = 1 * 1024 * 1024;

const FileUpload = ({ onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [comment, setComment] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Проверка размера файла
      if (file.size > MAX_FILE_SIZE) {
        setError(`Размер файла не должен превышать 1 МБ. Текущий размер: ${(file.size / (1024 * 1024)).toFixed(2)} МБ`);
        setSelectedFile(null);
        // Очищаем поле для возможности повторного выбора того же файла
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      setSelectedFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Пожалуйста, выберите файл');
      return;
    }

    // Повторная проверка размера файла перед отправкой
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(`Размер файла не должен превышать 1 МБ. Текущий размер: ${(selectedFile.size / (1024 * 1024)).toFixed(2)} МБ`);
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      await onUpload(selectedFile, comment);
      setSelectedFile(null);
      setComment('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err.message || 'Ошибка при загрузке файла');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="file-upload">
      <h3>Загрузка нового файла</h3>
      <p className="file-size-limit">Максимальный размер файла: 1 МБ</p>
      <form onSubmit={handleSubmit}>
        <div className="file-input-container">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="file-input"
            id="file-input"
          />
          <label htmlFor="file-input" className="file-input-label">
            {selectedFile ? selectedFile.name : 'Выберите файл'}
          </label>
        </div>

        <div className="comment-input">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Добавьте комментарий к файлу (необязательно)"
            rows="3"
          />
        </div>

        {error && <div className="upload-error">{error}</div>}

        <button
          type="submit"
          className="upload-button"
          disabled={isUploading || !selectedFile}
        >
          {isUploading ? 'Загрузка...' : 'Загрузить файл'}
        </button>
      </form>
    </div>
  );
};

FileUpload.propTypes = {
  onUpload: PropTypes.func.isRequired
};

export default FileUpload; 