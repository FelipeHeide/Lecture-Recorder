
import axios from 'axios';

const GrokApiKey = import.meta.env.VITE_GROQ_API_KEY;
const baseUrl = import.meta.env.VITE_BASE_URL;

export const Login = async (username, password) => {
  try {
    const response = await axios.post(`${baseUrl}login`, { username, password });
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const Register = async (name, username, email, password) => {
  try {
    const response = await axios.post(`${baseUrl}`, { name, username, email, password });
    return response.data;
  } catch (error) {
    console.error('Error registering:', error);
    throw error;
  }
};

export const Update = async (user, userId, token) => {
  try {
    const response = await axios.put(`${baseUrl}${userId}`, user, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const Get = async (userId, token) => {
  try {
    const response = await axios.get(`${baseUrl}${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const Grok = async (message) => {
  try {
    const groqApiUrl = 'https://api.groq.com/openai/v1/chat/completions';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GrokApiKey}` 
    };
    const data = {
      messages: [{ role: 'user', content: message }],
      model: 'llama3-8b-8192'
    };
    const response = await axios.post(groqApiUrl, data, { headers });
    return response.data;
  } catch (error) {
    console.error('Error generating Groq response:', error);
    throw error;
  }
};

export default { Login, Register, Update, Grok, Get };