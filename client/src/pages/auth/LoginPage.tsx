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
    if (!email.includes("@")) next.email = "请输入有效的邮箱地址";
    if (!password) next.password = "请输入密码";
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
      toast.success("登录成功");
      navigate(from, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "登录失败";
      setErrors({ form: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <div className="auth-card__header">
        <h2>欢迎回来</h2>
        <p>登录后查看今日安排、规划下一步，并保持优先级清晰可见。</p>
      </div>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {errors.form ? <div className="form-alert">{errors.form}</div> : null}
        <Input
          label="邮箱"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
          required
        />
        <Input
          label="密码"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
          required
        />
        <Button type="submit" loading={loading} size="lg">
          登录
        </Button>
      </form>
      <p className="auth-switch">
        还没有账号？<Link to="/register">创建账号</Link>
      </p>
    </AuthShell>
  );
}
