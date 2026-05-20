'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { authApi, usersApi } from '@/lib/api';

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
    <header className="border-b border-slate-800 bg-slate-900">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-violet-400">
          DevFolio
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors"
          >
            Dashboard
          </Link>
          <Link href="/profile" className="text-slate-200 text-sm font-medium">
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm text-slate-500 hover:text-red-400 border border-slate-700 hover:border-red-800 px-3 py-1.5 rounded-lg transition-colors"
          >
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
    <div className="min-h-screen bg-slate-950">
      <NavHeader />

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100">Profile</h1>
          <p className="text-slate-400 mt-1">Manage your account information</p>
        </div>

        {isLoading ? (
          <div className="text-slate-500 text-sm">Loading...</div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
            {/* Avatar preview */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
                {avatar ? (
                  <Image src={avatar} alt={name} width={64} height={64} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl text-slate-500 font-bold select-none">
                    {(name || user?.name || '?')[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="text-slate-200 font-semibold">{user?.name}</p>
                <p className="text-slate-500 text-sm">{user?.email}</p>
                {user?.githubUsername && (
                  <p className="text-violet-400 text-xs mt-0.5">@{user.githubUsername} on GitHub</p>
                )}
              </div>
            </div>

            <hr className="border-slate-800" />

            <form onSubmit={handleSave} className="space-y-5">
              {error && (
                <div className="bg-red-950/50 border border-red-900 text-red-400 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  placeholder="Your Name"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="A short bio about yourself..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-violet-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Avatar URL</label>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://github.com/yourname.png"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                {saved && <span className="text-green-400 text-sm">Saved!</span>}
              </div>
            </form>

            <hr className="border-slate-800" />

            {/* Account info */}
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Account</h3>
              <div className="space-y-2 text-sm text-slate-400">
                <div className="flex justify-between">
                  <span>Email</span>
                  <span className="text-slate-200">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span>Email verified</span>
                  <span className={user?.isEmailVerified ? 'text-green-400' : 'text-slate-500'}>
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
