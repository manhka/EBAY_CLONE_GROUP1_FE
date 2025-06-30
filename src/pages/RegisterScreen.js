import { Formik, Field, Form, ErrorMessage } from "formik";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

function RegisterScreen() {
  const [csrfToken, setCsrfToken] = useState("");
  const [loadingCsrf, setLoadingCsrf] = useState(true);
  const [errorCsrf, setErrorCsrf] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  // --- CSRF Token Fetching ---
  const fetchCsrfToken = async () => {
    try {
      setLoadingCsrf(true);
      setErrorCsrf(null);
      const response = await axios.get(`${API_BASE_URL}/api/csrf-token`, {
        withCredentials: true,
      });
      setCsrfToken(response.data.csrfToken);
      setLoadingCsrf(false);
    } catch (error) {
      console.error("Error fetching CSRF Token:", error);
      setErrorCsrf("Failed to load the form. Please try again.");
      setLoadingCsrf(false);
    }
  };

  useEffect(() => {
    fetchCsrfToken();
  }, []);

  // --- Form Validation with Yup ---
  const validationSchema = Yup.object({
    username: Yup.string()
      .min(3, "Your username must be at least 3 characters")
      .max(50, "Your username must be less than 50 characters")
      .required("Your username is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Please confirm your password"),
  });

  // --- Form Submission Handler ---
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    if (
      !csrfToken ||
      typeof csrfToken !== "string" ||
      csrfToken.trim() === ""
    ) {
      setErrorMessage(
        "Error: CSRF Token missing or invalid. Please reload the page."
      );
      setSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/register`,
        values,
        {
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true,
        }
      );
      console.log("Registration successful:", response.data);
      resetForm();
      setErrorMessage(null);
      navigate("/verify-pin", { state: { email: values.email } });
    } catch (error) {
      console.error("Error submitting registration request:", error);
      let errorMsg = "Unknown error from server";
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
      } else {
        errorMsg = "An error occurred during registration. Please try again.";
      }
      setErrorMessage(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // --- Password Visibility Toggles ---
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  // --- Conditional Rendering for Loading/Error States ---
  if (loadingCsrf) {
    return (
      <section className="vh-100 d-flex justify-content-center align-items-center">
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
      <section className="vh-100 d-flex justify-content-center align-items-center">
        <div className="alert alert-danger text-center" role="alert">
          {errorCsrf}
          <button className="btn btn-primary mt-2" onClick={fetchCsrfToken}>
            Try Again
          </button>
        </div>
      </section>
    );
  }

  // --- Main Register Form ---
  return (
    <section className="vh-100" style={{ backgroundColor: "#eee" }}>
      <div className="container h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-lg-12 col-xl-10">
            <div className="card text-black" style={{ borderRadius: "25px" }}>
              <div className="card-body p-md-5">
                <div className="row justify-content-center">
                  <div className="col-md-10 col-lg-6 col-xl-5 order-2 order-lg-1">
                    <p className="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4">
                      <i className="fas fa-user-plus me-3"></i> Sign up
                    </p>

                    {errorMessage && (
                      <div
                        className="alert alert-danger text-center"
                        role="alert"
                      >
                        {errorMessage}
                      </div>
                    )}

                    <Formik
                      initialValues={{
                        username: "",
                        email: "",
                        password: "",
                        confirmPassword: "",
                      }}
                      validationSchema={validationSchema}
                      onSubmit={handleSubmit}
                    >
                      {({ touched, errors, isSubmitting }) => (
                        <Form className="mx-1 mx-md-4">
                          {/* Username */}
                          <div className="d-flex flex-row align-items-center mb-4">
                            <i className="fas fa-user fa-lg me-3 fa-fw"></i>
                            <div className="form-outline flex-fill mb-0">
                              <Field
                                type="text"
                                id="usernameField"
                                className={`form-control ${
                                  touched.username && errors.username
                                    ? "is-invalid"
                                    : ""
                                }`}
                                name="username"
                                placeholder="Enter Username"
                              />
                              <ErrorMessage
                                name="username"
                                component="div"
                                className="invalid-feedback"
                              />
                            </div>
                          </div>
                          {/* Email */}
                          <div className="d-flex flex-row align-items-center mb-4">
                            <i className="fas fa-envelope fa-lg me-3 fa-fw"></i>
                            <div className="form-outline flex-fill mb-0">
                              <Field
                                type="email"
                                id="emailField"
                                className={`form-control ${
                                  touched.email && errors.email
                                    ? "is-invalid"
                                    : ""
                                }`}
                                name="email"
                                placeholder="Your Email"
                              />
                              <ErrorMessage
                                name="email"
                                component="div"
                                className="invalid-feedback"
                              />
                            </div>
                          </div>
                          {/* Password */}
                          <div className="d-flex flex-row align-items-center mb-4 position-relative">
                            <i className="fas fa-lock fa-lg me-3 fa-fw"></i>
                            <div className="form-outline flex-fill mb-0">
                              <Field
                                type={showPassword ? "text" : "password"}
                                id="passwordField"
                                className={`form-control ${
                                  touched.password && errors.password
                                    ? "is-invalid"
                                    : ""
                                }`}
                                placeholder="Password"
                                name="password"
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
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  right:
                                    touched.password && errors.password
                                      ? "2.5rem"
                                      : "1rem",
                                }}
                              ></i>
                            </div>
                          </div>
                          {/* Repeat Password */}
                          <div className="d-flex flex-row align-items-center mb-4 position-relative">
                            <i className="fas fa-key fa-lg me-3 fa-fw"></i>
                            <div className="form-outline flex-fill mb-0">
                              <Field
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPasswordField"
                                className={`form-control ${
                                  touched.confirmPassword &&
                                  errors.confirmPassword
                                    ? "is-invalid"
                                    : ""
                                }`}
                                placeholder="Repeat your password"
                                name="confirmPassword"
                              />
                              <ErrorMessage
                                name="confirmPassword"
                                component="div"
                                className="invalid-feedback"
                              />
                              <i
                                onClick={toggleConfirmPasswordVisibility}
                                className={`fas ${
                                  showConfirmPassword
                                    ? "fa-eye"
                                    : "fa-eye-slash"
                                } position-absolute`}
                                style={{
                                  cursor: "pointer",
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  right:
                                    touched.confirmPassword &&
                                    errors.confirmPassword
                                      ? "2.5rem"
                                      : "1rem",
                                }}
                              ></i>
                            </div>
                          </div>

                          <div className="form-check d-flex justify-content-center mb-5">
                            <label
                              className="form-check-label"
                              htmlFor="form2Example3"
                            >
                              Already have an account?{" "}
                              <a href="/login">Sign in</a>
                            </label>
                          </div>

                          <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                            <button
                              type="submit"
                              className="btn btn-primary btn-lg"
                              disabled={isSubmitting || !csrfToken}
                            >
                              {isSubmitting ? (
                                <>
                                  <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                    aria-hidden="true"
                                  ></span>
                                  Registering...
                                </>
                              ) : (
                                "Register"
                              )}
                            </button>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </div>
                  <div className="col-md-10 col-lg-6 col-xl-7 d-flex align-items-center order-1 order-lg-2">
                    <img
                      src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-registration/draw1.webp"
                      className="img-fluid"
                      alt="Sample image"
                    />
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

export default RegisterScreen;
