import Plans from "./Plans";
import Dashboard from "./Dashboard";
import Profile from "./Profile";
import Deposit from "./Deposit";
import Admin from "./Admin";
import Withdraw from "./Withdraw";
import Referral from "./Referral";
import About from "./About";
import { useState } from "react";
import "./App.css";

function App() {
  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);
const referralCode = params.get("ref") || "";

  const [isLogin, setIsLogin] = useState(true);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!isLogin && form.password !== form.confirm_password) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const url = isLogin
        ? "http://localhost:5000/api/login"
        : "http://localhost:5000/api/register";

     const body = isLogin
  ? {
      email: form.email,
      password: form.password,
    }
  : {
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      password: form.password,
      referral_code: referralCode || null,
    };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);

        if (isLogin) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));

          if (data.user.role === "admin") {
            window.location.href = "/admin";
          } else {
            window.location.href = "/dashboard";
          }
        } else {
          setForm({
            full_name: "",
            email: "",
            phone: "",
            password: "",
            confirm_password: "",
          });
        }
      } else {
        setMessage(data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to connect to the server. Make sure the backend is running."
      );
    }

    setLoading(false);
  };

  // DASHBOARD
  if (path === "/dashboard") {
    return <Dashboard />;
  }

  // PLANS
  if (path === "/plans") {
    return <Plans />;
  }

  // PROFILE
  if (path === "/profile") {
    return <Profile />;
  }

  // DEPOSIT
  if (path === "/deposit") {
    return <Deposit />;
  }
  if (path === "/about") {
  return <About />;
}

  // WITHDRAW
  if (path === "/withdraw") {
    return <Withdraw />;
  }
  if (path === "/referral") {
  return <Referral />;
}

  // ADMIN
  if (path === "/admin") {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      window.location.href = "/login";
      return null;
    }

    const user = JSON.parse(savedUser);

    if (user.role !== "admin") {
      window.location.href = "/dashboard";
      return null;
    }

    return <Admin />;
  }

  // LOGIN / REGISTER
  if (path === "/login") {
    return (
      <div className="register-page">
        <div className="register-card">
          <div className="register-logo">♛</div>

          <h1>Andre Royal Invest</h1>

          <p className="subtitle">
            {isLogin
              ? "Welcome back. Login to your account."
              : "Create your investment account."}
          </p>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <label>Full Name</label>

                <input
                  type="text"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />

                <label>Phone Number</label>

                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  required
                />
              </>
            )}

            <label>Email</label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />

            <label>Password</label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />

            {!isLogin && (
              <>
                <label>Confirm Password</label>

                <input
                  type="password"
                  name="confirm_password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                />
              </>
            )}

            <button type="submit" disabled={loading}>
              {loading
                ? "Please wait..."
                : isLogin
                ? "Login"
                : "Create Account"}
            </button>
          </form>

          {message && <div className="message">{message}</div>}

          <p className="login-text">
            {isLogin
              ? "Don't have an account? "
              : "Already have an account? "}

            <span
              onClick={() => {
                setIsLogin(!isLogin);
                setMessage("");
              }}
            >
              {isLogin ? "Create Account" : "Login"}
            </span>
          </p>

          <button
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // HOME PAGE
  return (
    <div className="home-page">
      <header className="home-header">
        <h1>ANDRE ROYAL INVEST</h1>

        <div className="home-buttons">
          <button
            onClick={() =>
              (window.location.href = "/login")
            }
          >
            Login / Create Account
          </button>
        </div>
      </header>

      <main className="home-content">
        <section className="hero-section">
          <h2>Welcome to Andre Royal Invest</h2>

          <p>
            Explore our investment plans, track your
            investments and manage your account from one
            simple dashboard.
          </p>

          <button
            onClick={() => {
              window.location.href = "/login";
            }}
          >
            Get Started
          </button>
        </section>

        <section className="home-section how it works">
          <h2>How It Works</h2>

          <div className="steps">
            <div>
              <h3>1. Create an Account</h3>
              <p>Register your account to get started.</p>
            </div>

            <div>
              <h3>2. Choose a Plan</h3>
              <p>
                Select an investment plan that suits you.
              </p>
            </div>

            <div>
              <h3>3. Track Your Investment</h3>
              <p>
                Monitor your investment from your dashboard.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <p>© 2026 Andre Royal Invest</p>
      </footer>
    </div>
  );
}

export default App;