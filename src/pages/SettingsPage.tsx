import { useState, FormEvent } from 'react';
import { User, Bell, Shield, LogOut, Save, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';

export function SettingsPage() {
  const { user, profile, updateProfile, signOut } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? '',
    currency: profile?.currency ?? 'USD',
    alert_email: profile?.alert_email ?? true,
  });

  const set = (field: string, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await updateProfile({
      full_name: form.full_name || null,
      currency: form.currency,
      alert_email: form.alert_email,
    });
    setSaving(false);
    if (error) toast('error', 'Failed to save settings.');
    else toast('success', 'Settings saved successfully.');
  };

  const handleSignOut = async () => {
    if (!confirm('Sign out of PricePulse?')) return;
    await signOut();
  };

  const initials = (form.full_name || user?.email || 'U').slice(0, 2).toUpperCase();

  return (
    <div className="max-w-xl mx-auto animate-fade-in space-y-4">
      {/* Profile section */}
      <div className="card p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-brand-800/30 flex items-center justify-center">
            <User size={15} className="text-brand-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Profile</h2>
            <p className="text-xs text-text-muted">Manage your account details</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-5 p-4 bg-background-tertiary rounded-xl">
          <div className="w-12 h-12 rounded-2xl bg-brand-800/60 border border-brand-700/40 flex items-center justify-center text-base font-bold text-brand-300 flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">{form.full_name || 'Anonymous'}</p>
            <p className="text-xs text-text-muted">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input
              className="input"
              placeholder="Your full name"
              value={form.full_name}
              onChange={e => set('full_name', e.target.value)}
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              className="input opacity-60 cursor-not-allowed"
              value={user?.email ?? ''}
              disabled
              readOnly
            />
            <p className="text-2xs text-text-muted mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="label">Default Currency</label>
            <select
              className="input"
              value={form.currency}
              onChange={e => set('currency', e.target.value)}
            >
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="GBP">GBP — British Pound</option>
              <option value="CAD">CAD — Canadian Dollar</option>
              <option value="AUD">AUD — Australian Dollar</option>
              <option value="JPY">JPY — Japanese Yen</option>
            </select>
          </div>

          <button type="submit" disabled={saving} className="btn-primary gap-2">
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-text-primary/20 border-t-text-primary animate-spin" />
                Saving...
              </span>
            ) : (
              <>
                <Save size={14} />
                Save Changes
              </>
            )}
          </button>
        </form>
      </div>

      {/* Notifications */}
      <div className="card p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
            <Bell size={15} className="text-warning" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Notifications</h2>
            <p className="text-xs text-text-muted">Control when and how you get notified</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 bg-background-tertiary rounded-xl">
            <div>
              <p className="text-sm font-medium text-text-primary">Email Alerts</p>
              <p className="text-xs text-text-muted mt-0.5">Receive price change emails</p>
            </div>
            <button
              type="button"
              onClick={() => set('alert_email', !form.alert_email)}
              className={`relative w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0 ${
                form.alert_email ? 'bg-brand-800' : 'bg-background-secondary border border-border'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${
                  form.alert_email ? 'left-[calc(100%-1.375rem)]' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-background-tertiary rounded-xl opacity-50">
            <div>
              <p className="text-sm font-medium text-text-primary">Push Notifications</p>
              <p className="text-xs text-text-muted mt-0.5">Browser push alerts (coming soon)</p>
            </div>
            <div className="w-11 h-6 rounded-full bg-background-secondary border border-border relative">
              <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-text-muted/30 rounded-full" />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-secondary gap-2 text-sm"
          >
            <Save size={13} />
            Save Preferences
          </button>
        </div>
      </div>

      {/* Security */}
      <div className="card p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-brand-800/20 flex items-center justify-center">
            <Shield size={15} className="text-brand-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Security</h2>
            <p className="text-xs text-text-muted">Account access and security settings</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-3.5 bg-background-tertiary rounded-xl">
            <div>
              <p className="text-sm font-medium text-text-primary">Account created</p>
              <p className="text-xs text-text-muted mt-0.5">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
              </p>
            </div>
            <ChevronRight size={14} className="text-text-muted" />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-background-tertiary rounded-xl">
            <div>
              <p className="text-sm font-medium text-text-primary">Authentication</p>
              <p className="text-xs text-text-muted mt-0.5">Email / Password</p>
            </div>
            <span className="badge bg-success/10 text-success border border-success/20">Active</span>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="card p-5 border-error/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-text-primary">Sign Out</p>
            <p className="text-xs text-text-muted mt-0.5">End your current session</p>
          </div>
          <button onClick={handleSignOut} className="btn-danger gap-2 text-sm">
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
