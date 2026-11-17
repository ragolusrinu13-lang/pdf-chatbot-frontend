
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Upload PDF and store its chunks in ChromaDB
export const uploadPdf = (file) => {
  const formData = new FormData();
  formData.append('file', file);

  return API.post('/documents/store', formData);
};

// Get uploaded PDF file names
export const getUploadedFiles = () => {
  return API.get('/documents/files');
};

// Delete a PDF from ChromaDB
export const deletePdf = (fileName) => {
  return API.delete('/documents/delete', {
    params: { fileName },
  });
};

// Create a new chat session
export const createChatSession = (title) => {
  return API.post('/ai/sessions', null, {
    params: { title },
  });
};

// Send a question to an existing chat session
export const sendMessage = (sessionId, question) => {
  return API.post('/ai/chat', null, {
    params: { sessionId, question },
  });
};

// Get all previous chat sessions
export const getChatSessions = () => {
  return API.get('/ai/sessions');
};

// Get messages from a selected chat session
export const getChatMessages = (sessionId) => {
  return API.get(`/ai/sessions/${sessionId}/messages`);
};
export const deleteChatSession = (sessionId) =>
    API.delete(`/ai/sessions/${sessionId}`);