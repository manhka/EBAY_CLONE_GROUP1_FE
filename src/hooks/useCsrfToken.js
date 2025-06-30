import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

const useCsrfToken = () => {
  const [csrfToken, setCsrfToken] = useState("");
  const [loadingCsrf, setLoadingCsrf] = useState(true);
  const [errorCsrf, setErrorCsrf] = useState(null);

  const fetchCsrfToken = async () => {
    try {
      setLoadingCsrf(true);
      setErrorCsrf(null);
      const response = await axios.get(`${API_BASE_URL}/api/csrf-token`, {
        withCredentials: true,
      });
      setCsrfToken(response.data.csrfToken);
      setLoadingCsrf(false);
      return response.data.csrfToken;
    } catch (error) {
      console.error("Error fetching CSRF Token:", error);
      setErrorCsrf("Failed to load CSRF token. Please try again.");
      setLoadingCsrf(false);
      return null;
    }
  };

  useEffect(() => {
    fetchCsrfToken();
  }, []);

  return { csrfToken, loadingCsrf, errorCsrf, fetchCsrfToken };
};

export default useCsrfToken;
