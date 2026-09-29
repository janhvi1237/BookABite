import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function Login() {
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

      // IMPORTANT:
      // Use AuthContext so the Navbar and the rest of the app
      // immediately know that the user is logged in.
      await login(form.email, form.password);

      // If the user originally came from the booking page,
      // return them there after successful login.
      const redirectTo = location.state?.from || "/restaurants";

      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error("BOOKABITE LOGIN ERROR:", err);

      setError(
        err?.message ||
          "Unable to login. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bab-auth-page">
      <div className="bab-auth-card">
        <div className="bab-auth-header">
          <span className="bab-auth-eyebrow">
            BOOKABITE · WELCOME BACK
          </span>

          <h1>Good food starts here.</h1>

          <p>
            Sign in to manage your reservations and discover
            your next favourite table.
          </p>
        </div>

        <form
          className="bab-auth-form"
          onSubmit={handleSubmit}
        >
          {error && (
            <div className="bab-auth-error">
              {error}
            </div>
          )}

          <label>
            Email

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>

          <label>
            Password

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}

            {!loading && <span>→</span>}
          </button>
        </form>

        <p className="bab-auth-footer">
          New to BookABite?{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
          >
            Create an account
          </button>
        </p>
      </div>
    </section>
  );
}