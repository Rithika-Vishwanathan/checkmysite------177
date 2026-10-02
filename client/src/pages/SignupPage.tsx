import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await signup(name.trim(), email.trim(), password);
      navigate('/check');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'We could not create your account. Please try again.');
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
            Get Started
          </h1>
          <p className="mt-1 text-sm text-[#796B64] font-medium">
            Create your CheckMySite account
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="input-pill flex items-center px-4 py-3.5 gap-3">
              <svg className="w-5 h-5 text-[#9C8B82]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 11a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 20a8 8 0 0 1 16 0" /></svg>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                autoComplete="name"
                placeholder="Your name"
                className="w-full bg-transparent text-[#21130D] placeholder-[#A3948C] outline-none text-base font-medium"
              />
            </div>

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

            <div className="input-pill flex items-center px-4 py-3.5 gap-3">
              <svg className="w-5 h-5 text-[#9C8B82]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V8a4 4 0 1 1 8 0v2" /></svg>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Create password"
                className="w-full bg-transparent text-[#21130D] placeholder-[#A3948C] outline-none text-base font-medium"
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-[#9C8B82] p-1">
                {showPassword ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3l18 18" /><path d="M10.6 10.6A3 3 0 0 0 13.4 13.4" /><path d="M9.1 5.5A11.4 11.4 0 0 1 12 5c6.5 0 10 7 10 7a18.8 18.8 0 0 1-4.1 5.5" /><path d="M6.1 6.1A17.7 17.7 0 0 0 2 12s3.5 7 10 7a10.8 10.8 0 0 0 5.2-1.4" /></svg>
                )}
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-[#611722]/10 border border-[#611722]/20 text-[#611722] text-xs font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-burgundy w-full py-4 text-base tracking-wide"
            >
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <p className="text-center text-xs text-[#796B64] pt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-[#611722] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
