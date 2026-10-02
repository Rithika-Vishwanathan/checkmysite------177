import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', { email: email.trim() });
      setSuccess('A password reset link has been sent to your email.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'We could not send a reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell justify-center">
      <div className="main-container flex flex-col justify-end sm:justify-center min-h-screen pb-6 pt-12">

        {/* Floating Glass Card */}
        <div className="glass-panel w-full max-w-md mx-auto p-6 sm:p-8 rounded-[36px] shadow-[0_24px_60px_rgba(90,55,40,0.12)]">
          <Link
            to="/login"
            className="w-10 h-10 rounded-2xl bg-white/60 border border-white/80 shadow-sm flex items-center justify-center text-[#21130D] mb-4 hover:bg-white transition"
            aria-label="Back to login"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </Link>

          <h1 className="text-3xl font-extrabold tracking-tight text-[#21130D]">
            Reset Password
          </h1>
          <p className="mt-1 text-sm text-[#796B64] font-medium">
            Enter your email to receive a password reset link
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="input-pill flex items-center px-4 py-3.5 gap-3">
              <svg className="w-5 h-5 text-[#9C8B82]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z" /><path d="m5 7 7 5 7-5" /></svg>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                placeholder="Email address"
                className="w-full bg-transparent text-[#21130D] placeholder-[#A3948C] outline-none text-base font-medium"
              />
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-[#611722]/10 border border-[#611722]/20 text-[#611722] text-xs font-medium">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-burgundy w-full py-4 text-base tracking-wide"
            >
              {loading ? 'Sending...' : 'Send Reset Link →'}
            </button>
          </form>

          <p className="text-center text-xs text-[#796B64] pt-4">
            Back to{' '}
            <Link to="/login" className="text-[#611722] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
