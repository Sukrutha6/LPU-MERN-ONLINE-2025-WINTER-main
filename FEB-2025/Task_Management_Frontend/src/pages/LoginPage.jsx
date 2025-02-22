import React from "react";
import { Link } from "react-router";

const LoginPage = ({ afterLogin }) => {
  const handleLogin = async (e) => {
    e.preventDefault();
    const resp = await fetch(
      import.meta.env.VITE_BACKEND_URL + "/users/login",
      {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          email: e.target.email.value,
          password: e.target.password.value,
        }),
        headers: {
          "content-type": "application/json",
        },
      }
    );
    const resObj = await resp.json();
    console.log(resp);
    console.log(resObj);
    if (resObj.status === "success") {
      afterLogin(resObj);
    } else {
      alert(resObj.message);
    }
  };
  return (
    <>
      <form onSubmit={handleLogin} className="login-form">
        <h1>Sign Into your Account</h1>
        <label htmlFor="email">Email: </label>
        <input
          className="login-input"
          type="email"
          placeholder="Email"
          name="email"
          required
        />
        {/* Uncontrolled Inputs */}
        <label htmlFor="password">Password: </label>
        <input
          className="login-input"
          type="password"
          placeholder="Password"
          name="password"
          required
        />
        {/* Uncontrolled Inputs */}
        <button className="login-button">Login</button>
        <Link to="/signup" className="linktag">
          <span className="span"> Don't have an Account? </span> SignUp
        </Link>
      </form>
    </>
  );
};

export default LoginPage;
