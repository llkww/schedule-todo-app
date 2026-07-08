import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Field";
import { AuthShell } from "./AuthShell";

type LoginErrors = {
  email?: string;
  password?: string;
  form?: string;
};

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/";

  function validate() {
    const next: LoginErrors = {};
    if (!email.includes("@")) next.email = "Enter a valid email address";
    if (!password) next.password = "Password is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    try {
      await login(email, password);
      toast.success("Logged in");
      navigate(from, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      setErrors({ form: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <div className="auth-card__header">
        <h2>Welcome back</h2>
        <p>Sign in to review today, plan next steps, and keep priorities visible.</p>
      </div>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {errors.form ? <div className="form-alert">{errors.form}</div> : null}
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
          required
        />
        <Button type="submit" loading={loading} size="lg">
          Log in
        </Button>
      </form>
      <p className="auth-switch">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </AuthShell>
  );
}
