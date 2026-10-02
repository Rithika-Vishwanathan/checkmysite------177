import { useState } from 'react';
import { Link } from 'react-router-dom';
import { resetPassword } from '../firebase';

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
      await resetPassword(email.trim());
      setSuccess('A password reset link has been sent to your email.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to send reset email.';
      if (message.includes('user-not-found')) {
        setError('No account was found for that email address.');
      } else if (message.includes('invalid-email')) {
        setError('Please enter a valid email address.');
      } else {
        setError('We could not send a reset link. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] px-4 py-6 text-[#171717] sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl items-center justify-center">
        <div className="w-full max-w-lg rounded-[28px] border border-[#E7E5E4] bg-white p-6 shadow-[0_20px_60px_rgba(23,23,23,0.08)] sm:p-8">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5A0714] text-lg font-semibold text-white">C</div>
            <div className="text-xl font-semibold tracking-[-0.05em]">CheckMySite</div>
          </div>

          <div className="mb-6">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-[#777777]">Account recovery</div>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-[#171717]">Reset your password</h1>
            <p className="mt-2 text-sm leading-6 text-[#777777]">Enter the email address linked to your workspace and we’ll send a reset link.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#171717]">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                className="w-full rounded-xl border border-[#E7E5E4] bg-white px-3 py-2.75 text-sm text-[#171717] placeholder:text-[#B3B0AD] outline-none transition duration-200 focus:border-[#5A0714] focus:ring-2 focus:ring-[#F8E9EC]"
              />
            </div>

            {error && <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3 py-2.5 text-sm text-[#B91C1C]">{error}</div>}
            {success && <div className="rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2.5 text-sm text-[#166534]">{success}</div>}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-[#5A0714] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(90,7,20,0.18)] transition duration-200 hover:bg-[#43050E] hover:shadow-[0_12px_24px_rgba(90,7,20,0.22)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[#777777]">
            Back to{' '}
            <Link to="/login" className="font-semibold text-[#5A0714] transition hover:text-[#43050E]">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
