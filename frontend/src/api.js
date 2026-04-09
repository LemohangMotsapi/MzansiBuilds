import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Point this to your Express backend
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    // If a token exists, it sticks it in the "Authorization" header
    // This allows the backend to know WHO is making the request
    req.headers.Authorization = `Bearer ${token}`;
  }
  
  return req;
});

export default API;