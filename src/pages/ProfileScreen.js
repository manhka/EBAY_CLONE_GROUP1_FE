import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import useCsrfToken from "../hooks/useCsrfToken";
import apiInterceptor from "../services/apiInterceptor";
import "../assets/css/ProfileStyle.css";

const ProfileScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { csrfToken, loadingCsrf, errorCsrf, fetchCsrfToken } = useCsrfToken();

  // States for UI and data
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [initialValues, setInitialValues] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    country: "",
    isDefault: false,
    avatar: "",
    username: "",
    emailAddress: "",
    birthday: "",
  });
  const [profileExists, setProfileExists] = useState(false);
  const [loading, setLoading] = useState(true);

  // Helper functions for date formatting
  const formatIsoToYYYYMMDD = (isoString) => {
    if (!isoString) return "";
    return isoString.substring(0, 10);
  };

  const formatYYYYMMDDToISO = (yyyyMmDdString) => {
    if (!yyyyMmDdString) return null;
    return new Date(yyyyMmDdString).toISOString();
  };

  // Handle successMessage from location.state
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

  // Handle logout event from apiInterceptor
  useEffect(() => {
    const handleLogout = () => {
      navigate("/login");
    };
    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, [navigate]);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);

        const response = await apiInterceptor.get("/users/user-profile/", {
          withCredentials: true,
        });

        const data = response.data.profile;
        console.log("Fetched profile data:", data);

        setInitialValues({
          fullName: data.fullName || "",
          phone: data.phone || "",
          street: data.street || "",
          city: data.city || "",
          state: data.state || "",
          country: data.country || "",
          isDefault: data.isDefault || false,
          avatar:
            data.avatar || "http://bootdey.com/img/Content/avatar/avatar1.png",
          username: data.username || "",
          emailAddress: data.email || "",
          birthday: formatIsoToYYYYMMDD(data.birthday),
        });
        setProfileExists(!!data.fullName);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          if (err.response.status === 404) {
            console.log(
              "No profile found for this user, preparing for creation."
            );
            setProfileExists(false);
            setInitialValues({
              fullName: "",
              phone: "",
              street: "",
              city: "",
              state: "",
              country: "",
              isDefault: false,
              avatar: "http://bootdey.com/img/Content/avatar/avatar1.png",
              username: "",
              emailAddress: "",
              birthday: "",
            });
          } else if (
            err.response.status === 401 ||
            err.response.status === 403
          ) {
            console.error(
              "Authentication error:",
              err.response.data.msg || "Unauthorized."
            );
            setErrorMessage(
              "Your session has expired or you do not have access. Please log in again."
            );
            navigate("/login");
          } else {
            console.error("Error fetching user profile:", err.response.data);
            setErrorMessage(
              err.response.data.msg || "Failed to load profile data."
            );
          }
        } else {
          console.error("Network or unexpected error:", err);
          setErrorMessage(
            "Cannot connect to the server. Please try again later."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // Validation schema
  const validationSchema = Yup.object().shape({
    fullName: Yup.string()
      .required("Full Name is required")
      .min(2, "Full Name must be at least 2 characters")
      .max(100, "Full Name cannot exceed 100 characters")
      .matches(
        /^[a-zA-Z\u00C0-\u1EF9\s\-\.]+$/,
        "Full name can only contain letters, spaces, hyphens, and periods."
      ),
    phone: Yup.string()
      .required("Phone number is required")
      .matches(
        /^\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/,
        "Please enter a valid phone number."
      ),
    street: Yup.string()
      .required("Street is required")
      .min(3, "Street address must be at least 3 characters long.")
      .max(200, "Street address cannot exceed 200 characters.")
      .matches(
        /^[a-zA-Z0-9\u00C0-\u1EF9\s\-\.,\/]+$/,
        "Street address can only contain letters, numbers, spaces, hyphens, commas, periods, and slashes."
      ),
    city: Yup.string()
      .required("City is required")
      .min(2, "City name must be at least 2 characters long.")
      .max(100, "City cannot exceed 100 characters.")
      .matches(
        /^[a-zA-Z\u00C0-\u1EF9\s\-\.]+$/,
        "City can only contain letters, spaces, hyphens, and periods."
      ),
    state: Yup.string()
      .required("State/Province is required")
      .min(2, "State/Province name must be at least 2 characters long.")
      .max(100, "State/Province cannot exceed 100 characters.")
      .matches(
        /^[a-zA-Z\u00C0-\u1EF9\s\-\.]+$/,
        "State/Province can only contain letters, spaces, hyphens, and periods."
      ),
    country: Yup.string()
      .required("Country is required")
      .min(2, "Country name must be at least 2 characters long.")
      .max(50, "Country name cannot exceed 50 characters.")
      .matches(/^[a-zA-Z\s]+$/, "Country can only contain letters and spaces."),
    isDefault: Yup.boolean().required("Default status is required"),
    avatar: Yup.mixed()
      .nullable()
      .test(
        "fileFormat",
        "Unsupported Format (Only JPG, PNG, GIF allowed)",
        (value) => {
          if (!value || typeof value === "string") return true;
          return (
            value instanceof File &&
            ["image/jpeg", "image/png", "image/gif"].includes(value.type)
          );
        }
      )
      .test("fileSize", "File too large (Max 5 MB)", (value) => {
        if (!value || typeof value === "string") return true;
        return value instanceof File && value.size <= 5 * 1024 * 1024;
      }),
    username: Yup.string()
      .max(50, "Username cannot exceed 50 characters.")
      .notRequired(),
    emailAddress: Yup.string().email("Invalid email address").notRequired(),
    birthday: Yup.string()
      .nullable()
      .test("is-valid-date", "Invalid date format or date.", (value) => {
        if (!value) return true;
        return !isNaN(new Date(value).getTime());
      })
      .test(
        "age-validation",
        "You must be between 16 and 100 years old.",
        (value) => {
          if (!value) return true;
          const birthDate = new Date(value);
          if (isNaN(birthDate.getTime())) return false;
          birthDate.setHours(0, 0, 0, 0);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          let age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          return age >= 16 && age <= 100;
        }
      ),
  });

  // Helper function to get image URL
  const getImageUrl = (avatarValue) => {
    const BACKEND_BASE_URL =
      process.env.REACT_APP_API_URL || "http://localhost:3000";
    if (avatarValue instanceof File) {
      return URL.createObjectURL(avatarValue);
    } else if (typeof avatarValue === "string" && avatarValue) {
      return avatarValue.startsWith("/")
        ? `${BACKEND_BASE_URL}${avatarValue}`
        : avatarValue;
    }
    return "http://bootdey.com/img/Content/avatar/avatar1.png";
  };

  // Form submission handler
  const onSubmit = async (values, { setSubmitting, resetForm }) => {
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

    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");
    console.log("Submitting form data", values);

    const formData = new FormData();
    for (const key in values) {
      if (key === "avatar") {
        if (values[key] instanceof File) {
          formData.append(key, values[key]);
        }
      } else if (key === "birthday") {
        if (values.birthday) {
          formData.append(key, formatYYYYMMDDToISO(values.birthday));
        }
      } else if (typeof values[key] === "boolean") {
        formData.append(key, values[key] ? "true" : "false");
      } else {
        formData.append(key, values[key]);
      }
    }

    try {
      const url = "/user-profile/";
      const response = await apiInterceptor[profileExists ? "put" : "post"](
        url,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      setSuccessMessage(
        profileExists
          ? "Profile updated successfully!"
          : "Profile created successfully!"
      );
      setProfileExists(true);

      console.log("Server response:", response.data);
      if (response.data.profile) {
        const returnedProfile = response.data.profile;
        const newInitialValuesState = {
          fullName: returnedProfile.fullName || "",
          phone: returnedProfile.phone || "",
          street: returnedProfile.street || "",
          city: returnedProfile.city || "",
          state: returnedProfile.state || "",
          country: returnedProfile.country || "",
          isDefault:
            typeof returnedProfile.isDefault === "boolean"
              ? returnedProfile.isDefault
              : returnedProfile.isDefault === "true" ||
                returnedProfile.isDefault === 1,
          avatar:
            returnedProfile.avatar ||
            "http://bootdey.com/img/Content/avatar/avatar1.png",
          birthday: formatIsoToYYYYMMDD(returnedProfile.birthday),
        };

        if (values.avatar instanceof File && URL.revokeObjectURL) {
          URL.revokeObjectURL(values.avatar);
        }

        setInitialValues(newInitialValuesState);
        resetForm({ values: newInitialValuesState });
      }
    } catch (err) {
      console.error(
        "Submission error:",
        err.response ? err.response.data : err.message
      );
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 400 && err.response.data.errors) {
          setErrorMessage(
            "Validation failed: " +
              Object.values(err.response.data.errors)
                .map((e) => e.message || e)
                .join(", ")
          );
        } else if (err.response.status === 401 || err.response.status === 403) {
          setErrorMessage(
            "Your session has expired or you do not have access. Please log in again."
          );
          navigate("/login");
        } else if (err.response.status === 409) {
          setErrorMessage(err.response.data.message);
        } else {
          setErrorMessage(
            err.response.data.message || "An error occurred during submission."
          );
        }
      } else {
        setErrorMessage("Network error or server unavailable.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Conditional rendering for CSRF loading/error
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

  if (loading) {
    return (
      <div className="container-xl px-4 mt-4 text-center">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 mt-4">
      <hr className="mt-0 mb-4" />
      
      {/* Navigation Buttons */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">
              <i className="fas fa-user me-2"></i>
              User Profile
            </h2>
            <div className="d-flex gap-2">
              <Link to="/order-history" className="btn btn-secondary">
                <i className="fas fa-shopping-bag me-2"></i>
                Order History
              </Link>
              <Link to="/" className="btn btn-outline-primary">
                <i className="fas fa-home me-2"></i>
                Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
          enableReinitialize={true}
        >
          {({ values, setFieldValue, isSubmitting, isValid, dirty }) => (
            <Form>
              <div className="">
                {/* Profile picture card */}
                <div className="card mb-4 mb-xl-0">
                  <div className="card-header">Profile Picture</div>
                  <div className="card-body text-center">
                    <img
                      crossOrigin={
                        getImageUrl(values.avatar).includes("bootdey")
                          ? undefined
                          : "anonymous"
                      }
                      className="img-account-profile rounded-circle mb-2"
                      src={getImageUrl(values.avatar)}
                      alt="Profile"
                    />
                    <div className="small font-italic text-muted mb-4">
                      JPG or PNG no larger than 5 MB
                    </div>
                    <input
                      type="file"
                      id="avatarUpload"
                      name="avatar"
                      style={{ display: "none" }}
                      onChange={(event) => {
                        if (values.avatar instanceof File) {
                          URL.revokeObjectURL(values.avatar);
                        }
                        setFieldValue("avatar", event.currentTarget.files[0]);
                      }}
                    />
                    <label
                      htmlFor="avatarUpload"
                      className="btn btn-primary"
                      style={{ cursor: "pointer" }}
                    >
                      Upload new image
                    </label>
                    <ErrorMessage
                      name="avatar"
                      component="div"
                      className="text-danger mt-2"
                    />
                    {values.avatar instanceof File && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary mt-2 ms-2"
                        onClick={() => {
                          URL.revokeObjectURL(values.avatar);
                          setFieldValue("avatar", "");
                        }}
                      >
                        Remove Selected Image
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="">
                <div className="card mb-4">
                  <div className="card-header">Account Details</div>
                  <div className="card-body">
                    <div className="mb-3">
                      <label className="small mb-1" htmlFor="username">
                        Username
                      </label>
                      <Field
                        className="form-control"
                        id="username"
                        type="text"
                        name="username"
                        placeholder="Enter your username"
                        disabled
                      />
                      <ErrorMessage
                        name="username"
                        component="div"
                        className="text-danger"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="small mb-1" htmlFor="emailAddress">
                        Email address
                      </label>
                      <Field
                        className="form-control"
                        id="emailAddress"
                        type="email"
                        name="emailAddress"
                        placeholder="Enter your email address"
                        disabled
                      />
                      <ErrorMessage
                        name="emailAddress"
                        component="div"
                        className="text-danger"
                      />
                    </div>
                    <div className="row gx-3 mb-3">
                      <div className="col-md-6">
                        <label className="small mb-1" htmlFor="fullName">
                          Full Name
                        </label>
                        <Field
                          className="form-control"
                          id="fullName"
                          type="text"
                          name="fullName"
                          placeholder="Enter your full name"
                        />
                        <ErrorMessage
                          name="fullName"
                          component="div"
                          className="text-danger"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="small mb-1" htmlFor="phone">
                          Phone number
                        </label>
                        <Field
                          className="form-control"
                          id="phone"
                          type="tel"
                          name="phone"
                          placeholder="Enter your phone number"
                        />
                        <ErrorMessage
                          name="phone"
                          component="div"
                          className="text-danger"
                        />
                      </div>
                    </div>
                    <div className="row gx-3 mb-3">
                      <div className="col-md-6">
                        <label className="small mb-1" htmlFor="birthday">
                          Birthday
                        </label>
                        <Field
                          className="form-control"
                          id="birthday"
                          type="date"
                          name="birthday"
                          placeholder="Enter your birthday"
                        />
                        <ErrorMessage
                          name="birthday"
                          component="div"
                          className="text-danger"
                        />
                      </div>
                      <div className="col-md-6">
                        <div className="form-check mt-4">
                          <Field
                            type="checkbox"
                            name="isDefault"
                            id="isDefault"
                            className="form-check-input"
                          />
                          <label
                            className="form-check-label small mb-1"
                            htmlFor="isDefault"
                          >
                            Set as Default Address
                          </label>
                        </div>
                        <ErrorMessage
                          name="isDefault"
                          component="div"
                          className="text-danger"
                        />
                      </div>
                    </div>
                    <div className="row gx-3 mb-3">
                      <div className="col-md-6">
                        <label className="small mb-1" htmlFor="street">
                          Street
                        </label>
                        <Field
                          className="form-control"
                          id="street"
                          type="text"
                          name="street"
                          placeholder="Enter Street"
                        />
                        <ErrorMessage
                          name="street"
                          component="div"
                          className="text-danger"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="small mb-1" htmlFor="city">
                          City
                        </label>
                        <Field
                          className="form-control"
                          id="city"
                          type="text"
                          name="city"
                          placeholder="Enter City"
                        />
                        <ErrorMessage
                          name="city"
                          component="div"
                          className="text-danger"
                        />
                      </div>
                    </div>
                    <div className="row gx-3 mb-3">
                      <div className="col-md-6">
                        <label className="small mb-1" htmlFor="state">
                          State/Province
                        </label>
                        <Field
                          className="form-control"
                          id="state"
                          type="text"
                          name="state"
                          placeholder="Enter State/Province"
                        />
                        <ErrorMessage
                          name="state"
                          component="div"
                          className="text-danger"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="small mb-1" htmlFor="country">
                          Country
                        </label>
                        <Field
                          className="form-control"
                          id="country"
                          type="text"
                          name="country"
                          placeholder="Enter Country"
                        />
                        <ErrorMessage
                          name="country"
                          component="div"
                          className="text-danger"
                        />
                      </div>
                    </div>
                    <button
                      className="btn btn-primary"
                      type="submit"
                      disabled={isSubmitting || !dirty || !isValid}
                    >
                      {isSubmitting ? "Saving..." : "Update"}
                    </button>
                    <div className="text-center mt-3">
                      {loading && <div className="text-info">Loading...</div>}
                      {errorMessage && (
                        <div className="text-danger mt-2">{errorMessage}</div>
                      )}
                      {successMessage && (
                        <div className="text-success mt-2">
                          {successMessage}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ProfileScreen;
