import { Formik, Field, Form, ErrorMessage } from "formik";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import useCsrfToken from "../hooks/useCsrfToken";
import apiInterceptor from "../services/apiInterceptor";

function RegisterScreen() {
  const { csrfToken, loadingCsrf, errorCsrf, fetchCsrfToken } = useCsrfToken();
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.successMessage) {
      setMessage(location.state.successMessage);
      const timer = setTimeout(() => {
        setMessage("");
        window.history.replaceState({}, document.title);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  useEffect(() => {
    const handleLogout = () => {
      navigate("/login");
    };
    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, [navigate]);

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

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    if (
      !csrfToken ||
      typeof csrfToken !== "string" ||
      csrfToken.trim() === ""
    ) {
      setMessage("Error: CSRF Token missing or invalid. Please try again."); // Fixed: Use setMessage
      setSubmitting(false);
      return;
    }

    try {
      const response = await apiInterceptor.post("/auth/register", values, {
        headers: {
          "X-CSRF-Token": csrfToken,
        },
      });
      console.log("Registration successful:", response.data);
      resetForm();
      setMessage(""); // Clear any previous error messages
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
      setMessage(errorMsg); // Fixed: Use setMessage
    } finally {
      setSubmitting(false);
    }
  };

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

                    {message && (
                      <div
                        className={`alert ${
                          message.includes("Error")
                            ? "alert-danger"
                            : "alert-success"
                        } text-center`}
                        role="alert"
                      >
                        {message}
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
                          <div className="d-flex flex-row align-items-center mb-4 position-relative">
                            <i className="fas fa-lock fa-lg me-3 fa-fw"></i>
                            <div className="form-outline flex-fill mb-0">
                              <Field
                                type="password"
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
                            </div>
                          </div>
                          <div className="d-flex flex-row align-items-center mb-4 position-relative">
                            <i className="fas fa-key fa-lg me-3 fa-fw"></i>
                            <div className="form-outline flex-fill mb-0">
                              <Field
                                type="password"
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
