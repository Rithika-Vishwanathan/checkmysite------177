import axios from 'axios';
import { auth } from './firebase';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use(async (config) => {
  const user = auth?.currentUser;

  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

export default api;
