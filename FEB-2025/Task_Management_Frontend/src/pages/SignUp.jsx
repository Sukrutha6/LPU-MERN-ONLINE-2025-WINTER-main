import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";

const SignUp = () => {
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [email, setEmail] = useState(false);
  const [fullName, setFullName] = useState(false);
  const navigate = useNavigate();
  const handleRegister = async (e) => {
    try {
      e.preventDefault();
      if (e.target.password.value !== e.target.confirmPassword.value) {
        alert("Password does not match!");
        return;
      }

      const resp = await fetch(
        import.meta.env.VITE_BACKEND_URL + "/users/register",
        {
          method: "POST",
          body: JSON.stringify({
            email,
            fullName,
            otp: e.target.otp.value,
            password: e.target.password.value,
          }),
          headers: {
            "content-type": "application/json",
          },
        }
      );

      console.log(resp);
      const respObj = await resp.json();
      console.log(respObj);
      if (respObj.status === "success") {
        // use hook to change the page useNavigate
        navigate("/login");
      } else {
        alert(respObj.message);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSendOtp = async (e) => {
    try {
      e.preventDefault();
      //DOUBT:
      const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/otps", {
        method: "POST",
        body: JSON.stringify({
          email: e.target.email.value,
        }),
        headers: {
          "content-type": "application/json",
        },
      });
      const resObj = await response.json();
      console.log(response);
      console.log(resObj);
      if (resObj.status === "success") {
        setIsOtpSent(true);
        setFullName(e.target.fullname.value);
        setEmail(e.target.email.value);
      } else {
        alert("Error " + resObj.message);
      }
    } catch (err) {
      // console.log(err);
      alert(err.message);
    }
  };
  return (
    <>
      {isOtpSent ? (
        <form className="register-form" onSubmit={handleRegister}>
          <h1>Enter Credentials</h1>
          <label htmlFor="email">Email: </label>
          <input className="signup-input" type="text" value={email} readOnly />
          <label htmlFor="fullName">Name: </label>
          <input
            className="signup-input"
            type="text"
            value={fullName}
            readOnly
          />
          <label htmlFor="otp">OTP: </label>
          <input
            className="signup-input"
            type="text"
            placeholder="OTP"
            name="otp"
            required
          />
          <label htmlFor="password">Password: </label>
          <input
            className="signup-input"
            type="password"
            placeholder="Password"
            name="password"
            required
          />
          <label htmlFor="confirmPassword">Confirm Password: </label>
          <input
            className="signup-input"
            type="password"
            placeholder="Confirm Password"
            name="confirmPassword"
            required
          />
          <button className="signup-button">Register</button>
        </form>
      ) : (
        <div className="signup-div">
          <form className="signup-form" onSubmit={handleSendOtp}>
            <h1>Create an Account</h1>
            <label htmlFor="fullname">Name: </label>
            <input
              className="signup-input"
              type="text"
              placeholder=" Full Name "
              name="fullname"
              required
            />
            <label htmlFor="email">Email: </label>
            <input
              className="signup-input"
              type="email"
              placeholder=" Email "
              name="email"
              required
            />
            <button className="signup-button">Send OTP</button>
            <Link to="/login" className="linktag">
              <span className="span">Already have an Account? </span> Login
            </Link>
          </form>
        </div>
      )}
    </>
  );
};

export default SignUp;
