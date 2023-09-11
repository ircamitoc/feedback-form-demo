import React, { useReducer, useState, useEffect, useCallback } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { toast } from "react-toastify";
import axios from "axios";
import { API_URL } from "../config";
import { RECAPTCHA_KEY } from "../recaptcha";
import FormField from "./FormField.js";

// Define action types as constants
const UPDATE_FIELD = "UPDATE_FIELD";
const RESET_FORM = "RESET_FORM";

// Define the form reducer function
const formReducer = (state, action) => {
  switch (action.type) {
    case UPDATE_FIELD:
      return { ...state, [action.field]: action.value };
    case RESET_FORM:
      return initialState;
    default:
      return state;
  }
};

// Define initial form state
const initialState = {
  name: "",
  emailAddress: "",
  extraInfo: "",
  checkboxChecked: false,
};

// Define a separate function for form submission
const handleSubmit = async (
  name,
  emailAddress,
  extraInfo,
  checkboxChecked,
  captchaVerified,
  setSubmitting,
  setRetryCountdown,
  resetForm
) => {
  try {
    const currentTimestamp = new Date().toISOString();
    const response = await axios.post(`${API_URL}/submitFormToNotion`, {
      name,
      emailAddress,
      extraInfo,
      Timestamp: currentTimestamp,
    });

    if (response.status === 200) {
      // Reset the form after successful submission
      toast.success("Form submitted successfully");
      resetForm();
    } else {
      if (response.status === 429) {
        // Set the retry countdown based on the rate limit reset time
        const resetTime = new Date(
          response.headers["x-ratelimit-reset"] * 1000
        );
        const currentTime = new Date();
        const timeUntilReset = Math.max(
          0,
          Math.ceil((resetTime - currentTime) / 1000)
        );
        setRetryCountdown(timeUntilReset);
      }
    }
  } catch (error) {
    console.error("Error:", error);
    if (error.response) {
      // Handle specific error cases
      const { status } = error.response;

      if (status === 429) {
        toast.error("Error 429. Please try again later.");
        setRetryCountdown(55); // Default retry countdown for rate limiting
      } else {
        toast.error("An error occurred. Please try again later.");
      }
    } else {
      // Handle other network or unexpected errors
      toast.error("Sorry, something went wrong. Please try again later.");
    }
  } finally {
    setSubmitting(false); // Move this line to the finally block
  }
};

function Form() {
  const [formState, dispatch] = useReducer(formReducer, initialState);
  const [captchaVisible, setCaptchaVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [autoSubmit, setAutoSubmit] = useState(false);
  const [retryCountdown, setRetryCountdown] = useState(null);
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const { name, emailAddress, extraInfo, checkboxChecked } = formState;

  const handleInputFocus = (e) => {
    e.currentTarget.closest(".input-wrap").classList.add("focus");
    e.currentTarget.closest(".input-wrap").classList.add("not-empty");
  };

  const handleInputBlur = (e) => {
    if (e.currentTarget.value === "") {
      e.currentTarget.closest(".input-wrap").classList.remove("not-empty");
    }
    e.currentTarget.closest(".input-wrap").classList.remove("focus");
  };

  const handleFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    dispatch({ type: UPDATE_FIELD, field: name, value });

    if (type === "checkbox") {
      dispatch({
        type: UPDATE_FIELD,
        field: "checkboxChecked",
        value: checked,
      });
    }
  };

  const allowedEmailDomains = [
    ".com",
    ".org",
    ".net",
    ".co",
    ".us",
    ".edu",
    ".ph",
    ".gov",
    ".io",
    ".mil",
  ];

  const MAX_CHARACTERS = 2000;
  const MAX_NAME = 30;

  useEffect(() => {
    // Check if all fields are filled and the checkbox is checked
    if (name && emailAddress && extraInfo && checkboxChecked) {
      setCaptchaVisible(true);
    } else {
      setCaptchaVisible(false);
    }
  }, [name, emailAddress, extraInfo, checkboxChecked]);

  const memoizedHandleSubmit = useCallback(() => {
    const resetForm = () => {
      // Reset the form fields to their initial values
      dispatch({ type: RESET_FORM });
      // Reset other form-related state as needed
      setCaptchaVerified(false);
      setSubmitting(false);
      setAutoSubmit(false);
      setRetryCountdown(null);
    };

    handleSubmit(
      name,
      emailAddress,
      extraInfo,
      checkboxChecked,
      captchaVerified,
      setSubmitting,
      setRetryCountdown,
      resetForm
    );
  }, [
    name,
    emailAddress,
    extraInfo,
    checkboxChecked,
    captchaVerified,
    setSubmitting,
    setRetryCountdown,
  ]);

  useEffect(() => {
    if (autoSubmit) {
      memoizedHandleSubmit();
    }
  }, [autoSubmit, memoizedHandleSubmit]);

  useEffect(() => {
    if (retryCountdown !== null && retryCountdown > 0) {
      const countdownInterval = setInterval(() => {
        setRetryCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);

      return () => {
        clearInterval(countdownInterval);
      };
    } else if (retryCountdown === 0) {
      if (!submitting && captchaVerified) {
        // Auto-submit the form only when retryCountdown reaches 0 and the form is not already submitting
        setAutoSubmit(true);
      }
    }
  }, [retryCountdown, submitting, captchaVerified]);

  const isValidEmail = (email) => {
    const emailParts = email.split("@");
    if (emailParts.length !== 2) {
      return false; // Email should have exactly one "@" symbol
    }

    const domain = emailParts[1].toLowerCase();
    const domainExtension = domain.split(".").pop(); // Get the last part of the domain
    return allowedEmailDomains.includes("." + domainExtension);
  };

  const onChange = (value) => {
    // If value is null, it means the user hasn't verified the reCAPTCHA
    setCaptchaVerified(value !== null);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const namePattern = /^[A-Za-z\s]+$/;

    if (!name || !emailAddress || !extraInfo) {
      toast.error("Please fill out all required fields.");
      setSubmitting(false);
      return;
    } else if (!namePattern.test(name)) {
      toast.error("Name should contain only letters and spaces");
      setSubmitting(false);
      return;
    } else if (name.length > MAX_NAME) {
      toast.error(`Message must not exceed ${MAX_NAME} characters`);
      setSubmitting(false);
      return;
    } else if (!isValidEmail(emailAddress)) {
      toast.error("Invalid email address. Please check your email format.");
      setSubmitting(false);
      return;
    } else if (extraInfo.length > MAX_CHARACTERS) {
      toast.error(`Message must not exceed ${MAX_CHARACTERS} characters`);
      setSubmitting(false);
      return;
    }

    // Check the checkbox's checked property directly on the DOM element
    const checkbox = document.getElementById("privacyPolicy");

    if (!checkbox || !checkbox.checked) {
      toast.error("Please agree to the Terms and Conditions");
      setSubmitting(false);
      return;
    }

    if (!captchaVerified) {
      toast.error("Please verify the reCAPTCHA");
      setSubmitting(false);
      return;
    }

    setAutoSubmit(true); // Trigger automatic form submission
  };

  return (
    <form className="contact-form" onSubmit={handleSubmitForm}>
      {/* Use formState values and handleFieldChange for form inputs */}
      <FormField
        label="Name"
        name="name"
        value={name}
        onChange={handleFieldChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
      />
      <FormField
        label="Email Address"
        name="emailAddress"
        value={emailAddress}
        onChange={handleFieldChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
      />
      <div className="input-wrap textarea w-100">
        <textarea
          name="extraInfo"
          autoComplete="off"
          className="contact-input"
          onChange={handleFieldChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          value={extraInfo}
        ></textarea>
        <label>Feedback</label>
        <i className="icon fa-solid fa-inbox"></i>
      </div>
      <div className="contact-buttons">
        <label className="check-container">
          <p>
            I have read and accepted the{" "}
            <a href="###" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>
            .
          </p>
          <input
            type="checkbox"
            id="privacyPolicy"
            name="checkboxChecked"
            checked={checkboxChecked}
            onChange={handleFieldChange}
          />
          <span className="checkmark"></span>
        </label>
      </div>
      {captchaVisible && (
        <div className="contact-buttons">
          <div className="recaptcha-container">
            <ReCAPTCHA sitekey={`${RECAPTCHA_KEY}`} onChange={onChange} />
          </div>
          <br />
        </div>
      )}
      <button
        type="submit"
        className="btn"
        disabled={submitting || retryCountdown !== null}
      >
        {submitting
          ? "Submitting..."
          : retryCountdown !== null
          ? `Retrying in ${retryCountdown} seconds`
          : "Submit"}
      </button>
    </form>
  );
}

export default Form;
