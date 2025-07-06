// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_URL}/api/v1`,
  withCredentials: true,
  timeout: 10000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const { response } = error;

    if (response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/api/v1/users/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newToken = res.data?.accessToken;
        if (newToken) {
          localStorage.setItem('authToken', newToken);
          const { store } = await import('../store/store.js');
          const { setUser } = await import('../store/authSlice.js');
          store.dispatch(setUser(res.data.user));
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        const { store } = await import('../store/store.js');
        const { logoutUser } = await import('../store/authSlice.js');
        store.dispatch(logoutUser());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
