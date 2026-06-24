'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { authApi, usersApi } from '@/lib/api';
import { Logo } from '@/components/Logo';
import { IconLogout } from '@/components/icons';

function NavHeader() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // token may already be expired
    }
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" aria-label="DevFolio home">
          <Logo withWordmark />
        </Link>
        <nav className="flex items-center gap-1.5">
          <Link
            href="/dashboard"
            className="rounded-lg px-3 py-2 text-sm font-medium text-content-muted transition-colors hover:text-content"
          >
            Dashboard
          </Link>
          <Link href="/profile" className="rounded-lg px-3 py-2 text-sm font-medium text-content">
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="ml-1 inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-content-faint transition-colors hover:border-red-500/40 hover:text-red-400"
          >
            <IconLogout className="h-4 w-4" />
            Log out
          </button>
        </nav>
      </div>
    </header>
  );
}

export default function ProfilePage() {
  const {
    data: user,
    mutate,
    isLoading,
  } = useSWR('/users/me', usersApi.me, {
    revalidateOnFocus: false,
  });

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Populate form fields once user data arrives
  const [initialized, setInitialized] = useState(false);
  if (user && !initialized) {
    setName(user.name ?? '');
    setBio(user.bio ?? '');
    setAvatar(user.avatar ?? '');
    setInitialized(true);
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await usersApi.update({
        name: name.trim() || undefined,
        bio: bio.trim() || undefined,
        avatar: avatar.trim() || undefined,
      });
      await mutate();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-clip bg-ink">
      <div className="pointer-events-none fixed left-1/2 top-[-14rem] -z-10 h-[30rem] w-[40rem] -translate-x-1/2 rounded-full bg-accent/8 blur-[150px]" />
      <NavHeader />

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight text-content">Profile</h1>
          <p className="text-content-muted mt-1">Manage your account information</p>
        </div>

        {isLoading ? (
          <div className="text-content-faint text-sm">Loading...</div>
        ) : (
          <div className="df-card p-8 space-y-6">
            {/* Avatar preview */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-surface-2 border border-line overflow-hidden flex items-center justify-center">
                {avatar ? (
                  <Image src={avatar} alt={name} width={64} height={64} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl text-content-faint font-bold select-none">
                    {(name || user?.name || '?')[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="text-content font-semibold">{user?.name}</p>
                <p className="text-content-faint text-sm">{user?.email}</p>
                {user?.githubUsername && (
                  <p className="text-accent text-xs mt-0.5">@{user.githubUsername} on GitHub</p>
                )}
              </div>
            </div>

            <hr className="border-line" />

            <form onSubmit={handleSave} className="space-y-5">
              {error && (
                <div className="bg-red-950/50 border border-red-900 text-red-400 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs text-content-faint mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  placeholder="Your Name"
                  className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2.5 text-sm text-content focus:outline-none focus:border-accent/60"
                />
              </div>

              <div>
                <label className="block text-xs text-content-faint mb-1.5">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="A short bio about yourself..."
                  className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2.5 text-sm text-content focus:outline-none focus:border-accent/60 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs text-content-faint mb-1.5">Profile Photo</label>
                {(user?.googleId || user?.githubId) && avatar ? (
                  <div className="flex items-center justify-between bg-surface-2 border border-line rounded-lg px-3 py-2.5">
                    <span className="text-xs text-content-muted">
                      Synced from {user?.googleId ? 'Google' : 'GitHub'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAvatar('')}
                      className="text-xs text-content-faint hover:text-red-400 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://example.com/photo.png"
                    className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2.5 text-sm text-content focus:outline-none focus:border-accent/60"
                  />
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button type="submit" disabled={saving} className="df-btn df-btn-primary px-6 py-2.5 text-sm">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                {saved && <span className="text-accent text-sm">Saved!</span>}
              </div>
            </form>

            <hr className="border-line" />

            {/* Account info */}
            <div>
              <h3 className="text-sm font-semibold text-content mb-3">Account</h3>
              <div className="space-y-2 text-sm text-content-muted">
                <div className="flex justify-between">
                  <span>Email</span>
                  <span className="text-content">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span>Email verified</span>
                  <span className={user?.isEmailVerified ? 'text-accent' : 'text-content-faint'}>
                    {user?.isEmailVerified ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
