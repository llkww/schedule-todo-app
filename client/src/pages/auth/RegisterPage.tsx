import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Field";
import { useAuth } from "../../context/AuthContext";
import { AuthShell } from "./AuthShell";

type RegisterErrors = Partial<Record<"username" | "email" | "password" | "confirmPassword" | "form", string>>;

function passwordScore(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Za-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [loading, setLoading] = useState(false);
  const score = useMemo(() => passwordScore(values.password), [values.password]);

  function update(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function validate() {
    const next: RegisterErrors = {};
    if (!values.username.trim()) next.username = "Username is required";
    if (!values.email.includes("@")) next.email = "Enter a valid email address";
    if (values.password.length < 8) next.password = "Use at least 8 characters";
    else if (!/[A-Za-z]/.test(values.password) || !/\d/.test(values.password)) {
      next.password = "Use both letters and numbers";
    }
    if (values.password !== values.confirmPassword) {
      next.confirmPassword = "Passwords do not match";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    try {
      await register(values);
      toast.success("Account created");
      navigate("/", { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed";
      setErrors({ form: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <div className="auth-card__header">
        <h2>Create account</h2>
        <p>Start with a private workspace where tasks and tags stay scoped to you.</p>
      </div>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {errors.form ? <div className="form-alert">{errors.form}</div> : null}
        <Input
          label="Username"
          name="username"
          autoComplete="username"
          value={values.username}
          onChange={(event) => update("username", event.target.value)}
          error={errors.username}
          required
        />
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(event) => update("email", event.target.value)}
          error={errors.email}
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={(event) => update("password", event.target.value)}
          error={errors.password}
          required
        />
        <div className="password-meter" aria-label="Password strength">
          <span className={score >= 1 ? "password-meter__bar password-meter__bar--active" : "password-meter__bar"} />
          <span className={score >= 2 ? "password-meter__bar password-meter__bar--active" : "password-meter__bar"} />
          <span className={score >= 3 ? "password-meter__bar password-meter__bar--active" : "password-meter__bar"} />
          <span className={score >= 4 ? "password-meter__bar password-meter__bar--active" : "password-meter__bar"} />
        </div>
        <Input
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={(event) => update("confirmPassword", event.target.value)}
          error={errors.confirmPassword}
          required
        />
        <Button type="submit" loading={loading} size="lg">
          Create account
        </Button>
      </form>
      <p className="auth-switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthShell>
  );
}
