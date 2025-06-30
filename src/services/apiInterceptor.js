// apiInterceptor.js
import axios from "axios";

const apiInterceptor = axios.create({
  baseURL: "http://localhost:3000/api", // Set the base URL for your backend API
  withCredentials: true, // Crucial for sending and receiving cookies (including httpOnly)
});

// Variables to manage token refreshing and request queue
let isRefreshing = false;
let failedQueue = [];

// --- CSRF Token Management ---
let csrfToken = null; // This variable will hold the CSRF token
export const setCsrfToken = (token) => {
  // Function to update the CSRF token
  csrfToken = token;
};
// --- End CSRF Token Management ---

// Function to process queued requests
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

// --- Request Interceptor: Attach CSRF Token (for non-GET requests) ---
apiInterceptor.interceptors.request.use(
  (config) => {
    console.log("Request Interceptor: config", config); // Log cấu hình yêu cầu

    // Only add CSRF token for methods that modify data
    if (
      config.method !== "get" &&
      config.method !== "head" &&
      config.method !== "options"
    ) {
      if (csrfToken) {
        config.headers["X-CSRF-Token"] = csrfToken; // Attach the CSRF token
      } else {
        // If CSRF token is not available, you might want to:
        // 1. Log a warning (as you did previously)
        // 2. Prevent the request (by throwing an error) if it's critical
        // 3. Try to fetch the CSRF token (less ideal here, better at app start)
        console.warn(
          "CSRF Token not available. This request might be blocked by CSRF protection."
        );
        // Optionally, throw an error to halt the request if CSRF is mandatory
        // return Promise.reject(new Error("CSRF token is missing."));
      }
    }
    // No need to manually add JWT if it's in an httpOnly cookie.
    // If JWT were in local storage, you would add:
    // const accessToken = localStorage.getItem('accessToken');
    // if (accessToken) {
    //   config.headers.Authorization = `Bearer ${accessToken}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Response Interceptor: Handle Token Refresh ---
apiInterceptor.interceptors.response.use(
  (response) => {
    console.log("Response Interceptor: response", response); // Log phản hồi thành công

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
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            // No token to manually attach here if using httpOnly cookie
            return apiInterceptor(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      return new Promise(async (resolve, reject) => {
        try {
          console.log("go heterererere==========>");
          // This call will automatically send the httpOnly Refresh Token cookie
          const refreshResponse = await axios.post(
            "http://localhost:3000/api/auth/refresh-token",
            {},
            { withCredentials: true }
          );

          // Assuming backend sets new httpOnly Access Token cookie
          // No need to manually set a header here if using httpOnly cookies

          isRefreshing = false;
          processQueue(null); // All queued requests can now proceed

          // Retry the original request with the new (automatically attached) access token
          resolve(apiInterceptor(originalRequest));
        } catch (refreshError) {
          isRefreshing = false;
          processQueue(refreshError, null);
          console.error(
            "Error refreshing token:",
            refreshError.response?.data?.msg || refreshError.message
          );

          // Redirect to login if refresh fails (e.g., refresh token expired/invalid)
          // You might use React Router's navigate here instead of window.location.href
          // window.location.href = "/login";
          reject(refreshError);
        }
      });
    }

    // Handle other 401 errors (e.g., invalid token, not expired)
    if (error.response && error.response.status === 401) {
      console.error(
        "Authentication error (not token expiration):",
        error.response.data.msg || error.message
      );
      // Redirect to login for other 401s if desired
      // window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default apiInterceptor;
