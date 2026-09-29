import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./OwnerLogin.css";

export default function OwnerLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const loggedInUser = await login(
        form.email,
        form.password
      );

      const owner =
        loggedInUser?.role === "owner" ||
        loggedInUser?.is_admin === true;

      if (!owner) {
        setError(
          "This account does not have owner access."
        );
        return;
      }

      const redirectTo =
        location.state?.from || "/owner/dashboard";

      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(
        err.message ||
          "Unable to login. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="owner-login-page">
      <div className="owner-login-card">
        <div className="owner-login-brand">
          <div className="owner-login-logo">B</div>

          <div>
            <div className="owner-login-brand-name">
              Book<span>A</span>Bite
            </div>

            <div className="owner-login-brand-subtitle">
              Restaurant Partner Portal
            </div>
          </div>
        </div>

        <div className="owner-login-heading">
          <span>OWNER ACCESS</span>
          <h1>Welcome back</h1>
          <p>
            Sign in to manage your restaurant and
            reservations.
          </p>
        </div>

        {error && (
          <div className="owner-login-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="owner-login-field">
            <label htmlFor="owner-email">
              Email address
            </label>

            <input
              id="owner-email"
              name="email"
              type="email"
              placeholder="owner@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="owner-login-field">
            <label htmlFor="owner-password">
              Password
            </label>

            <input
              id="owner-password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="owner-login-button"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign in as owner"}
          </button>
        </form>

        <button
          type="button"
          className="owner-login-back"
          onClick={() => navigate("/")}
        >
          ← Back to BookABite
        </button>
      </div>
    </div>
  );
}