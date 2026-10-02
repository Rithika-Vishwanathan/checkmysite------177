import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUpWithEmail } from '../firebase';

function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6A3 3 0 0 0 13.4 13.4" />
      <path d="M9.1 5.5A11.4 11.4 0 0 1 12 5c6.5 0 10 7 10 7a18.8 18.8 0 0 1-4.1 5.5" />
      <path d="M6.1 6.1A17.7 17.7 0 0 0 2 12s3.5 7 10 7a10.8 10.8 0 0 0 5.2-1.4" />
    </svg>
  );
}

export default function SignupPage() {
  const navigate = useNavigate();
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
      await signUpWithEmail(email.trim(), password);
      navigate('/check');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed.';
      if (message.includes('email-already-in-use')) {
        setError('This email is already in use. Please sign in instead.');
      } else if (message.includes('weak-password')) {
        setError('Choose a stronger password with at least 6 characters.');
      } else if (message.includes('invalid-email')) {
        setError('Please enter a valid email address.');
      } else {
        setError('We could not create your account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F6] px-4 py-8 text-[#151515] sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-[#E8E2DF] bg-white shadow-[0_40px_90px_rgba(17,17,17,0.04)] lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex items-center justify-center bg-[#FAF8F6] p-5 sm:p-6 lg:p-8">
            <div className="w-full max-w-[560px]">
              <div className="relative flex min-h-[520px] items-center justify-center overflow-hidden rounded-[30px] border border-[#E8E2DF] bg-[radial-gradient(circle_at_top_left,_rgba(139,0,21,0.08),_transparent_35%),linear-gradient(180deg,#FAF8F6_0%,#F5F1EE_100%)] p-8">
                <div className="absolute left-8 top-8 h-24 w-24 rounded-full bg-[#F8E9EC] blur-3xl" />
                <div className="absolute bottom-10 right-8 h-28 w-28 rounded-full bg-[#F2E1E5] blur-3xl" />

                <div className="relative w-full max-w-md">
                  <div className="rounded-[26px] border border-[#E8E2DF] bg-white/90 p-4 shadow-[0_30px_70px_rgba(17,17,17,0.08)] backdrop-blur-sm auth-float">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-[#8B0015]" />
                      <div className="h-2.5 w-2.5 rounded-full bg-[#D4C9C4]" />
                      <div className="h-2.5 w-2.5 rounded-full bg-[#D4C9C4]" />
                    </div>

                    <div className="rounded-2xl border border-[#E8E2DF] bg-[#FAF8F6] p-3">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 rounded-full border border-[#E8E2DF] bg-white px-2.5 py-1.5 text-[11px] text-[#737373]">
                          <span className="inline-block h-2 w-2 rounded-full bg-[#8B0015]" />
                          https://example.com
                        </div>
                        <button type="button" className="rounded-full bg-[#8B0015] px-3 py-1.5 text-[10px] font-medium text-white">
                          Analyze →
                        </button>
                      </div>

                      <div className="space-y-2.5 text-[11px] text-[#3C3A38]">
                        {['Scanning website...', 'Checking performance', 'Analyzing SEO', 'Checking accessibility', 'Generating report'].map((label, index) => (
                          <div key={label} className="flex items-center gap-2.5">
                            <div className={`flex h-5 w-5 items-center justify-center rounded-full ${index < 4 ? 'bg-[#8B0015]/10 text-[#8B0015]' : 'bg-[#E8E2DF] text-[#737373]'}`}>
                              {index < 4 ? '✓' : '•'}
                            </div>
                            <span>{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="absolute -bottom-7 left-6 w-[220px] rounded-[22px] border border-[#E8E2DF] bg-white/90 p-4 shadow-[0_20px_40px_rgba(17,17,17,0.08)] rotate-[-8deg]">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-[0.16em] text-[#737373]">Audit Report</span>
                      <span className="rounded-full bg-[#F8E9EC] px-2 py-1 text-[10px] font-medium text-[#8B0015]">Live</span>
                    </div>
                    <div className="space-y-2.5">
                      {['Performance', 'SEO', 'Accessibility', 'Security', 'Best Practices'].map((label, index) => (
                        <div key={label}>
                          <div className="mb-1 flex items-center justify-between text-[10px] text-[#737373]">
                            <span>{label}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-[#F1ECE9]">
                            <div className="h-full rounded-full bg-[#8B0015]" style={{ width: `${72 + index * 7}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center bg-white p-6 sm:p-8 lg:p-10">
            <div className="w-full max-w-md">
              <div className="mb-7 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B0015] text-lg font-semibold text-white shadow-[0_12px_24px_rgba(139,0,21,0.22)]">C</div>
                <div className="text-[1.7rem] font-semibold tracking-[-0.06em] text-[#151515]">CheckMySite</div>
              </div>

              <div className="mb-6">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-[#737373]">Create account</div>
                <h1 className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-[#151515]">Get started</h1>
                <p className="mt-2 text-sm text-[#737373]">Create your CheckMySite workspace</p>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#151515]">Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} type="text" autoComplete="name" placeholder="Enter your name" className="w-full rounded-xl border border-[#E8E2DF] bg-white px-3 py-3 text-sm text-[#151515] placeholder:text-[#B1A7A2] outline-none transition focus:border-[#8B0015] focus:ring-2 focus:ring-[#F8E9EC]" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#151515]">Email</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" placeholder="Enter your email" className="w-full rounded-xl border border-[#E8E2DF] bg-white px-3 py-3 text-sm text-[#151515] placeholder:text-[#B1A7A2] outline-none transition focus:border-[#8B0015] focus:ring-2 focus:ring-[#F8E9EC]" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#151515]">Password</label>
                  <div className="relative">
                    <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Create a password" className="w-full rounded-xl border border-[#E8E2DF] bg-white px-3 py-3 pr-10 text-sm text-[#151515] placeholder:text-[#B1A7A2] outline-none transition focus:border-[#8B0015] focus:ring-2 focus:ring-[#F8E9EC]" />
                    <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-3 flex items-center text-[#737373]" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                      <EyeIcon visible={showPassword} />
                    </button>
                  </div>
                </div>

                {error && <div className="rounded-xl border border-[#F8C7CF] bg-[#FFF6F7] px-3 py-2.5 text-sm text-[#8B0015]">{error}</div>}

                <button type="submit" disabled={loading} className="flex w-full items-center justify-center rounded-xl bg-[#8B0015] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_22px_rgba(139,0,21,0.22)] transition duration-200 hover:bg-[#65000F] hover:shadow-[0_16px_28px_rgba(139,0,21,0.28)] disabled:cursor-not-allowed disabled:opacity-70">
                  {loading ? 'Creating account...' : 'Create account →'}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-[#737373]">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-[#8B0015] transition hover:text-[#65000F]">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
