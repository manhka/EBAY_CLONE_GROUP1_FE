import axios from "axios";
import { getCsrfToken, fetchCsrfToken } from "./csrfManager";

let authCallbacks = {
  onLogout: () => console.error("onLogout callback not set in apiInterceptor"),
};

export const setAuthCallbacks = (callbacks) => {
  if (callbacks && typeof callbacks.onLogout === 'function') {
    authCallbacks.onLogout = callbacks.onLogout;
  }
};

const apiInterceptor = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3000/api",
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

apiInterceptor.interceptors.request.use(
  async (config) => {
    console.log("Request Interceptor:", config.method, config.url);
    if (
      config.method !== "get" &&
      config.method !== "head" &&
      config.method !== "options"
    ) {
      let csrfToken = getCsrfToken();
      if (!csrfToken) {
        try {
          csrfToken = await fetchCsrfToken();
        } catch (error) {
          throw new Error("CSRF token is missing.");
        }
      }
      config.headers["X-CSRF-Token"] = csrfToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiInterceptor.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data?.msg === "NoAccessTokenInCookie" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => apiInterceptor(originalRequest));
      }

      isRefreshing = true;

      return new Promise(async (resolve, reject) => {
        try {
          let csrfToken = getCsrfToken();
          if (!csrfToken) {
            csrfToken = await fetchCsrfToken();
          }

          await apiInterceptor.post("/auth/refresh-token", {}, {
            headers: {
              "X-CSRF-Token": csrfToken,
            },
          });

          isRefreshing = false;
          processQueue(null);
          resolve(apiInterceptor(originalRequest));
        } catch (refreshError) {
          isRefreshing = false;
          processQueue(refreshError);
          window.dispatchEvent(new Event("auth:logout"));
          reject(refreshError);
        }
      });
    }

    return Promise.reject(error);
  }
);

export default apiInterceptor;
