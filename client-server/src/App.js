// import React, { useReducer, useState } from "react";
// import "./App.css";
// import ReCAPTCHA from "react-google-recaptcha";
// import { ToastContainer, toast } from "react-toastify";
// import axios from "axios"; // Import Axios
// import "react-toastify/dist/ReactToastify.css";
// import { API_URL } from "./config"; // Import the API URL from the configuration file
// import { RECAPTCHA_KEY } from "./recaptcha"; // Import the API URL from the configuration file

// // Define your action types as constants
// const UPDATE_FIELD = "UPDATE_FIELD";
// const RESET_FORM = "RESET_FORM";

// // Define your initial state
// const initialState = {
//   name: "",
//   emailAddress: "",
//   extraInfo: "",
// };

// // Define your reducer function
// const formReducer = (state, action) => {
//   switch (action.type) {
//     case UPDATE_FIELD:
//       return { ...state, [action.field]: action.value };
//     case RESET_FORM:
//       return initialState;
//     default:
//       return state;
//   }
// };

// function FormField({ label, name, value, onChange, onFocus, onBlur }) {
//   const isNotEmpty = value !== ""; // Check if the input has a value

//   return (
//     <div className={`input-wrap w-100 ${isNotEmpty ? "not-empty" : ""}`}>
//       <input
//         className="contact-input"
//         autoComplete="off"
//         name={name}
//         type="text"
//         onFocus={onFocus}
//         onBlur={onBlur}
//         onChange={onChange}
//         value={value}
//       />
//       <label>{label}</label>
//       <i
//         className={`icon fa-solid fa-${
//           name === "name" ? "address-card" : "envelope"
//         }`}
//       ></i>
//     </div>
//   );
// }

// function handleInputFocus(e) {
//   e.currentTarget.closest(".input-wrap").classList.add("focus");
//   e.currentTarget.closest(".input-wrap").classList.add("not-empty");
// }

// function handleInputBlur(e) {
//   if (e.currentTarget.value === "") {
//     e.currentTarget.closest(".input-wrap").classList.remove("not-empty");
//   }
//   e.currentTarget.closest(".input-wrap").classList.remove("focus");
// }

// function App() {
//   const [formState, dispatch] = useReducer(formReducer, initialState);

//   // Destructure formState to access form values
//   const { name, emailAddress, extraInfo } = formState;

//   const handleFieldChange = (e) => {
//     const { name, value } = e.target;
//     // Update form state using the UPDATE_FIELD action
//     dispatch({ type: UPDATE_FIELD, field: name, value });
//   };

//   const allowedEmailDomains = [
//     "gmail.com",
//     "hotmail.com",
//     "yahoo.com",
//     "aol.com",
//     "msn.com",
//   ]; // Add your allowed domains here
//   const MAX_CHARACTERS = 2000; // Define the maximum character limit
//   const MAX_NAME = 30; // Define the maximum character list

//   const [submitting, setSubmitting] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);

//     const namePattern = /^[A-Za-z\s]+$/;

//     if (!name || !emailAddress || !extraInfo) {
//       toast.error("Please fill out all required fields.");
//       setSubmitting(false);
//       return;
//     } else if (!namePattern.test(name)) {
//       toast.error("Name should contain only letters and spaces");
//       setSubmitting(false);
//       return;
//     } else if (name.length > MAX_NAME) {
//       toast.error(`Message must not exceed ${MAX_NAME} characters`);
//       setSubmitting(false);
//       return;
//     } else if (!isValidEmail(emailAddress)) {
//       toast.error("Invalid email address. Please check your email format.");
//       setSubmitting(false);
//       return;
//     } else if (extraInfo.length > MAX_CHARACTERS) {
//       toast.error(`Message must not exceed ${MAX_CHARACTERS} characters`);
//       setSubmitting(false);
//       return;
//     } else if (!captchaVerified) {
//       toast.error("Please verify the reCAPTCHA");
//       setSubmitting(false);
//       return;
//     }

//     // Check the checkbox's checked property directly on the DOM element
//     const checkbox = document.getElementById("termsConditions");

//     if (!checkbox || !checkbox.checked) {
//       toast.error("Please agree to the Terms and Conditions");
//       setSubmitting(false);
//       return;
//     }

//     try {
//       const currentTimestamp = new Date().toString();
//       const response = await axios.post(`${API_URL}/submitFormToNotion`, {
//         name,
//         emailAddress,
//         extraInfo,
//         Timestamp: currentTimestamp,
//       });

//       if (response.status === 200) {
//         dispatch({ type: RESET_FORM });
//         console.log("Success!");
//         toast.success("Form submitted successfully");
//       } else {
//         toast.error("Form submission failed");
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       if (error.response) {
//         // Handle specific error cases
//         const { status } = error.response;

//         if (status === 429) {
//           toast.error("429 - Too Many Requests. Please try again later.");
//         } else {
//           toast.error("An error occurred. Please try again later.");
//         }
//       } else {
//         // Handle other network or unexpected errors
//         toast.error("Sorry, something went wrong. Please try again later.");
//       }
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // Function to validate email address
//   const isValidEmail = (email) => {
//     const emailParts = email.split("@");
//     if (emailParts.length !== 2) {
//       return false; // Email should have exactly one "@" symbol
//     }

//     const domain = emailParts[1].toLowerCase();
//     return allowedEmailDomains.includes(domain);
//   };

//   const [captchaVerified, setCaptchaVerified] = useState(false);

//   function onChange(value) {
//     // If value is null, it means the user hasn't verified the reCAPTCHA
//     setCaptchaVerified(value !== null);
//   }

//   return (
//     <div className="container">
//       <div className="contact-heading">
//         Feedback Form<span>.</span>
//       </div>
//       <form className="contact-form" onSubmit={handleSubmit}>
//         {/* Use formState values and handleFieldChange for form inputs */}
//         <FormField
//           label="Name"
//           name="name"
//           value={name}
//           onChange={handleFieldChange}
//           onFocus={handleInputFocus}
//           onBlur={handleInputBlur}
//         />
//         <FormField
//           label="Email Address"
//           name="emailAddress"
//           value={emailAddress}
//           onChange={handleFieldChange}
//           onFocus={handleInputFocus}
//           onBlur={handleInputBlur}
//         />
//         <div className="input-wrap textarea w-100">
//           <textarea
//             name="extraInfo"
//             autoComplete="off"
//             className="contact-input"
//             onFocus={handleInputFocus}
//             onBlur={handleInputBlur}
//             onChange={handleFieldChange}
//             value={extraInfo}
//           ></textarea>
//           <label>Feedback</label>
//           <i className="icon fa-solid fa-inbox"></i>
//         </div>
//         <div className="contact-buttons">
//           <label className="check-container">
//             <p>
//               I have read and agreed to the{" "}
//               <a href="###" target="_blank" rel="noopener noreferrer">
//                 Terms and Conditions
//               </a>
//               .
//             </p>
//             <input
//               type="checkbox"
//               id="termsConditions"
//               defaultChecked={false}
//             />
//             <span className="checkmark"></span>
//           </label>
//         </div>
//         <div className="contact-buttons">
//           <div className="recaptcha-container">
//             <ReCAPTCHA sitekey={`${RECAPTCHA_KEY}`} onChange={onChange} />
//           </div>
//           <br />
//           <button type="submit" className="btn" disabled={submitting}>
//             {submitting ? "Submitting..." : "Submit"}
//           </button>
//         </div>
//       </form>
//       <ToastContainer /> {/* ToastContainer does not need an ID */}
//     </div>
//   );
// }

// export default App;

import React from "react";
import "./App.css";
import Form from "./components/Form"; // Import the Form component
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <div className="container">
      <div className="contact-heading">
        Feedback Form<span>.</span>
      </div>
      <ToastContainer />
      <Form /> {/* Render the Form component */}
    </div>
  );
}

export default App;
