import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage } from "formik";

function LoginScreen() {
  const [message, setMessage] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const [loadingCsrf, setLoadingCsrf] = useState(true);
  const [errorCsrf, setErrorCsrf] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // --- Axios Instance with CSRF Handling ---
  const apiClient = axios.create({
    baseURL: "http://localhost:3000/api", // Double-check your backend port!
    withCredentials: true,
  });

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
            "CSRF Token not available when sending request. Attempting to re-fetch..."
          );
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // --- Fetch CSRF Token on component mount ---
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await apiClient.get("/csrf-token");
        setCsrfToken(response.data.csrfToken);
        setLoadingCsrf(false);
      } catch (error) {
        console.error("Error fetching CSRF Token:", error);
        setErrorCsrf("Failed to load the form. Please try again later.");
        setLoadingCsrf(false);
      }
    };
    fetchCsrfToken();

    if (location.state && location.state.successMessage) {
      setMessage(location.state.successMessage);
      const timer = setTimeout(() => {
        setMessage("");
        window.history.replaceState({}, document.title);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // --- Form Validation (Formik's validate prop) ---
  const validate = (values) => {
    const errors = {};
    if (!values.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S/.test(values.email)) {
      errors.email = "Invalid email address";
    }

    if (!values.password) {
      errors.password = "Password is required";
    } else if (values.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    return errors;
  };

  // --- Handle Login Submission (Formik's onSubmit prop) ---
  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    setMessage("");
    setStatus(null);

    if (!csrfToken) {
      setStatus({
        error:
          "Security Error: CSRF token missing. Please try reloading the page.",
      });
      setSubmitting(false);
      return;
    }

    try {
      const response = await apiClient.post("/auth/login", {
        email: values.email,
        password: values.password,
      });

      setMessage(response.data.msg);
      console.log("Login successful:", response.data);

      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (error) {
      console.error("Login error:", error);
      const errorMsg =
        error.response?.data?.msg ||
        error.response?.data?.message ||
        "Login failed. Please try again.";
      setStatus({ error: errorMsg });
      setMessage(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // --- Password Visibility Toggle ---
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // --- Conditional Rendering for Loading/Error States (CSRF) ---
  if (loadingCsrf) {
    return (
      <section className="vh-100 d-flex justify-content-center align-items-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading form...</p>
        </div>
      </section>
    );
  }

  if (errorCsrf) {
    return (
      <section className="vh-100 d-flex justify-content-center align-items-center bg-light">
        <div className="alert alert-danger text-center" role="alert">
          {errorCsrf}
          <button
            className="btn btn-link mt-2"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      </section>
    );
  }

  // --- Main Login Form ---
  return (
    <section className="vh-100" style={{ backgroundColor: "#9A616D" }}>
      <div className="container py-5 h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col col-xl-10">
            <div className="card" style={{ borderRadius: "1rem" }}>
              <div className="row g-0">
                <div className="col-md-6 col-lg-5 d-none d-md-block">
                  <img
                    src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/img1.webp"
                    alt="login form"
                    className="img-fluid"
                    style={{ borderRadius: "1rem 0 0 1rem" }}
                  />
                </div>
                <div className="col-md-6 col-lg-7 d-flex align-items-center">
                  <div className="card-body p-4 p-lg-5 text-black">
                    <Formik
                      initialValues={{ email: "", password: "" }}
                      validate={validate}
                      onSubmit={handleSubmit}
                    >
                      {({ isSubmitting, touched, errors, status }) => (
                        <Form>
                          <div className="d-flex align-items-center mb-3 pb-1">
                            <i
                              className="fas fa-cubes fa-2x me-3"
                              style={{ color: "#ff6219" }}
                            ></i>
                            <span className="h1 fw-bold mb-0">Logo</span>
                          </div>

                          <h5
                            className="fw-normal mb-3 pb-3"
                            style={{ letterSpacing: "1px" }}
                          >
                            Sign into your account
                          </h5>

                          {message && (
                            <div
                              className={`alert ${
                                message.includes("login_successful")
                                  ? "alert-success"
                                  : "alert-danger"
                              } fade show`}
                              role="alert"
                            >
                              {message}
                            </div>
                          )}

                          {/* Email Field - No eye icon here, so no change needed */}
                          <div className="form-outline mb-4">
                            <label className="form-label" htmlFor="emailInput">
                              Email address
                            </label>
                            <Field
                              type="email"
                              id="emailInput"
                              name="email"
                              className={`form-control form-control-lg ${
                                touched.email && errors.email
                                  ? "is-invalid"
                                  : ""
                              }`}
                            />
                            <ErrorMessage
                              name="email"
                              component="div"
                              className="invalid-feedback"
                            />
                          </div>

                          {/* Password Field - Adjust eye icon position */}
                          <div className="form-outline mb-4 position-relative">
                            <label
                              className="form-label"
                              htmlFor="passwordInput"
                            >
                              Password
                            </label>
                            <Field
                              type={showPassword ? "text" : "password"}
                              id="passwordInput"
                              name="password"
                              className={`form-control form-control-lg ${
                                touched.password && errors.password
                                  ? "is-invalid"
                                  : ""
                              }`}
                            />
                            <ErrorMessage
                              name="password"
                              component="div"
                              className="invalid-feedback"
                            />
                            <i
                              onClick={togglePasswordVisibility}
                              className={`fas ${
                                showPassword ? "fa-eye" : "fa-eye-slash"
                              } position-absolute end-0 translate-middle-y ${
                                touched.password && errors.password
                                  ? "me-5"
                                  : "me-3"
                              }`}
                              style={{
                                cursor: "pointer",
                                top:
                                  touched.password && errors.password
                                    ? "55%"
                                    : "70%",
                              }}
                            ></i>
                          </div>

                          <div className="pt-1 mb-4">
                            <button
                              className="btn btn-dark btn-lg btn-block"
                              type="submit"
                              disabled={isSubmitting || !csrfToken}
                            >
                              {isSubmitting ? (
                                <>
                                  <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                    aria-hidden="true"
                                  ></span>
                                  Logging In...
                                </>
                              ) : (
                                "Login"
                              )}
                            </button>
                          </div>

                          <a className="small text-muted" href="#!">
                            Forgot password?
                          </a>
                          <p
                            className="mb-5 pb-lg-2"
                            style={{ color: "#393f81" }}
                          >
                            Don't have an account?{" "}
                            <Link to="/register" style={{ color: "#393f81" }}>
                              Register here
                            </Link>
                          </p>
                          <a className="small text-muted me-3" href="#!">
                            Terms of use.
                          </a>
                          <a className="small text-muted" href="#!">
                            Privacy policy
                          </a>
                        </Form>
                      )}
                    </Formik>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LoginScreen;
