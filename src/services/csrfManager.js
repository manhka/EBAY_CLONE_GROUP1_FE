import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

let csrfToken = null;

export const setCsrfToken = (token) => {
  csrfToken = token;
};

export const getCsrfToken = () => csrfToken;

export const fetchCsrfToken = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/csrf-token`, {
      withCredentials: true,
    });
    csrfToken = response.data.csrfToken;
    setCsrfToken(csrfToken); // Đồng bộ
    console.log(`========>csrfToken: ${csrfToken}`);
    return csrfToken;
  } catch (error) {
    console.error("Error fetching CSRF Token:", error);
    throw error;
  }
};
