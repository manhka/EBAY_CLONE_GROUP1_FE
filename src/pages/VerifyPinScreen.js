// src/components/Auth/VerifyPin.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

let csrfToken = null;

const fetchCsrfToken = async () => {
  try {
    const response = await apiClient.get("/csrf-token");
    csrfToken = response.data.csrfToken;
    console.log("CSRF Token fetched:", csrfToken);
    return csrfToken;
  } catch (error) {
    console.error("Error fetching CSRF token:", error);
    throw error;
  }
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
        console.warn("CSRF Token not available. Attempting to refetch...");
        fetchCsrfToken()
          .then((newToken) => {
            config.headers["X-CSRF-Token"] = newToken;
          })
          .catch((err) => {
            console.error("Failed to refetch CSRF token:", err);
          });
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const VerifyPinScreen = () => {
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    }
    fetchCsrfToken().catch((err) => {
      setMessage("Security Error: Could not fetch CSRF token.");
      console.error(err);
    });
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!email || !pin) {
      setMessage("Please enter both email and PIN.");
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.post("/auth/verify-pin", { email, pin });
      setMessage(response.data.msg);

      setTimeout(() => {
        navigate("/login", { state: { successMessage: response.data.msg } });
      }, 2000);
    } catch (error) {
      const errorMsg =
        error.response?.data?.msg || "An error occurred during verification.";
      setMessage(errorMsg);
      console.error("PIN verification error:", error);
      if (
        error.response?.data?.msg &&
        error.response.data.msg.includes("Mã PIN đã hết hạn")
      ) {
        setMessage(errorMsg + " Please register again to receive a new PIN.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <div
        className="card p-4 shadow-lg"
        style={{ maxWidth: "450px", width: "100%" }}
      >
        <h2 className="card-title text-center mb-4">
          <i className="fas fa-envelope-open-text me-2"></i> Verify Your Email
        </h2>
        <p className="card-subtitle text-center mb-4 text-muted">
          A PIN has been sent to your email. Please enter it to verify your
          account.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              <i className="fas fa-at me-2"></i> Email:
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              readOnly
              placeholder="Enter your email"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="pin" className="form-label">
              <i className="fas fa-key me-2"></i> PIN:
            </label>
            <input
              type="text"
              className="form-control"
              id="pin"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
              maxLength="6"
              placeholder="Enter the 6-digit PIN"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Verifying...
              </>
            ) : (
              <>
                <i className="fas fa-check-circle me-2"></i> Verify
              </>
            )}
          </button>

          {message && (
            <div
              className={`alert mt-3 ${
                message.includes("thành công") || message.includes("successful")
                  ? "alert-success"
                  : "alert-danger"
              }`}
              role="alert"
            >
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default VerifyPinScreen;
