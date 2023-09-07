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
