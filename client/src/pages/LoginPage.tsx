import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginWithEmail, loginWithGoogle, signUpWithEmail, auth } from '../firebase';

function formatFirebaseError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Authentication failed.';

  if (message.includes('invalid-email') || message.includes('Invalid email')) return 'Please enter a valid email address.';
  if (message.includes('wrong-password') || message.includes('user-not-found')) return 'Your email or password is incorrect.';
  if (message.includes('too-many-requests')) return 'Too many attempts. Please try again in a few minutes.';
  if (message.includes('popup-closed-by-user')) return 'Google sign-in was cancelled.';
  if (message.includes('email-already-in-use')) return 'An account already exists for this email.';
  if (message.includes('auth/')) return 'We could not complete sign-in. Please try again.';

  return message || 'We could not complete sign-in. Please try again.';
}

function StepCard({ title, subtitle, children, reverse }: { title: string; subtitle: string; children: React.ReactNode; reverse?: boolean }) {
  return (
    <div className={`auth-card ${reverse ? 'reverse' : ''}`}>
      <div className="auth-card-inner">
        <div className="auth-header">
          <button type="button" className="back-arrow" aria-label="Back" onClick={() => window.history.back()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
        </div>
        <div className="auth-title" style={{ whiteSpace: 'pre-line' }}>{title}</div>
        <div className="auth-subtitle" style={{ whiteSpace: 'pre-line' }}>{subtitle}</div>
        {children}
      </div>
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
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
      if (!trimmedEmail) {
        throw new Error('Please enter a valid email address.');
      }
      if (!trimmedName) {
        throw new Error('Please enter your name.');
      }

      const userCredential = await loginWithEmail(trimmedEmail, password);
      if (userCredential.user && trimmedName && auth) {
        const { updateProfile } = await import('firebase/auth');
        await updateProfile(userCredential.user, { displayName: trimmedName });
      }
      navigate('/dashboard');
    } catch (err) {
      try {
        if (err instanceof Error && err.message.includes('user-not-found')) {
          const credential = await signUpWithEmail(email.trim(), password);
          if (credential.user && auth) {
            const { updateProfile } = await import('firebase/auth');
            await updateProfile(credential.user, { displayName: name.trim() });
          }
          navigate('/dashboard');
          return;
        }
      } catch (signUpError) {
        setError(formatFirebaseError(signUpError));
        setIsSubmitting(false);
        return;
      }
      setError(formatFirebaseError(err));
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

  async function handleGoogle() {
    setError('');
    setIsSubmitting(true);
    try {
      const result = await loginWithGoogle();
      if (result.user && auth) {
        const { updateProfile } = await import('firebase/auth');
        const displayName = result.user.displayName || name.trim() || 'New user';
        await updateProfile(result.user, { displayName });
      }
      navigate('/dashboard');
    } catch (err) {
      setError(formatFirebaseError(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  const renderInput = () => {
    if (currentConfig.field === 'email') {
      return (
        <div className="field-box">
          <span className="field-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z" /><path d="m5 7 7 5 7-5" /></svg></span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" placeholder={currentConfig.placeholder} className="auth-input" />
        </div>
      );
    }

    if (currentConfig.field === 'password') {
      return (
        <>
          <div className="field-box">
            <span className="field-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V8a4 4 0 1 1 8 0v2" /></svg></span>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder={currentConfig.placeholder} className="auth-input" />
            <button type="button" onClick={() => setShowPassword((value) => !value)} className="field-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3l18 18" /><path d="M10.6 10.6A3 3 0 0 0 13.4 13.4" /><path d="M9.1 5.5A11.4 11.4 0 0 1 12 5c6.5 0 10 7 10 7a18.8 18.8 0 0 1-4.1 5.5" /><path d="M6.1 6.1A17.7 17.7 0 0 0 2 12s3.5 7 10 7a10.8 10.8 0 0 0 5.2-1.4" /></svg>}
            </button>
          </div>
          <div className="auth-link-row">
            <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
          </div>
        </>
      );
    }

    return (
      <div className="field-box">
        <span className="field-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 11a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 20a8 8 0 0 1 16 0" /></svg></span>
        <input value={name} onChange={(e) => setName(e.target.value)} type="text" autoComplete="name" placeholder={currentConfig.placeholder} className="auth-input" />
      </div>
    );
  };

  return (
    <div className="auth-page-shell">
      <div className="auth-screen-card">
        <div className="auth-card-shell">
          <StepCard title={currentConfig.title} subtitle={currentConfig.subtitle} reverse={step === 1}>
            {renderInput()}
            {error && <div className="auth-error">{error}</div>}
            <button type="button" disabled={isSubmitting} onClick={handleContinue} className="primary-action">
              {isSubmitting ? 'Continuing...' : currentConfig.buttonText}
            </button>
            {step === 0 && (
              <>
                <div className="auth-divider">or</div>
                <button type="button" className="google-button" onClick={handleGoogle} disabled={isSubmitting}>
                  <span className="google-mark">G</span>
                  Continue with Google
                </button>
              </>
            )}
            {step === 0 && <div className="auth-privacy">By continuing, you agree to our <span>Terms & Privacy Policy</span></div>}
          </StepCard>
        </div>
      </div>
    </div>
  );
}
