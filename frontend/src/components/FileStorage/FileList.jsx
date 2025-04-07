import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './FileList.css';

const formatDate = (dateString) => {
  if (!dateString) return 'Не скачивался';
  return new Date(dateString).toLocaleString('ru-RU');
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FileList = ({ files, onDelete, onRename, onDownload, onCopyLink, isAdmin }) => {
  const [editingFile, setEditingFile] = useState(null);
  const [newName, setNewName] = useState('');

  const handleRename = (file) => {
    setEditingFile(file.id);
    setNewName(file.original_name);
  };

  const handleSubmit = (fileId) => {
    if (newName.trim()) {
      onRename(fileId, newName.trim());
      setEditingFile(null);
    }
  };

  const handleCancel = () => {
    setEditingFile(null);
  };

  return (
    <div className="file-list">
      <table>
        <thead>
          <tr>
            <th>Название файла</th>
            <th>Комментарий</th>
            <th>Размер</th>
            <th>Владелец</th>
            <th>Дата загрузки</th>
            <th>Последнее скачивание</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file.id}>
              <td>
                {editingFile === file.id ? (
                  <div className="rename-controls">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="rename-input"
                    />
                    <button onClick={() => handleSubmit(file.id)} className="action-button save">
                      Сохранить
                    </button>
                    <button onClick={handleCancel} className="action-button cancel">
                      Отмена
                    </button>
                  </div>
                ) : (
                  <span className="file-name">{file.original_name}</span>
                )}
              </td>
              <td>{file.comment || '-'}</td>
              <td>{formatFileSize(file.size)}</td>
              <td>{file.owner_username}</td>
              <td>{formatDate(file.upload_date)}</td>
              <td>{formatDate(file.last_download)}</td>
              <td>
                <div className="action-buttons">
                  <button onClick={() => onDownload(file)} className="action-button download">
                    Скачать
                  </button>
                  {(isAdmin || file.is_owner) && (
                    <>
                      <button onClick={() => handleRename(file)} className="action-button rename">
                        Переименовать
                      </button>
                      <button onClick={() => onDelete(file)} className="action-button delete">
                        Удалить
                      </button>
                    </>
                  )}
                  <button onClick={() => onCopyLink(file)} className="action-button copy">
                    Копировать ссылку
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {files.length === 0 && (
        <div className="no-files">Нет доступных файлов</div>
      )}
    </div>
  );
};

FileList.propTypes = {
  files: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      original_name: PropTypes.string.isRequired,
      name: PropTypes.string,
      comment: PropTypes.string,
      size: PropTypes.number.isRequired,
      owner_username: PropTypes.string.isRequired,
      upload_date: PropTypes.string.isRequired,
      last_download: PropTypes.string,
      is_owner: PropTypes.bool.isRequired
    })
  ).isRequired,
  onDelete: PropTypes.func.isRequired,
  onRename: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  onCopyLink: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool.isRequired
};

export default FileList; 