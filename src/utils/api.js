import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

let csrfToken = null;

export const setCsrfToken = (token) => {
  csrfToken = token;
};

apiClient.interceptors.request.use(
  (config) => {
    if (
      config.method !== "get" &&
      config.method !== "head" &&
      config.method !== "options"
    ) {
      if (csrfToken) {
        config.headers["X-CSRF-Token"] = csrfToken;
      } else {
        console.warn(
          "CSRF Token not available when sending request. This request might fail if CSRF protection is active."
        );
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized: Redirecting to login...");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
