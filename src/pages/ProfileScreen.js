import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import apiClient from "../services/apiInterceptor"; // Import your configured Axios instance
import useCsrfToken from "../hooks/useCsrfToken";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import "../assets/css/ProfileStyle.css"; // Make sure this path is correct

const ProfileScreen = () => {
  const location = useLocation();
  const BACKEND_BASE_URL = "http://localhost:3000";

  // ... other states for your component

  // Use the custom hook to handle CSRF token fetching
  const { csrfLoading, csrfError } = useCsrfToken();

  // --- States for the component's UI and data ---
  const [message, setMessage] = useState("");
  // ... other states for profile data, loading, error, success messages ...

  // Use the custom hook to handle CSRF token fetching

  useEffect(() => {
    // Handle success message from location.state (unrelated to CSRF but from your original code)
    if (location.state && location.state.successMessage) {
      setMessage(location.state.successMessage);
      const timer = setTimeout(() => {
        setMessage("");
        window.history.replaceState({}, document.title);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const [initialValues, setInitialValues] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    country: "",
    isDefault: false,
    profilePicture: "", // This will hold the URL or the File object
    username: "",
    firstName: "",
    lastName: "",
    organizationName: "",
    location: "",
    emailAddress: "",
    birthday: "", // Will be "yyyy-MM-dd" string for input
  });
  const [profileExists, setProfileExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Helper function to format ISO string to YYYY-MM-DD for date input
  const formatIsoToYYYYMMDD = (isoString) => {
    if (!isoString) return "";
    return isoString.substring(0, 10);
  };

  // Helper function to format YYYY-MM-DD to ISO string for backend submission
  const formatYYYYMMDDToISO = (yyyyMmDdString) => {
    if (!yyyyMmDdString) return null;
    // Creating a new Date object from "YYYY-MM-DD" will usually result in
    // midnight UTC of that date, which is what Mongoose expects for Date type.
    return new Date(yyyyMmDdString).toISOString();
  };

  const validationSchema = Yup.object().shape({
    // userId: Yup.string().required("User ID is required"), // userId should ideally come from auth context, not a form field for direct user input
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

    profilePicture: Yup.mixed()
      .nullable()
      .test(
        "fileFormat",
        "Unsupported Format (Only JPG, PNG, GIF allowed)",
        (value) => {
          if (!value || typeof value === "string") return true; // Allow null/empty or existing URL string
          return (
            value instanceof File &&
            ["image/jpeg", "image/png", "image/gif"].includes(value.type)
          );
        }
      )
      .test("fileSize", "File too large (Max 5 MB)", (value) => {
        if (!value || typeof value === "string") return true; // Allow null/empty or existing URL string
        return value instanceof File && value.size <= 5 * 1024 * 1024; // 5MB limit
      }),

    // New fields
    username: Yup.string()
      .max(50, "Username cannot exceed 50 characters.")
      .notRequired(),
    firstName: Yup.string()
      .max(50, "First name cannot exceed 50 characters.")
      .notRequired(),
    lastName: Yup.string()
      .max(50, "Last name cannot exceed 50 characters.")
      .notRequired(),
    organizationName: Yup.string()
      .max(100, "Organization name cannot exceed 100 characters.")
      .notRequired(),
    location: Yup.string()
      .max(100, "Location cannot exceed 100 characters.")
      .notRequired(),
    emailAddress: Yup.string().email("Invalid email address").notRequired(),
    birthday: Yup.string() // It's a string from the input (yyyy-MM-dd)
      .nullable() // Allows it to be empty initially
      .test("is-valid-date", "Invalid date format or date.", (value) => {
        if (!value) return true; // Allow empty birthday if not required
        return !isNaN(new Date(value).getTime()); // Check if it's a valid date string
      })
      .test(
        "age-validation",
        "You must be between 16 and 100 years old.",
        (value) => {
          if (!value) return true; // Allow empty birthday
          const birthDate = new Date(value);

          // Check if the date object itself is valid
          if (isNaN(birthDate.getTime())) {
            return false; // Invalid date string passed, so it's not a valid age
          }

          const today = new Date();
          today.setHours(0, 0, 0, 0); // Normalize today for comparison

          // For accurate age, set birthDate to the start of its day (local time)
          // This is crucial because new Date("YYYY-MM-DD") is often UTC midnight,
          // which can be the previous day in local timezones, affecting age by a day.
          birthDate.setHours(0, 0, 0, 0);

          let age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          return age >= 16 && age <= 100;
        }
      ),
  });

  const getImageUrl = (avatarValue) => {
    let imageUrl;
    if (avatarValue instanceof File) {
      imageUrl = URL.createObjectURL(avatarValue);
    } else if (typeof avatarValue === "string" && avatarValue) {
      imageUrl = avatarValue.startsWith("/")
        ? `${BACKEND_BASE_URL}${avatarValue}`
        : avatarValue;
    } else {
      imageUrl = "http://bootdey.com/img/Content/avatar/avatar1.png";
    }

    return imageUrl;
  };
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get(`/user-profile/`, {
          withCredentials: true,
        });

        const data = response.data.profile;
        console.log("Fetched profile data:", data); // Log the full data to inspect

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
          birthday: formatIsoToYYYYMMDD(data.birthday), // Format for the date input
        });
        if (data.fullName) {
          setProfileExists(true);
        } else {
          setProfileExists(false);
        }
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
              profilePicture:
                "http://bootdey.com/img/Content/avatar/avatar1.png",
              username: "",
              firstName: "",
              lastName: "",
              organizationName: "",
              location: "",
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
            setError(
              "Your session has expired or you do not have access. Please log in again."
            );
            // navigate('/login'); // Redirect to login page
          } else {
            console.error("Error fetching user profile:", err.response.data);
            setError(err.response.data.msg || "Failed to load profile data.");
          }
        } else {
          console.error("Network or unexpected error:", err);
          setError("Cannot connect to the server. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const onSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    console.log("Submitting form data", values);

    const formData = new FormData();

    // Append all form values
    for (const key in values) {
      // Exclude profilePicture if it's an existing URL, only append if it's a new File
      if (key === "profilePicture") {
        if (values[key] instanceof File) {
          formData.append(key, values[key]);
        }
      } else if (key === "birthday") {
        // Convert birthday from "yyyy-MM-dd" to ISO string for backend if it's not empty
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
      const url = `http://localhost:3000/api/user-profile/`;

      const response = await apiClient[profileExists ? "put" : "post"](
        url,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      // Handle success message
      setSuccess(
        profileExists
          ? "Profile updated successfully!"
          : "Profile created successfully!"
      );
      setProfileExists(true);

      console.log("Server response:", response.data);
      console.log(`${response.data.profile}`);
      if (response.data.profile) {
        const returnedProfile = response.data.profile;
        console.log(`${returnedProfile.fullName}`);

        // Construct the new, normalized initial values state based purely on backend response
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
          username: returnedProfile.user?.username || "",
          email: returnedProfile.user?.email || "",
          birthday: formatIsoToYYYYMMDD(returnedProfile.birthday),
        };

        if (values.avatar instanceof File && URL.revokeObjectURL) {
          URL.revokeObjectURL(values.avatar);
        }

        setInitialValues(newInitialValuesState);

        resetForm(newInitialValuesState);
      }
    } catch (err) {
      console.error(
        "Submission error:",
        err.response ? err.response.data : err.message
      );
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 400 && err.response.data.errors) {
          setError(
            "Validation failed: " +
              Object.values(err.response.data.errors)
                .map((e) => e.message || e)
                .join(", ")
          );
        } else if (err.response.status === 409) {
          setError(err.response.data.message);
        } else {
          setError(
            err.response.data.message || "An error occurred during submission."
          );
        }
      } else {
        setError("Network error or server unavailable.");
      }
    } finally {
      setSubmitting(false);
    }
  };

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
      <div className="row">
        {/* Wrap the entire content in a single Formik instance */}
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
                    {/* Profile picture image */}
                    <img
                      crossOrigin={
                        getImageUrl(values.avatar).includes(`bootdey`)
                          ? undefined
                          : "anonymous"
                      }
                      className="img-account-profile rounded-circle mb-2"
                      src={getImageUrl(values.avatar)}
                      alt="Profile"
                    />
                    {/* Profile picture help block */}
                    <div className="small font-italic text-muted mb-4">
                      JPG or PNG no larger than 5 MB
                    </div>
                    {/* Profile picture upload button and input */}
                    <input
                      type="file"
                      id="profilePictureUpload"
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
                      htmlFor="profilePictureUpload"
                      className="btn btn-primary"
                      style={{ cursor: "pointer" }}
                    >
                      Upload new image
                    </label>
                    <ErrorMessage
                      name="profilePicture"
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
                {/* Account details card */}
                <div className="card mb-4">
                  <div className="card-header">Account Details</div>
                  <div className="card-body">
                    {/* Form Group (username) */}
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
                        disabled // Username should generally not be editable via profile screen
                      />
                      <ErrorMessage
                        name="username"
                        component="div"
                        className="text-danger"
                      />
                    </div>
                    {/* Form Group (email address) */}
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
                        disabled // Email usually not editable here, or requires re-verification
                      />
                      <ErrorMessage
                        name="emailAddress"
                        component="div"
                        className="text-danger"
                      />
                    </div>

                    {/* Form Row (Full Name, Phone) */}
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

                    {/* Form Row (Birthday, isDefault) */}
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

                    {/* Address details */}
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

                    {/* Global Save Changes button */}
                    <button
                      className="btn btn-primary"
                      type="submit"
                      disabled={isSubmitting || !dirty || !isValid} // Consolidated logic
                    >
                      {isSubmitting ? "Saving..." : "Update"}
                    </button>
                    <div className="text-center mt-3">
                      {loading && <div className="text-info">Loading...</div>}
                      {error && <div className="text-danger mt-2">{error}</div>}
                      {success && (
                        <div className="text-success mt-2">{success}</div>
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
