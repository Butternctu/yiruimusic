import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, ChevronDown, Check, Clock } from 'lucide-react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const Contact = () => {
  useIntersectionObserver();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState('Performance Booking');
  const [copyStatus, setCopyStatus] = useState('harpist11');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [shakeError, setShakeError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [cooldownTime, setCooldownTime] = useState(0);
  const dropdownRef = useRef(null);

  // Check for cooldown on mount and set up timer
  useEffect(() => {
    const checkCooldown = () => {
      const storedTime = localStorage.getItem('yirui_form_cooldown');
      if (storedTime) {
        const remaining = parseInt(storedTime, 10) - Date.now();
        if (remaining > 0) {
          setCooldownTime(Math.ceil(remaining / 1000));
        } else {
          localStorage.removeItem('yirui_form_cooldown');
          setCooldownTime(0);
        }
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const inquiryOptions = [
    'Performance Booking',
    'Private Lesson',
    'Masterclass / Guest Lecture',
    'Media / Press',
    'Prospective Student (SHSU)',
    'General Questions'
  ];

  const handleCopyWeChat = async () => {
    try {
      await navigator.clipboard.writeText('harpist11');
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus('harpist11'), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const selectOption = (option) => {
    setSelectedInquiry(option);
    setDropdownOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check cooldown
    if (cooldownTime > 0) {
      setSubmitError(`Please wait ${formatTime(cooldownTime)} before sending another inquiry.`);
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      return;
    }

    // Honeypot check (hidden field)
    const honeypot = e.target.elements._honey?.value;
    if (honeypot) {
      // Bot detected, silently "succeed"
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 5000);
      return;
    }

    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Please provide your full name.';
    if (!formData.email.trim()) {
      newErrors.email = 'Please provide an email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email address.';
    }
    if (!formData.message.trim()) newErrors.message = 'Please include a message for your inquiry.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    // Prepare data for FormSubmit
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('email', formData.email);
    submitData.append('inquiry_type', selectedInquiry);
    submitData.append('message', formData.message);
    submitData.append('_subject', 'New Inquiry from Dr. Yirui Li Portfolio');
    submitData.append('_captcha', 'false');

    // Make AJAX request to FormSubmit
    fetch('https://formsubmit.co/ajax/liyiyi0411@gmail.com', {
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      },
      body: submitData
    })
      .then(response => response.json())
      .then(data => {
        setIsSubmitting(false);

        const isSuccess = data.success === 'true' || data.success === true;
        const needsActivation = data.message && data.message.toLowerCase().includes('activation');

        if (isSuccess || needsActivation) {
          setIsSuccess(true);
          setFormData({ name: '', email: '', message: '' });

          // Set 3 minute cooldown
          const cooldownEnd = Date.now() + 3 * 60 * 1000;
          localStorage.setItem('yirui_form_cooldown', cooldownEnd.toString());
          setCooldownTime(3 * 60);

          // Auto-hide success message after 5 seconds
          setTimeout(() => setIsSuccess(false), 5000);
        } else {
          setSubmitError(data.message || 'Something went wrong. Please try again later.');
        }
      })
      .catch(error => {
        setIsSubmitting(false);
        setSubmitError('Failed to send message. Please try again later.');
        console.error('FormSubmit Error:', error);
      });
  };

  return (
    <section id="contact" className="py-32 bg-dark-800 relative border-t border-white/5">
      <div className="max-w-4xl mx-auto px-6 md:px-12 fade-in-section relative z-10">
        <div className="text-center mb-16">
          <h3 className="text-gold uppercase tracking-[0.2em] text-xs mb-4">Connect</h3>
          <h2 className="font-serif text-4xl text-white tracking-wide">Inquiries & Booking</h2>
          <div className="h-px w-24 bg-gold mx-auto mt-8 mb-6 opacity-50"></div>

          <div className="inline-flex items-center space-x-3 px-5 py-2 mt-2 rounded-full border border-white/10 bg-dark-900 shadow-lg">
            <MessageSquare className="w-4 h-4 text-gold opacity-80" />
            <span className="text-gray-400 font-light text-[11px] tracking-[0.15em] uppercase">
              Direct WeChat:
              <span
                className="text-gold font-medium cursor-pointer transition-all duration-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(197,160,89,0.8)] ml-1"
                title="Click to copy"
                onClick={handleCopyWeChat}
              >
                {copyStatus}
              </span>
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12 relative z-10">
          {/* Honeypot field for bot protection */}
          <input type="text" name="_honey" style={{ display: 'none' }} tabIndex="-1" autoComplete="off" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
            <div className="relative group">
              <label htmlFor="name" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                className={`w-full bg-transparent border-b py-3 text-gold placeholder-gray-600 focus:outline-none focus:ring-0 transition-colors [&:-webkit-autofill]:[-webkit-text-fill-color:#C5A059] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#111111_inset] ${errors.name ? 'border-[#d9736c]/50' : 'border-white/20 focus:border-gold'}`}
                placeholder="Yirui Li"
              />
              {errors.name && (
                <p className={`absolute -bottom-6 left-0 text-[10px] text-[#d9736c] tracking-wider uppercase ${shakeError ? 'animate-error-shake' : 'animate-error-pulse'}`}>
                  {errors.name}
                </p>
              )}
            </div>
            <div className="relative group">
              <label htmlFor="email" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                inputMode="email"
                className={`w-full bg-transparent border-b py-3 text-gold placeholder-gray-600 focus:outline-none focus:ring-0 transition-colors [&:-webkit-autofill]:[-webkit-text-fill-color:#C5A059] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#111111_inset] ${errors.email ? 'border-[#d9736c]/50' : 'border-white/20 focus:border-gold'}`}
                placeholder="email@example.com"
              />
              {errors.email && (
                <p className={`absolute -bottom-6 left-0 text-[10px] text-[#d9736c] tracking-wider uppercase ${shakeError ? 'animate-error-shake' : 'animate-error-pulse'}`}>
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          <div className="relative group" ref={dropdownRef}>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Inquiry Type</label>
            <input type="hidden" name="inquiry_type" value={selectedInquiry} />

            <div
              className={`w-full bg-transparent border-b py-3 focus:outline-none transition-colors cursor-pointer flex justify-between items-center relative z-20 ${dropdownOpen ? 'border-gold' : 'border-white/20 hover:border-white/50'}`}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span className={selectedInquiry ? 'text-gold' : 'text-gray-600'}>{selectedInquiry}</span>
              <ChevronDown className={`w-4 h-4 text-gold transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            <div className={`absolute left-0 top-full w-full mt-2 bg-dark-900 border border-white/10 shadow-2xl transition-all duration-300 transform z-30 ${dropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
              {inquiryOptions.map((option, index) => (
                <div
                  key={index}
                  className={`px-6 py-3 cursor-pointer transition-colors border-b border-white/5 last:border-0 flex justify-between items-center ${selectedInquiry === option ? 'bg-[#1a1a1a] text-gold' : 'text-gray-400 hover:bg-[#151515] hover:text-white'}`}
                  onClick={() => selectOption(option)}
                >
                  <span className={selectedInquiry === option ? 'font-medium' : 'font-light'}>{option}</span>
                  {selectedInquiry === option && <Check className="w-4 h-4 text-gold" />}
                </div>
              ))}
            </div>
          </div>

          <div className="relative group">
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="4"
              className={`w-full bg-transparent border-b py-3 text-gold placeholder-gray-600 focus:outline-none focus:ring-0 transition-colors resize-none custom-scrollbar ${errors.message ? 'border-[#d9736c]/50' : 'border-white/20 focus:border-gold'}`}
              placeholder="Please share details about your inquiry, potential dates, and location..."
            ></textarea>
            {errors.message && (
              <p className={`absolute -bottom-[22px] left-0 text-[10px] text-[#d9736c] tracking-wider uppercase ${shakeError ? 'animate-error-shake' : 'animate-error-pulse'}`}>
                {errors.message}
              </p>
            )}
          </div>

          <div className="text-center pt-8 relative">
            {isSuccess ? (
              <div className="inline-flex border border-gold text-gold bg-gold/5 px-10 py-4 tracking-[0.2em] uppercase text-xs animate-error-pulse items-center justify-center space-x-3">
                <Check className="w-4 h-4" />
                <span>INQUIRY SENT SUCCESSFULLY</span>
              </div>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || cooldownTime > 0}
                className={`inline-flex items-center justify-center space-x-3 border px-10 py-4 tracking-[0.2em] uppercase text-xs transition-all duration-500 min-w-[300px] ${isSubmitting ? 'border-gold text-dark-900 bg-gold/70 cursor-wait'
                  : cooldownTime > 0 ? 'border-white/10 text-gray-500 bg-transparent cursor-not-allowed hover:bg-white/5'
                    : 'border-gold text-gold hover:bg-gold hover:text-dark-900'
                  }`}
              >
                {isSubmitting ? (
                  <span>SENDING...</span>
                ) : cooldownTime > 0 ? (
                  <>
                    <Clock className="w-4 h-4 text-gold/50" />
                    <span>AVAILABLE IN <span className="text-gold tracking-[0.25em] ml-1">{formatTime(cooldownTime)}</span></span>
                  </>
                ) : (
                  <span>SUBMIT INQUIRY</span>
                )}
              </button>
            )}
            {submitError && (
              <p className={`absolute -bottom-8 left-0 right-0 text-[10px] text-[#d9736c] tracking-wider uppercase text-center ${shakeError ? 'animate-error-shake' : 'animate-error-pulse'}`}>
                {submitError}
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
};

export default Contact;
