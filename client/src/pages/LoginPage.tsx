import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const stepConfig = useMemo(
    () => [
      {
        title: 'Welcome Back',
        subtitle: "Let's continue your journey",
        field: 'email',
        placeholder: 'Email address',
        buttonText: 'Continue →',
      },
      {
        title: 'Enter your password',
        subtitle: 'Welcome back! Please enter\nyour password to continue',
        field: 'password',
        placeholder: 'Password',
        buttonText: 'Continue →',
      },
      {
        title: 'What should\nwe call you?',
        subtitle: 'This will be your display name',
        field: 'name',
        placeholder: 'Your name',
        buttonText: 'Continue →',
      },
    ],
    [],
  );

  const currentConfig = stepConfig[step];

  async function finalSubmit() {
    setError('');
    setIsSubmitting(true);

    try {
      const trimmedEmail = email.trim();
      const trimmedName = name.trim();
      if (!trimmedEmail) throw new Error('Please enter a valid email address.');
      if (!trimmedName) throw new Error('Please enter your name.');

      try {
        await login(trimmedEmail, password);
      } catch {
        await signup(trimmedName, trimmedEmail, password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleContinue() {
    setError('');

    if (step === 0) {
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Please enter a valid email address.');
        return;
      }
      setStep(1);
      return;
    }

    if (step === 1) {
      if (!password) {
        setError('Please enter your password.');
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!name.trim()) {
        setError('Please enter your name.');
        return;
      }
      await finalSubmit();
    }
  }

  async function handleQuickLogin() {
    setError('');
    setIsSubmitting(true);
    try {
      const defaultEmail = email.trim() || 'user@example.com';
      const defaultName = name.trim() || defaultEmail.split('@')[0] || 'Rithika';
      const defaultPass = password || 'password123';
      try {
        await login(defaultEmail, defaultPass);
      } catch {
        await signup(defaultName, defaultEmail, defaultPass);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="app-shell justify-center">
      <div className="main-container flex flex-col justify-end sm:justify-center min-h-screen pb-6 pt-12">

        {/* Floating Glass Card */}
        <div className="glass-panel w-full max-w-md mx-auto p-6 sm:p-8 rounded-[36px] shadow-[0_24px_60px_rgba(90,55,40,0.12)]">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="w-10 h-10 rounded-2xl bg-white/60 border border-white/80 shadow-sm flex items-center justify-center text-[#21130D] mb-4 hover:bg-white transition"
              aria-label="Back"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
          )}

          <h1 className="text-3xl font-extrabold tracking-tight text-[#21130D] leading-tight whitespace-pre-line">
            {currentConfig.title}
          </h1>
          <p className="mt-2 text-sm text-[#796B64] font-medium leading-snug whitespace-pre-line">
            {currentConfig.subtitle}
          </p>

          <div className="mt-6 space-y-4">
            {currentConfig.field === 'email' && (
              <div className="input-pill flex items-center px-4 py-3.5 gap-3">
                <svg className="w-5 h-5 text-[#9C8B82]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z" /><path d="m5 7 7 5 7-5" /></svg>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  autoComplete="email"
                  placeholder={currentConfig.placeholder}
                  className="w-full bg-transparent text-[#21130D] placeholder-[#A3948C] outline-none text-base font-medium"
                />
              </div>
            )}

            {currentConfig.field === 'password' && (
              <>
                <div className="input-pill flex items-center px-4 py-3.5 gap-3">
                  <svg className="w-5 h-5 text-[#9C8B82]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V8a4 4 0 1 1 8 0v2" /></svg>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder={currentConfig.placeholder}
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
                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-xs font-semibold text-[#611722] hover:underline">
                    Forgot password?
                  </Link>
                </div>
              </>
            )}

            {currentConfig.field === 'name' && (
              <div className="input-pill flex items-center px-4 py-3.5 gap-3">
                <svg className="w-5 h-5 text-[#9C8B82]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 11a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 20a8 8 0 0 1 16 0" /></svg>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  autoComplete="name"
                  placeholder={currentConfig.placeholder}
                  className="w-full bg-transparent text-[#21130D] placeholder-[#A3948C] outline-none text-base font-medium"
                />
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-2xl bg-[#611722]/10 border border-[#611722]/20 text-[#611722] text-xs font-medium">
                {error}
              </div>
            )}

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleContinue}
              className="btn-burgundy w-full py-4 text-base tracking-wide"
            >
              {isSubmitting ? 'Continuing...' : currentConfig.buttonText}
            </button>

            {step === 0 && (
              <>
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-[#21130D]/10" />
                  <span className="text-xs text-[#9C8B82] uppercase tracking-wider font-semibold">or</span>
                  <div className="flex-1 h-px bg-[#21130D]/10" />
                </div>

                <button
                  type="button"
                  onClick={handleQuickLogin}
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-full border border-white/80 bg-white/70 backdrop-blur-md text-[#21130D] font-semibold text-sm flex items-center justify-center gap-2.5 shadow-sm hover:bg-white transition"
                >
                  <span className="w-6 h-6 rounded-full bg-[#611722]/10 text-[#611722] font-extrabold flex items-center justify-center text-xs">✓</span>
                  Continue as Demo User
                </button>
              </>
            )}

            {step === 0 && (
              <p className="text-center text-xs text-[#796B64] pt-2">
                By continuing, you agree to our{' '}
                <span className="text-[#611722] font-semibold underline cursor-pointer">
                  Terms & Privacy Policy
                </span>
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
