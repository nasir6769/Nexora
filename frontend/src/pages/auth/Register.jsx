import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { registerUser } from "../../services/authService";
import { ROUTES } from "../../routes/routeConfig";

import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";

import "./auth.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "merchant",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const name = formData.name.trim();
    const email = formData.email.trim();

    if (!name) {
      setError("Name is required.");
      return;
    }

    if (!email) {
      setError("Email is required.");
      return;
    }

    if (!formData.password) {
      setError("Password is required.");
      return;
    }

    if (formData.password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await registerUser({
        name,
        email,
        password: formData.password,
        role: formData.role,
      });

      setSuccess(
        "Account created successfully. Redirecting to login..."
      );

      setTimeout(() => {
        navigate(ROUTES.AUTH.LOGIN, {
          replace: true,
        });
      }, 800);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          requestError?.message ||
          "Unable to create your account."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-card auth-card-register">
      <div className="auth-card-header">
        <h1>Create your account</h1>

        <p>
          Join the Nexora and choose your
          workspace.
        </p>
      </div>

      <form
        className="auth-form"
        onSubmit={handleSubmit}
      >
        <Input
          label="Full name"
          name="name"
          type="text"
          placeholder="Enter your name"
          value={formData.name}
          onChange={handleChange}
          autoComplete="name"
          disabled={isSubmitting}
          required
        />

        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          autoComplete="email"
          disabled={isSubmitting}
          required
        />

        <Select
          label="Account type"
          name="role"
          value={formData.role}
          onChange={handleChange}
          disabled={isSubmitting}
          options={[
            {
              value: "merchant",
              label: "Merchant",
            },
            {
              value: "supplier",
              label: "Supplier",
            },
          ]}
        />

        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="Create a password"
          value={formData.password}
          onChange={handleChange}
          autoComplete="new-password"
          disabled={isSubmitting}
          required
        />

        <Input
          label="Confirm password"
          name="confirmPassword"
          type="password"
          placeholder="Repeat your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          autoComplete="new-password"
          disabled={isSubmitting}
          required
        />

        {error && (
          <div
            className="auth-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="auth-success"
            role="status"
          >
            {success}
          </div>
        )}

        <Button
          type="submit"
          size="large"
          fullWidth
          loading={isSubmitting}
          disabled={Boolean(success)}
        >
          Create account
        </Button>
      </form>

      <div className="auth-footer">
        <span>Already have an account?</span>

        <Link to={ROUTES.AUTH.LOGIN}>
          Sign in
        </Link>
      </div>
    </section>
  );
}

export default Register;