import { useState, useEffect } from "react";
import {
  fetchCsrfToken,
  setCsrfToken,
  getCsrfToken,
} from "../services/csrfManager";

const useCsrfToken = () => {
  const [csrfToken, setCsrfTokenState] = useState(getCsrfToken() || "");
  const [loadingCsrf, setLoadingCsrf] = useState(true);
  const [errorCsrf, setErrorCsrf] = useState(null);

  const fetchCsrf = async () => {
    try {
      setLoadingCsrf(true);
      setErrorCsrf(null);
      const token = await fetchCsrfToken();
      setCsrfTokenState(token);
      setCsrfToken(token); // Đồng bộ với csrfManager
      setLoadingCsrf(false);
      return token;
    } catch (error) {
      setErrorCsrf("Failed to load CSRF token. Please try again.");
      setLoadingCsrf(false);
      return null;
    }
  };

  useEffect(() => {
    fetchCsrf();
  }, []);

  return { csrfToken, loadingCsrf, errorCsrf, fetchCsrfToken: fetchCsrf };
};

export default useCsrfToken;
