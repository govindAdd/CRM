import axios from "axios";

// Create Axios instance
const api = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_URL}/api/v1`,
  withCredentials: true, // ✅ Important for HttpOnly cookies
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
        // ✅ Attempt to refresh access token via HttpOnly cookie
        const res = await api.post("/users/refresh");

        const { accessToken, user } = res.data?.data || {};

        if (accessToken) {
          // ✅ Save new access token only
          localStorage.setItem("authToken", accessToken);

          // ✅ Update Redux state with fresh user info
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
        // ❌ Refresh failed — force logout
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
