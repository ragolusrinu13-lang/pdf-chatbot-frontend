
import { useState } from 'react';
import { uploadPdf } from '../services/api';
import './FileUpload.css';

function FileUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a PDF first.');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      const response = await uploadPdf(file);

      setMessage(response.data.message);
      setFile(null);

      const input = document.getElementById('pdf-input');
      if (input) input.value = '';

      onUploadSuccess?.();
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'PDF upload failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <label htmlFor="pdf-input" className="choose-file">
        <span className="upload-icon">📄</span>
        <span>{file ? file.name : 'Choose a PDF file'}</span>
      </label>

      <input
        id="pdf-input"
        type="file"
        accept=".pdf,application/pdf"
        hidden
        onChange={(e) => {
          const selectedFile = e.target.files[0];

          if (selectedFile && selectedFile.type !== 'application/pdf') {
            setFile(null);
            setMessage('Please select a valid PDF file.');
            e.target.value = '';
            return;
          }

          setFile(selectedFile || null);
          setMessage('');
        }}
      />

      <button
        className="upload-button"
        onClick={handleUpload}
        disabled={loading || !file}
      >
        {loading ? 'Uploading...' : 'Upload PDF'}
      </button>

      {message && (
        <p className="upload-message">{message}</p>
      )}
    </div>
  );
}

export default FileUpload;
