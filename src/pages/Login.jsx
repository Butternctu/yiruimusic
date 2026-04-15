import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';

const Login = () => {
  const { login, loginWithGoogle, isAuthenticated, initializationError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      let message = 'An error occurred. Please try again.';
      if (err.message?.includes('not initialized')) {
        message = 'Firebase initialization failed. Please check your configuration.';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'Invalid email or password.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Too many attempts. Please try again later.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      }
      setError(message);
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      if (err.code !== 'auth/cancelled-popup-request' && err.code !== 'auth/popup-closed-by-user') {
        const detail = err.code ? ` (${err.code})` : '';
        setError(`Google sign-in failed${detail}. Please try again.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEO title="Login | Dr. Yirui Li" url="/login" />
      <section className="min-h-screen bg-dark-900 flex flex-col relative overflow-hidden px-6 pt-32 pb-12">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(197,160,89,0.04)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(197,160,89,0.02)_0%,transparent_60%)] pointer-events-none" />

        <div className="w-full max-w-md relative z-10 animate-fadeInUp m-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-gold/30 bg-gold/5 mb-4">
              <LogIn className="w-6 h-6 text-gold" />
            </div>
            <h1 className="font-serif text-3xl text-white tracking-wide mb-2">Welcome Back</h1>
            <p className="text-gray-500 text-sm tracking-wider uppercase">Sign in to your account</p>
          </div>

          {/* Initialization Error Alert */}
          {initializationError && (
            <div className="mb-8 p-4 bg-[#d9736c]/10 border border-[#d9736c]/30 rounded text-center">
              <p className="text-[#d9736c] text-[11px] uppercase tracking-widest leading-loose">
                {initializationError}
                <br />
                <span className="opacity-70">
                  Please verify your GitHub Secrets or .env file is correctly set.
                </span>
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <label htmlFor="login-email" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="login-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full bg-transparent border-b border-white/20 py-3 text-gold placeholder-gray-600 focus:outline-none focus:border-gold transition-colors [&:-webkit-autofill]:[-webkit-text-fill-color:#C5A059] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#0a0a0a_inset]"
                placeholder="email@example.com"
              />
            </div>

            <div className="relative">
              <label htmlFor="login-password" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full bg-transparent border-b border-white/20 py-3 text-gold placeholder-gray-600 focus:outline-none focus:border-gold transition-colors pr-12 [&:-webkit-autofill]:[-webkit-text-fill-color:#C5A059] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#0a0a0a_inset]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gold transition-colors p-2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className={`text-[11px] text-[#d9736c] tracking-wider uppercase text-center ${shakeError ? 'animate-error-shake' : 'animate-error-pulse'}`}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center space-x-3 border py-4 tracking-[0.2em] uppercase text-xs transition-all duration-500 ${
                isLoading
                  ? 'border-gold text-dark-900 bg-gold/70 cursor-wait'
                  : 'border-gold text-gold hover:bg-gold hover:text-dark-900'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center space-x-2">
                  <span className="w-4 h-4 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
                  <span>Signing in...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          {/* Social Divider */}
          <div className="flex items-center my-10">
            <div className="flex-1 border-t border-white/5" />
            <span className="px-4 text-[10px] uppercase tracking-[0.2em] text-gray-600">or continue with</span>
            <div className="flex-1 border-t border-white/5" />
          </div>

          {/* Google Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-4 glass-card border border-white/10 py-4 hover:border-gold/50 transition-all duration-500 group"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-[10px] uppercase tracking-[0.2em] text-white group-hover:text-gold transition-colors">Google Account</span>
          </button>

          {/* Register link */}
          <div className="text-center mt-10">
            <p className="text-gray-500 text-xs tracking-wider">
              Don&apos;t have an account?{' '}
              <Link
                to="/register"
                className="text-gold hover:text-gold-light transition-colors duration-300 underline underline-offset-4 decoration-gold/30 hover:decoration-gold"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Login;
