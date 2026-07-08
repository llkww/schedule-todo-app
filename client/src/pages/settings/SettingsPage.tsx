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
      setProfileError("Username is required");
      return;
    }
    setSaving(true);
    setProfileError("");
    try {
      await updateProfile({ username: username.trim() });
      await refreshUser();
      toast.success("Profile updated");
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Profile update failed");
    } finally {
      setSaving(false);
    }
  }

  async function savePassword(event: FormEvent) {
    event.preventDefault();
    if (passwords.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setSaving(true);
    setPasswordError("");
    try {
      await updatePassword(passwords);
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password updated");
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Password update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader title="Settings" description="Manage profile information, password, and session state." />
      <div className="settings-grid">
        <Card title="Profile" description={user?.email ?? "Signed in account"}>
          <form className="form-stack" onSubmit={saveProfile}>
            {profileError ? <div className="form-alert">{profileError}</div> : null}
            <Input
              label="Username"
              name="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
            <Button type="submit" loading={saving} icon={<Save aria-hidden="true" />}>
              Save profile
            </Button>
          </form>
        </Card>

        <Card title="Change password" description="Use a password with letters, numbers, and at least 8 characters.">
          <form className="form-stack" onSubmit={savePassword}>
            {passwordError ? <div className="form-alert">{passwordError}</div> : null}
            <Input
              label="Current password"
              name="currentPassword"
              type="password"
              value={passwords.currentPassword}
              onChange={(event) => setPasswords((current) => ({ ...current, currentPassword: event.target.value }))}
              required
            />
            <Input
              label="New password"
              name="newPassword"
              type="password"
              value={passwords.newPassword}
              onChange={(event) => setPasswords((current) => ({ ...current, newPassword: event.target.value }))}
              required
            />
            <Input
              label="Confirm new password"
              name="confirmPassword"
              type="password"
              value={passwords.confirmPassword}
              onChange={(event) => setPasswords((current) => ({ ...current, confirmPassword: event.target.value }))}
              required
            />
            <Button type="submit" loading={saving}>
              Update password
            </Button>
          </form>
        </Card>

        <Card title="Security note" description="Authentication uses a bearer token stored locally in this browser.">
          <p className="muted-text">
            Keep this app on trusted devices. Logging out removes the local token from browser storage.
          </p>
          <Button variant="secondary" onClick={() => void logout()} icon={<LogOut aria-hidden="true" />}>
            Log out
          </Button>
        </Card>
      </div>
    </>
  );
}
