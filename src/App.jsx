
import { useState } from 'react';
import './App.css';

import Sidebar from './components/Sidebar';
import FileUpload from './components/FileUpload';

import {
  createChatSession,
  sendMessage,
  getChatMessages,
} from './services/api';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [sessionRefreshKey, setSessionRefreshKey] = useState(0);

  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');

  const [loading, setLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUploadSuccess = () => {
    setRefreshKey((previous) => previous + 1);
  };

  // Start a new chat
  const handleNewChat = () => {
    setSessionId(null);
    setMessages([]);
    setQuestion('');
    setError('');
  };

  // Open a previous chat
  const handleSelectChat = async (selectedSessionId) => {
    try {
      setLoading(true);
      setError('');

      setSessionId(selectedSessionId);
      setMessages([]);
      setQuestion('');

      const response = await getChatMessages(selectedSessionId);

      const previousMessages = response.data.map((message) => ({
        role: message.role.toLowerCase(),
        content: message.content,
        sources: [],
      }));

      setMessages(previousMessages);

    } catch (err) {
      setError('Unable to load this conversation.');
    } finally {
      setLoading(false);
    }
  };

  // Send a question
  const handleSendMessage = async () => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loading || sessionLoading) {
      return;
    }

    setQuestion('');
    setLoading(true);
    setError('');

    try {
      let currentSessionId = sessionId;

      // Create a session using the first question as its title
      if (!currentSessionId) {
        setSessionLoading(true);

        const sessionResponse = await createChatSession(trimmedQuestion);

        currentSessionId = sessionResponse.data.sessionId;

        setSessionId(currentSessionId);

        setSessionRefreshKey((previous) => previous + 1);

        setSessionLoading(false);
      }

      // Display user question
      const userMessage = {
        role: 'user',
        content: trimmedQuestion,
      };

      setMessages((previous) => [...previous, userMessage]);

      // Get answer from backend
      const response = await sendMessage(
        currentSessionId,
        trimmedQuestion
      );

      // Display AI answer and PDF sources
      const assistantMessage = {
        role: 'assistant',
        content: response.data.answer,
        sources: response.data.sources || [],
      };

      setMessages((previous) => [...previous, assistantMessage]);

    } catch (err) {
      console.error('Chat error:', err);

      setError('Unable to get an answer. Please try again.');
      setSessionLoading(false);
    } finally {
      setLoading(false);
      setSessionLoading(false);
    }
  };

  return (
    <div className="app">

      <Sidebar
        refreshKey={refreshKey}
        sessionRefreshKey={sessionRefreshKey}
        activeSessionId={sessionId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
      />

      <main className="main-content">

        <header className="topbar">
          <h3>Chat with your PDF</h3>
          <span className="status">● Local AI</span>
        </header>

        <section className="chat-area">

          {messages.length === 0 ? (
            <div className="welcome">

              <h1>Welcome to PDF Chatbot</h1>

              <p>
                Upload a PDF and ask questions about its content.
              </p>

              <FileUpload
                onUploadSuccess={handleUploadSuccess}
              />

              {sessionLoading && (
                <p className="chat-info">
                  Creating new chat...
                </p>
              )}

              {loading && (
                <p className="chat-info">
                  Loading conversation...
                </p>
              )}

            </div>
          ) : (
            <div className="chat-messages">

              {messages.map((message, index) => (
                <div
                  className={`chat-message ${message.role}-message`}
                  key={index}
                >

                  <div className="message-role">
                    {message.role === 'user'
                      ? 'You'
                      : 'AI Assistant'}
                  </div>

                  <div className="message-content">
                    {message.content}
                  </div>

                  {message.sources?.length > 0 && (
                    <div className="sources">

                      <h4>Sources</h4>

                      {message.sources.map((source, sourceIndex) => (
                        <div
                          className="source-item"
                          key={sourceIndex}
                        >
                          <span>📄 {source.fileName}</span>
                          <span>Page {source.pageNumber}</span>
                          <span>Chunk {source.chunkNumber}</span>
                        </div>
                      ))}

                    </div>
                  )}

                </div>
              ))}
             
              {loading && (
                <div className="chat-message assistant-message">
                  <div className="message-role">
                    AI Assistant
                  </div>

                  <div className="message-content">
                    Thinking...
                  </div>
                </div>
              )}

            </div>
          )}

        </section>

        {error && (
          <p className="chat-error">
            {error}
          </p>
        )}

        <div className="message-box">

          <input
            type="text"
            placeholder="Ask something about your PDF..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
            disabled={loading || sessionLoading}
          />

          <button
            onClick={handleSendMessage}
            disabled={
              !question.trim() ||
              loading ||
              sessionLoading
            }
          >
            {loading ? 'Sending...' : 'Send'}
          </button>

        </div>

      </main>

    </div>
  );
}

export default App;
