import axios from "axios";
import { getCsrfToken, fetchCsrfToken } from "./csrfManager";

const apiInterceptor = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3000/api",
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiInterceptor.interceptors.request.use(
  async (config) => {
    console.log("Request Interceptor: config", config);

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
          console.warn("Failed to fetch CSRF token for request:", config.url);
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
  (response) => {
    console.log("Response Interceptor: response", response);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data.msg === "NoAccessTokenInCookie" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiInterceptor(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      return new Promise(async (resolve, reject) => {
        try {
          let csrfToken = getCsrfToken();
          if (!csrfToken) {
            csrfToken = await fetchCsrfToken();
          }
          const refreshResponse = await apiInterceptor.post(
            "/auth/refresh-token",
            {},
            {
              headers: {
                "X-CSRF-Token": csrfToken,
              },
            }
          );

          isRefreshing = false;
          processQueue(null);
          resolve(apiInterceptor(originalRequest));
        } catch (refreshError) {
          isRefreshing = false;
          processQueue(refreshError, null);
          console.error(
            "Error refreshing token:",
            refreshError.response?.data?.msg || refreshError.message
          );
          window.dispatchEvent(new Event("auth:logout"));
          reject(refreshError);
        }
      });
    }

    console.error(
      "Authentication error:",
      error.response?.data?.msg || error.message
    );
    return Promise.reject(error);
  }
);

export default apiInterceptor;
