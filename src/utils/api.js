// src/utils/api.js
import axios from "axios";

// --- Axios Instance with CSRF Handling ---
const apiClient = axios.create({
  baseURL: "http://localhost:3000/api", // Make sure this matches your backend API base URL
  withCredentials: true, // Important for sending/receiving cookies (like session cookies)
});

// Variable to store the CSRF token.
// This should ideally be managed by a state management solution (Context API, Redux, Zustand)
// or a simple global variable like this if your app structure allows.
let csrfToken = null;

// Function to set the CSRF token from outside (e.g., after fetching it)
export const setCsrfToken = (token) => {
  csrfToken = token;
};

// Request Interceptor: Add CSRF token to non-GET requests
apiClient.interceptors.request.use(
  (config) => {
    // Only add CSRF token for methods that modify data
    if (
      config.method !== "get" &&
      config.method !== "head" &&
      config.method !== "options"
    ) {
      if (csrfToken) {
        config.headers["X-CSRF-Token"] = csrfToken;
      } else {
        // You might want to throw an error here or redirect to a login page
        // if a token is absolutely required for mutation requests.
        console.warn(
          "CSRF Token not available when sending request. This request might fail if CSRF protection is active."
        );
        // Optionally, you could try to re-fetch the token here, but it's often better
        // to handle missing token as an error that the component can catch.
      }
    }
    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  }
);

// You can add a response interceptor here for global error handling (e.g., 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Example: If 401 Unauthorized, redirect to login
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized: Redirecting to login...");
      // window.location.href = '/login'; // Or use React Router's navigate
    }
    return Promise.reject(error);
  }
);

export default apiClient; // Export the configured Axios instance
