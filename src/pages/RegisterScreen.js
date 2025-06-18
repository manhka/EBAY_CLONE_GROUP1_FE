import { Formik, Field, Form, ErrorMessage } from "formik";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Make sure you import useNavigate

// No need for CheckEmailModal anymore if we're redirecting
// import CheckEmailModal from "./CheckEmailModal";

function RegisterScreen() {
  const [csrfToken, setCsrfToken] = useState("");
  const [loadingCsrf, setLoadingCsrf] = useState(true);
  const [errorCsrf, setErrorCsrf] = useState(null);
  const navigate = useNavigate(); // Initialize navigate

  // --- CSRF Token Fetching ---
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/csrf-token", // Double-check your backend port!
          {
            withCredentials: true, // Essential for sending/receiving cookies
          }
        );
        setCsrfToken(response.data.csrfToken);
        setLoadingCsrf(false);
      } catch (error) {
        console.error("Error fetching CSRF Token:", error);
        setErrorCsrf("Failed to load the form. Please try again later.");
        setLoadingCsrf(false);
      }
    };
    fetchCsrfToken();
  }, []);

  // --- Form Validation ---
  const validate = (values) => {
    const errors = {};

    if (!values.name) {
      errors.name = "Your name is required";
    } else if (values.name.length < 3) {
      errors.name = "Your name must be at least 3 characters";
    } else if (values.name.length > 50) {
      errors.name = "Your name must be less than 50 characters";
    }

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

    if (!values.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (values.confirmPassword !== values.password) {
      errors.confirmPassword = "Passwords must match";
    }

    return errors;
  };

  // --- Form Submission Handler ---
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    console.log("Submitting form data:", values);

    if (!csrfToken) {
      alert("Error: CSRF Token missing. Please reload the page.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/register", // Double-check your backend port!
        values,
        {
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken, // Send CSRF Token in header
          },
          withCredentials: true, // Essential for sending session cookies
        }
      );
      console.log("Registration successful:", response.data);
      resetForm();

      // --- PRIMARY CHANGE HERE: Redirect directly ---
      navigate("/verify-pin", { state: { email: values.email } });
    } catch (error) {
      console.error("Error submitting registration request:", error);
      if (error.response) {
        console.error("Error data from server:", error.response.data);
        alert(
          `Registration failed: ${
            error.response.data.msg ||
            error.response.data.message ||
            "Unknown error from server"
          }`
        );
      } else if (error.request) {
        console.error("No response received from server:", error.request);
        alert(
          "Could not connect to the server. Please check your internet connection."
        );
      } else {
        console.error("Request setup error:", error.message);
        alert("An error occurred during registration. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // --- Password Visibility Toggles ---
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

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

                    <Formik
                      initialValues={{
                        name: "",
                        email: "",
                        password: "",
                        confirmPassword: "",
                      }}
                      validate={validate}
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
                                id="nameField"
                                className={`form-control ${
                                  touched.name && errors.name
                                    ? "is-invalid"
                                    : ""
                                }`}
                                name="name"
                                placeholder="Your Name"
                              />
                              <ErrorMessage
                                name="name"
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
                                } position-absolute end-0 translate-middle-y ${
                                  touched.password && errors.password
                                    ? "me-5"
                                    : "me-3"
                                }`}
                                style={{
                                  cursor: "pointer",
                                  top:
                                    touched.password && errors.password
                                      ? "30%"
                                      : "50%",
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
                                } position-absolute end-0 translate-middle-y ${
                                  touched.confirmPassword &&
                                  errors.confirmPassword
                                    ? "me-5"
                                    : "me-3"
                                }`}
                                style={{
                                  cursor: "pointer",
                                  top:
                                    touched.confirmPassword &&
                                    errors.confirmPassword
                                      ? "30%"
                                      : "50%",
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
