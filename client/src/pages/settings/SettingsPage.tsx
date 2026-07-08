import { useEffect, useState, type FormEvent } from "react";
import { LogOut, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Field";
import { PageHeader } from "../../components/ui/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { updatePassword, updateProfile } from "../../services/users";

export function SettingsPage() {
  const { user, refreshUser, logout } = useAuth();
  const [username, setUsername] = useState(user?.username ?? "");
  const [profileError, setProfileError] = useState("");
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setUsername(user?.username ?? "");
  }, [user?.username]);

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    if (!username.trim()) {
      setProfileError("请输入用户名");
      return;
    }
    setSaving(true);
    setProfileError("");
    try {
      await updateProfile({ username: username.trim() });
      await refreshUser();
      toast.success("个人资料已更新");
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "个人资料更新失败");
    } finally {
      setSaving(false);
    }
  }

  async function savePassword(event: FormEvent) {
    event.preventDefault();
    if (passwords.newPassword.length < 8) {
      setPasswordError("新密码至少需要 8 个字符");
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError("两次输入的密码不一致");
      return;
    }
    setSaving(true);
    setPasswordError("");
    try {
      await updatePassword(passwords);
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("密码已更新");
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "密码更新失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader title="设置" description="调整账户和密码。" />
      <div className="settings-grid">
        <Card title="个人资料" description={user?.email ?? "登录账号"}>
          <form className="form-stack" onSubmit={saveProfile}>
            {profileError ? <div className="form-alert">{profileError}</div> : null}
            <Input
              label="用户名"
              name="username"
              placeholder="例如：小林"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
            <Button type="submit" loading={saving} icon={<Save aria-hidden="true" />}>
              保存
            </Button>
          </form>
        </Card>

        <Card title="修改密码" description="至少 8 个字符，包含字母和数字。">
          <form className="form-stack" onSubmit={savePassword}>
            {passwordError ? <div className="form-alert">{passwordError}</div> : null}
            <Input
              label="当前密码"
              name="currentPassword"
              type="password"
              value={passwords.currentPassword}
              onChange={(event) => setPasswords((current) => ({ ...current, currentPassword: event.target.value }))}
              required
            />
            <Input
              label="新密码"
              name="newPassword"
              type="password"
              value={passwords.newPassword}
              onChange={(event) => setPasswords((current) => ({ ...current, newPassword: event.target.value }))}
              required
            />
            <Input
              label="确认新密码"
              name="confirmPassword"
              type="password"
              value={passwords.confirmPassword}
              onChange={(event) => setPasswords((current) => ({ ...current, confirmPassword: event.target.value }))}
              required
            />
            <Button type="submit" loading={saving}>
              保存
            </Button>
          </form>
        </Card>

        <Card title="账号安全">
          <p className="muted-text">在公共设备上使用后，记得退出登录。</p>
          <Button variant="secondary" onClick={() => void logout()} icon={<LogOut aria-hidden="true" />}>
            退出登录
          </Button>
        </Card>
      </div>
    </>
  );
}
