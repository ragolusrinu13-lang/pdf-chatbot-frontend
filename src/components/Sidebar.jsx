
import { useEffect, useState } from 'react';
import {
  getUploadedFiles,
  deletePdf,
  getChatSessions,
  deleteChatSession,
} from '../services/api';

import './Sidebar.css';

function Sidebar({
  refreshKey,
  onNewChat,
  onSelectChat,
  activeSessionId,
  sessionRefreshKey,
}) {
  const [files, setFiles] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);

  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const loadFiles = async () => {
    try {
      setLoading(true);
      const response = await getUploadedFiles();
      setFiles(response.data.files || []);
    } catch (err) {
      setError('Unable to load PDF files.');
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    try {
      setSessionsLoading(true);
      const response = await getChatSessions();
      setSessions(response.data || []);
    } catch (err) {
      setError('Unable to load chat history.');
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [refreshKey]);

  useEffect(() => {
    loadSessions();
  }, [sessionRefreshKey]);

  const handleDeletePdf = async () => {
    if (!selectedFile) return;

    try {
      setDeleting(true);
      setError('');

      await deletePdf(selectedFile);

      setFiles((previousFiles) =>
        previousFiles.filter((file) => file !== selectedFile)
      );

      setSelectedFile(null);
    } catch (err) {
      setError('Unable to delete PDF. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteChat = async () => {
    if (!selectedSession) return;

    try {
      setDeleting(true);
      setError('');

      await deleteChatSession(selectedSession.sessionId);

      setSessions((previousSessions) =>
        previousSessions.filter(
          (session) => session.sessionId !== selectedSession.sessionId
        )
      );

      if (activeSessionId === selectedSession.sessionId) {
        onNewChat();
      }

      setSelectedSession(null);
    } catch (err) {
      setError('Unable to delete chat. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <aside className="sidebar">
      <h2>PDF Chatbot</h2>

      <button className="new-chat" onClick={onNewChat}>
        + New Chat
      </button>

      {/* Chat History */}
      <div className="sidebar-section">
        <p>CHAT HISTORY</p>

        {sessionsLoading && (
          <p className="file-info">Loading chats...</p>
        )}

        {!sessionsLoading && sessions.length === 0 && (
          <p className="file-info">No previous chats</p>
        )}

        {sessions.map((session) => (
          <div
            key={session.sessionId}
            className={`history-item ${
              activeSessionId === session.sessionId
                ? 'active-history'
                : ''
            }`}
            title={session.title}
          >
            <div
              className="history-select"
              onClick={() => onSelectChat(session.sessionId)}
            >
              <span>💬</span>
              <span className="history-title">
                {session.title || 'New Chat'}
              </span>
            </div>

            <button
              className="chat-delete-btn"
              title="Delete chat"
              onClick={() => setSelectedSession(session)}
            >
              🗑️
            </button>
          </div>
        ))}
      </div>

      {/* Uploaded Documents */}
      <div className="sidebar-section documents-section">
        <p>YOUR DOCUMENTS</p>

        {loading && <p className="file-info">Loading files...</p>}

        {!loading && files.length === 0 && (
          <p className="file-info">No documents uploaded</p>
        )}

        {files.map((file) => (
          <div className="file-item" key={file}>
            <span
              className="file-name"
              title={file}
              onClick={() => setSelectedFile(file)}
            >
              📄 {file}
            </span>
          </div>
        ))}
      </div>

      {error && <p className="file-error">{error}</p>}

      {/* PDF Delete Popup */}
      {selectedFile && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <div className="delete-icon">🗑️</div>

            <h3>Delete PDF?</h3>

            <p>Are you sure you want to delete this document?</p>

            <div className="selected-file">
              📄 {selectedFile}
            </div>

            <p className="warning-text">
              This action cannot be undone.
            </p>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setSelectedFile(null)}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                className="confirm-delete-btn"
                onClick={handleDeletePdf}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Delete Popup */}
      {selectedSession && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <div className="delete-icon">🗑️</div>

            <h3>Delete Chat?</h3>

            <p>Are you sure you want to delete this conversation?</p>

            <div className="selected-file">
              💬 {selectedSession.title || 'New Chat'}
            </div>

            <p className="warning-text">
              This action cannot be undone.
            </p>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setSelectedSession(null)}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                className="confirm-delete-btn"
                onClick={handleDeleteChat}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
