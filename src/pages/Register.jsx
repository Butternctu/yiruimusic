import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatPhoneNumber } from '../data/bookingData';
import SEO from '../components/SEO';

const Register = () => {
  const { register, loginWithGoogle, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleChange = e => {
    const { name, value } = e.target;
    let formattedValue = value;
    if (name === 'phone') {
      formattedValue = formatPhoneNumber(value);
    }
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required.';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email.';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }
    return newErrors;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitError('');
    const newErrors = validate();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      return;
    }

    setIsLoading(true);
    try {
      await register(formData.email, formData.password, formData.name, formData.phone);
      navigate('/dashboard');
    } catch (err) {
      let message = 'An error occurred. Please try again.';
      if (err.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password is too weak. Use at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      }
      setSubmitError(message);
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSubmitError('');
    setIsLoading(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      if (err.code !== 'auth/cancelled-popup-request' && err.code !== 'auth/popup-closed-by-user') {
        setSubmitError('Google sign-in failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = fieldName =>
    `w-full bg-transparent border-b py-3 text-gold placeholder-gray-600 focus:outline-none focus:border-gold transition-colors [&:-webkit-autofill]:[-webkit-text-fill-color:#C5A059] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#0a0a0a_inset] ${
      errors[fieldName] ? 'border-[#d9736c]/50' : 'border-white/20'
    }`;

  return (
    <>
      <SEO title="Create Account | Dr. Yirui Li" url="/register" />
      <section className="min-h-screen bg-dark-900 flex flex-col relative overflow-hidden px-6 pt-32 pb-12">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(197,160,89,0.04)_0%,transparent_70%)] pointer-events-none" />

        <div className="w-full max-w-md relative z-10 animate-fadeInUp m-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-gold/30 bg-gold/5 mb-4">
              <UserPlus className="w-6 h-6 text-gold" />
            </div>
            <h1 className="font-serif text-3xl text-white tracking-wide mb-2">Create Account</h1>
            <p className="text-gray-500 text-xs tracking-wider uppercase">Join to book sessions</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative">
                <label htmlFor="reg-name" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="reg-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  className={inputClass('name')}
                  placeholder="Your full name"
                />
                {errors.name && (
                  <p className={`absolute -bottom-5 left-0 text-[10px] text-[#d9736c] tracking-wider uppercase ${shakeError ? 'animate-error-shake' : ''}`}>
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="relative">
                <label htmlFor="reg-phone" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                  Phone <span className="text-gray-600 normal-case tracking-normal">(optional)</span>
                </label>
                <input
                  type="tel"
                  id="reg-phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                  className={inputClass('phone')}
                  placeholder="(555) 000-0000"
                />
              </div>
            </div>

            <div className="relative">
              <label htmlFor="reg-email" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="reg-email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                className={inputClass('email')}
                placeholder="email@example.com"
              />
              {errors.email && (
                <p className={`absolute -bottom-5 left-0 text-[10px] text-[#d9736c] tracking-wider uppercase ${shakeError ? 'animate-error-shake' : ''}`}>
                  {errors.email}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative">
                <label htmlFor="reg-password" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="reg-password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    className={`${inputClass('password')} pr-10`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gold transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className={`absolute -bottom-5 left-0 text-[10px] text-[#d9736c] tracking-wider uppercase ${shakeError ? 'animate-error-shake' : ''}`}>
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="relative">
                <label htmlFor="reg-confirm" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                  Confirm
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="reg-confirm"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className={inputClass('confirmPassword')}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className={`absolute -bottom-5 left-0 text-[10px] text-[#d9736c] tracking-wider uppercase ${shakeError ? 'animate-error-shake' : ''}`}>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {submitError && (
              <p className={`text-[11px] text-[#d9736c] tracking-wider uppercase text-center ${shakeError ? 'animate-error-shake' : 'animate-error-pulse'}`}>
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center space-x-3 border py-4 tracking-[0.2em] uppercase text-xs transition-all duration-500 mt-4 ${
                isLoading ? 'border-gold text-dark-900 bg-gold/70 cursor-wait' : 'border-gold text-gold hover:bg-gold hover:text-dark-900'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center space-x-2">
                  <span className="w-4 h-4 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
                  <span>Creating account...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <span>Create Account</span>
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

          <div className="text-center mt-10">
            <p className="text-gray-500 text-xs tracking-wider">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-gold hover:text-gold-light transition-colors duration-300 underline underline-offset-4 decoration-gold/30 hover:decoration-gold"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Register;
