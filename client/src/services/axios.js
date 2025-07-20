import axios from "axios";

// Create Axios instance
const api = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_URL}/api/v1`,
  withCredentials: true,
  timeout: 10000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// ========================= Request Interceptor ========================= //
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ========================= Response Interceptor ========================= //
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const { response } = error;

    if (response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await api.post("/users/refresh");

        const { accessToken, user } = res.data?.data || {};

        if (accessToken) {
          localStorage.setItem("authToken", accessToken);
          const { store } = await import("../store/store.js");
          const { setUser } = await import("../store/authSlice.js");
          if (user) {
            store.dispatch(setUser(user));
          }

          // 🔁 Retry the original failed request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        const { store } = await import("../store/store.js");
        const { clearUser } = await import("../store/authSlice.js");

        localStorage.removeItem("authToken");
        store.dispatch(clearUser());

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
