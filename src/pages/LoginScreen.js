import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import useCsrfToken from "../hooks/useCsrfToken";
import apiInterceptor from "../services/apiInterceptor";

function LoginScreen() {
  const { csrfToken, loadingCsrf, errorCsrf, fetchCsrfToken } = useCsrfToken();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Xử lý successMessage từ location.state
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      const timer = setTimeout(() => {
        setSuccessMessage("");
        window.history.replaceState({}, document.title);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Xử lý logout event từ apiInterceptor
  useEffect(() => {
    const handleLogout = () => {
      navigate("/login");
    };
    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, [navigate]);

  // Form validation với Yup
  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  // Handle login submission
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    if (
      !csrfToken ||
      typeof csrfToken !== "string" ||
      csrfToken.trim() === ""
    ) {
      setErrorMessage(
        "Error: CSRF Token missing or invalid. Please try again."
      );
      setSubmitting(false);
      return;
    }

    try {
      const response = await apiInterceptor.post("/auth/login", {
        email: values.email,
        password: values.password,
      });
      setSuccessMessage(response.data.msg);
      console.log("Login successful:", response.data);
      resetForm();
      setErrorMessage("");
      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (error) {
      console.error("Login error:", error);
      let errorMsg = "Login failed. Please try again.";
      if (error.response && error.response.data) {
        if (typeof error.response.data === "string") {
          errorMsg = error.response.data;
        } else {
          errorMsg =
            error.response.data.msg || error.response.data.message || errorMsg;
        }
      } else if (error.request) {
        errorMsg =
          "Could not connect to the server. Please check your internet connection.";
      }
      setErrorMessage(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Password visibility toggle
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Conditional rendering for loading/error states
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
          <button className="btn btn-primary mt-2" onClick={fetchCsrfToken}>
            Try Again
          </button>
        </div>
      </section>
    );
  }

  // Main login form
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
                      validationSchema={validationSchema}
                      onSubmit={handleSubmit}
                    >
                      {({ isSubmitting, touched, errors }) => (
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

                          {successMessage && (
                            <div
                              className="alert alert-success fade show"
                              role="alert"
                            >
                              {successMessage}
                            </div>
                          )}
                          {errorMessage && (
                            <div
                              className="alert alert-danger fade show"
                              role="alert"
                            >
                              {errorMessage}
                            </div>
                          )}

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
                              } position-absolute`}
                              style={{
                                cursor: "pointer",
                                top: "70%",
                                transform: "translateY(-50%)",
                                right:
                                  touched.password && errors.password
                                    ? "2.5rem"
                                    : "1rem",
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
