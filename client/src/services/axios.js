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

// Request Interceptor
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

// Response Interceptor (for token refresh)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const { response } = error;
    // Handle 401 (Unauthorized) only once
    if (response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token
        const res = await api.post("/users/refresh");

        const newToken = res.data?.data?.accessToken;

        if (newToken) {
          localStorage.setItem("authToken", newToken);

          // Update Redux user state
          const { store } = await import("../store/store.js");
          const { setUser } = await import("../store/authSlice.js");

          if (res.data?.data?.user) {
            store.dispatch(setUser(res.data.data.user));
          }

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed → logout
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