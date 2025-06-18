import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import apiInterceptor from "../services/apiInterceptor";
// Import the new CSS file
import "../assets/css/ProfileStyle.css"; // Make sure this path is correct

const ProfileScreen = () => {
  const [currentUserId, setCurrentUserId] = useState(
    "6850b91154af32baff5311e2"
  ); // REPLACE WITH YOUR ACTUAL USER ID
  const [initialValues, setInitialValues] = useState({
    userId: currentUserId,
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    country: "",
    isDefault: false,
  });
  const [profileExists, setProfileExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const validationSchema = Yup.object().shape({
    userId: Yup.string().required("User ID is required"),
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
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      // Ensure currentUserId is available before making the API call
      if (!currentUserId) {
        setLoading(false);
        setError("User ID is not available.");
        return;
      }

      try {
        setLoading(true);
        setError(null); // Clear any previous errors

        const response = await apiInterceptor.get(
          `http://localhost:3000/api/user-profile/${currentUserId}`,
          {
            withCredentials: true, // Crucial for sending httpOnly cookies
          }
        );

        // Assuming your backend sends the profile data inside a 'profile' key
        const data = response.data.profile;

        setInitialValues({
          userId: data.userId,
          fullName: data.fullName,
          phone: data.phone,
          street: data.street,
          city: data.city,
          state: data.state,
          country: data.country,
          isDefault: data.isDefault,
        });
        setProfileExists(true); // Profile was found
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          // It's an Axios error with a response from the server
          if (err.response.status === 404) {
            console.log(
              "No profile found for this user, preparing for creation."
            );
            setProfileExists(false); // No profile found, prepare for creation
            // You might want to set initialValues to empty/default here if creating new
            setInitialValues({
              userId: currentUserId, // Pre-fill userId for new profile
              fullName: "",
              phone: "",
              street: "",
              city: "",
              state: "",
              country: "",
              isDefault: false,
            });
          } else if (
            err.response.status === 401 ||
            err.response.status === 403
          ) {
            // Unauthorized or Forbidden: Session expired or no access
            console.error(
              "Authentication error:",
              err.response.data.msg || "Unauthorized."
            );
            setError(
              "Your session has expired or you do not have access. Please log in again."
            );
            // navigate('/login'); // Redirect to login page
          } else {
            // Other server-side errors
            console.error("Error fetching user profile:", err.response.data);
            setError(err.response.data.msg || "Failed to load profile data.");
          }
        } else {
          // Network error or other unexpected errors
          console.error("Network or unexpected error:", err);
          setError("Cannot connect to the server. Please try again later.");
        }
      } finally {
        setLoading(false); // Always stop loading, regardless of success or error
      }
    };

    fetchUserProfile();
  }, [currentUserId]);

  const onSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    console.log("Submitting form data", values);
    try {
      let response;
      if (profileExists) {
        response = await apiInterceptor.put(
          `http://localhost:3000/api/user-profile/${currentUserId}`,
          values
        );
        setSuccess("Profile updated successfully!");
      } else {
        response = await apiInterceptor.post(
          `http://localhost:3000/api/user-profile`,
          values
        );
        setSuccess("Profile created successfully!");
        setProfileExists(true);
        setInitialValues(response.data.profile);
      }
      console.log("Server response:", response.data);
    } catch (err) {
      console.error(
        "Submission error:",
        err.response ? err.response.data : err.message
      );
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 400 && err.response.data.errors) {
          setError(
            "Validation failed: " +
              Object.values(err.response.data.errors).join(", ")
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
    return <div className="container text-center mt-5">Loading profile...</div>;
  }

  return (
    <div className="container profile-container">
      {" "}
      {/* Applied profile-container class */}
      <div className="row gutters">
        <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12 col-12">
          <div className="card h-100 profile-card">
            {" "}
            {/* Applied profile-card class */}
            <div className="card-body profile-card-body">
              {" "}
              {/* Applied profile-card-body class */}
              <div
                className="account-settings"
                style={{
                  paddingBottom: "10px",
                  borderBottom: "1px solid #efefef",
                }}
              >
                {" "}
                {/* Re-apply original padding/border if needed from external CSS */}
                <div className="user-profile">
                  {" "}
                  {/* This already has a class in base CSS, but added if not */}
                  <div className="user-avatar">
                    <img
                      src="https://bootdey.com/img/Content/avatar/avatar7.png"
                      alt="Maxwell Admin"
                    />
                    <input type="file" className="change-photo-input" />
                  </div>
                  <h5 className="user-name">
                    {initialValues.fullName || "Guest User"}
                  </h5>
                  {/* <h6 className="user-email">yuki@Maxwell.com</h6> */}
                </div>
                <div className="about">
                  <h5>About</h5>
                  <p>
                    I'm Yuki. Full Stack Designer I enjoy creating user-centric,
                    delightful and human experiences.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-9 col-lg-9 col-md-12 col-sm-12 col-12">
          <div className="card h-100 profile-card">
            {" "}
            {/* Applied profile-card class */}
            <div className="card-body profile-card-body">
              {" "}
              {/* Applied profile-card-body class */}
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
                enableReinitialize={true}
              >
                {({ isSubmitting, isValid, dirty }) => {
                  return (
                    <Form>
                      <div className="row gutters">
                        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                          <h6 className="mb-2 text-primary text-primary-custom">
                            Personal Details
                          </h6>{" "}
                          {/* Applied custom text-primary class */}
                        </div>
                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
                          <div className="form-group form-group-custom">
                            {" "}
                            {/* Applied custom form-group class */}
                            <label
                              htmlFor="fullName"
                              className="form-label-custom"
                            >
                              Full Name
                            </label>{" "}
                            {/* Applied custom form-label class */}
                            <Field
                              type="text"
                              name="fullName"
                              id="fullName"
                              className="form-control form-control-custom" // Applied custom form-control class
                              placeholder="Enter full name"
                            />
                            <ErrorMessage
                              name="fullName"
                              component="div"
                              className="text-danger text-danger-custom" // Applied custom text-danger class
                            />
                          </div>
                        </div>
                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
                          <div className="form-group form-group-custom">
                            {" "}
                            {/* Applied custom form-group class */}
                            <label
                              htmlFor="phone"
                              className="form-label-custom"
                            >
                              Phone
                            </label>{" "}
                            {/* Applied custom form-label class */}
                            <Field
                              type="text"
                              name="phone"
                              id="phone"
                              className="form-control form-control-custom" // Applied custom form-control class
                              placeholder="Enter phone number"
                            />
                            <ErrorMessage
                              name="phone"
                              component="div"
                              className="text-danger text-danger-custom" // Applied custom text-danger class
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row gutters">
                        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                          <h6 className="mt-3 mb-2 text-primary text-primary-custom">
                            Address
                          </h6>{" "}
                          {/* Applied custom text-primary class */}
                        </div>
                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
                          <div className="form-group form-group-custom">
                            {" "}
                            {/* Applied custom form-group class */}
                            <label
                              htmlFor="street"
                              className="form-label-custom"
                            >
                              Street
                            </label>{" "}
                            {/* Applied custom form-label class */}
                            <Field
                              type="text"
                              name="street"
                              id="street"
                              className="form-control form-control-custom" // Applied custom form-control class
                              placeholder="Enter Street"
                            />
                            <ErrorMessage
                              name="street"
                              component="div"
                              className="text-danger text-danger-custom" // Applied custom text-danger class
                            />
                          </div>
                        </div>
                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
                          <div className="form-group form-group-custom">
                            {" "}
                            {/* Applied custom form-group class */}
                            <label htmlFor="city" className="form-label-custom">
                              City
                            </label>{" "}
                            {/* Applied custom form-label class */}
                            <Field
                              type="text"
                              name="city"
                              id="city"
                              className="form-control form-control-custom" // Applied custom form-control class
                              placeholder="Enter City"
                            />
                            <ErrorMessage
                              name="city"
                              component="div"
                              className="text-danger text-danger-custom" // Applied custom text-danger class
                            />
                          </div>
                        </div>
                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
                          <div className="form-group form-group-custom">
                            {" "}
                            {/* Applied custom form-group class */}
                            <label
                              htmlFor="state"
                              className="form-label-custom"
                            >
                              State/Province
                            </label>{" "}
                            {/* Applied custom form-label class */}
                            <Field
                              type="text"
                              name="state"
                              id="state"
                              className="form-control form-control-custom" // Applied custom form-control class
                              placeholder="Enter State/Province"
                            />
                            <ErrorMessage
                              name="state"
                              component="div"
                              className="text-danger text-danger-custom" // Applied custom text-danger class
                            />
                          </div>
                        </div>
                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
                          <div className="form-group form-group-custom">
                            {" "}
                            {/* Applied custom form-group class */}
                            <label
                              htmlFor="country"
                              className="form-label-custom"
                            >
                              Country
                            </label>{" "}
                            {/* Applied custom form-label class */}
                            <Field
                              type="text"
                              name="country"
                              id="country"
                              className="form-control form-control-custom" // Applied custom form-control class
                              placeholder="Enter Country"
                            />
                            <ErrorMessage
                              name="country"
                              component="div"
                              className="text-danger text-danger-custom" // Applied custom text-danger class
                            />
                          </div>
                        </div>
                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
                          <div className="form-group form-group-custom">
                            {" "}
                            {/* Applied custom form-group class */}
                            <div className="form-check form-check-custom">
                              {" "}
                              {/* Applied custom form-check class */}
                              <Field
                                type="checkbox"
                                name="isDefault"
                                id="isDefault"
                                className="form-check-input form-check-input-custom" // Applied custom form-check-input class
                              />
                              <label
                                className="form-check-label form-label-custom"
                                htmlFor="isDefault"
                              >
                                {" "}
                                {/* Applied custom form-label class */}
                                Set as Default Address
                              </label>
                            </div>
                            <ErrorMessage
                              name="isDefault"
                              component="div"
                              className="text-danger text-danger-custom" // Applied custom text-danger class
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row gutters">
                        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                          <div className="text-right button-container">
                            {" "}
                            {/* Applied button-container class */}
                            {/* Messages */}
                            {loading && (
                              <div className="text-info text-info-custom">
                                Loading...
                              </div>
                            )}
                            {error && (
                              <div className="text-danger mt-2 text-danger-custom">
                                {error}
                              </div>
                            )}
                            {success && (
                              <div className="text-success mt-2 text-success-custom">
                                {success}
                              </div>
                            )}
                            <button
                              type="button"
                              className="btn btn-secondary mr-2 btn-custom btn-secondary-custom" // Applied custom button classes
                              onClick={() =>
                                console.log("Cancel button clicked.")
                              }
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="btn btn-primary btn-custom btn-primary-custom" // Applied custom button classes
                              disabled={isSubmitting || !dirty || !isValid}
                            >
                              {isSubmitting
                                ? "Saving..."
                                : profileExists
                                ? "Update"
                                : "Create"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </Form>
                  );
                }}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
