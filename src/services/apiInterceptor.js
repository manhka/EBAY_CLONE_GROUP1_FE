import axios from "axios";

const apiInterceptor = axios.create({
  baseURL: "http://localhost:3000/api", // Set the base URL for your backend API
  withCredentials: true, // Crucial for sending and receiving cookies (including httpOnly)
});

// Variables to manage token refreshing and request queue
let isRefreshing = false;
let failedQueue = [];

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

// --- Interceptor Configuration Starts Here ---
apiInterceptor.interceptors.response.use(
  (response) => {
    return response;
  }, // If the response is successful, return it immediately
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is 401, if it's an expired AccessToken, and if it hasn't been retried yet
    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data.msg === "AccessTokenExpired" && // Specific error code from the backend
      !originalRequest._retry // Ensure it's retried only once
    ) {
      originalRequest._retry = true; // Mark the request as retried

      // If a refresh process is already ongoing, add the request to the queue
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            // No token needed here if using httpOnly cookie
            return apiInterceptor(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true; // Set the refreshing flag

      return new Promise(async (resolve, reject) => {
        try {
          // Call the token refresh API
          const refreshResponse = await axios.post(
            "http://localhost:3000/api/auth/refresh-token", // Backend's refresh token endpoint
            {}, // Empty body
            { withCredentials: true } // Important: Send refreshToken cookie
          );

          // If refresh is successful
          isRefreshing = false;
          processQueue(null); // Resolve all queued requests

          // Retry the original request. The browser will automatically attach the new accessToken.
          resolve(apiInterceptor(originalRequest));
        } catch (refreshError) {
          isRefreshing = false;
          processQueue(refreshError, null); // Reject all queued requests with the error
          console.error(
            "Error refreshing token:",
            refreshError.response?.data?.msg || refreshError.message
          );

          window.location.href = "/login";
          reject(refreshError); // Reject the promise of the original request
        }
      });
    }

    if (error.response && error.response.status === 401) {
      console.error(
        "Authentication error (not expiration):",
        error.response.data.msg
      );
      // window.location.href = '/login';
    }

    return Promise.reject(error); // Return the original error
  }
);

export default apiInterceptor;
