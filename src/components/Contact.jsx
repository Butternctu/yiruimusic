import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, ChevronDown, Check, Clock, Mail } from "lucide-react";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard";
import { trackConversion, trackEvent } from "../lib/gtag.js";
import {
  CONTACT_EMAIL,
  CONTACT_WECHAT,
  FORM_RECIPIENT_EMAIL,
  RESPONSE_TIME,
} from "../data/contact";

const Contact = ({ inquiryType, onInquiryChange }) => {
  useIntersectionObserver();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { copied: emailCopied, copy: copyEmail } =
    useCopyToClipboard(CONTACT_EMAIL);
  const { copied: wechatCopied, copy: copyWeChat } =
    useCopyToClipboard(CONTACT_WECHAT);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [shakeError, setShakeError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [cooldownTime, setCooldownTime] = useState(0);
  const dropdownRef = useRef(null);
  const sectionRef = useRef(null);
  const hasStartedRef = useRef(false);

  // Check for cooldown on mount and set up timer
  useEffect(() => {
    const checkCooldown = () => {
      const storedTime = localStorage.getItem("yirui_form_cooldown");
      if (storedTime) {
        const remaining = parseInt(storedTime, 10) - Date.now();
        if (remaining > 0) {
          setCooldownTime(Math.ceil(remaining / 1000));
        } else {
          localStorage.removeItem("yirui_form_cooldown");
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Separates "never saw the form" from "saw it and did not fill it in".
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          trackEvent("view_contact_form");
          observer.disconnect();
        });
      },
      { threshold: 0.3 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const handleFormStart = () => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    trackEvent("form_start", { form_name: "contact" });
  };

  const inquiryOptions = [
    "Performance Booking",
    "Private Lesson",
    "Masterclass / Guest Lecture",
    "Media / Press",
    "Prospective Student (SHSU)",
    "General Questions",
  ];

  const handleCopyWeChat = () => {
    trackEvent("contact_click", { method: "wechat" });
    copyWeChat();
  };

  // Copies as well as opening the mail client, which is often unconfigured on
  // desktop and would otherwise leave the click doing nothing visible.
  const handleEmailClick = () => {
    trackEvent("contact_click", { method: "email" });
    copyEmail();
  };

  const selectOption = (option) => {
    onInquiryChange(option);
    setDropdownOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check cooldown
    if (cooldownTime > 0) {
      setSubmitError(
        `Please wait ${formatTime(cooldownTime)} before sending another inquiry.`,
      );
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      return;
    }

    // Honeypot check (hidden field)
    const honeypot = e.target.elements._honey?.value;
    if (honeypot) {
      // Bot detected, silently "succeed"
      setIsSuccess(true);
      return;
    }

    const newErrors = {};

    if (!formData.name.trim())
      newErrors.name = "Please provide your full name.";
    if (!formData.email.trim()) {
      newErrors.email = "Please provide an email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please provide a valid email address.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      trackEvent("form_error", {
        form_name: "contact",
        error_fields: Object.keys(newErrors).join(","),
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    // Prepare data for FormSubmit
    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("email", formData.email);
    submitData.append("phone", formData.phone || "Not provided");
    submitData.append("inquiry_type", inquiryType);
    submitData.append("message", formData.message || "(No message provided)");
    submitData.append("_subject", "New Inquiry from Dr. Yirui Li Portfolio");
    submitData.append("_captcha", "false");

    // Make AJAX request to FormSubmit
    fetch(`https://formsubmit.co/ajax/${FORM_RECIPIENT_EMAIL}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: submitData,
    })
      .then((response) => response.json())
      .then((data) => {
        setIsSubmitting(false);

        const isSuccess = data.success === "true" || data.success === true;
        const needsActivation =
          data.message && data.message.toLowerCase().includes("activation");

        if (isSuccess || needsActivation) {
          setIsSuccess(true);
          setFormData({ name: "", email: "", phone: "", message: "" });

          // Report the lead to Google Ads (no-op if tracking is not configured)
          trackConversion();
          trackEvent("generate_lead", {
            form_name: "contact",
            inquiry_type: inquiryType,
          });

          // Set 3 minute cooldown
          const cooldownEnd = Date.now() + 3 * 60 * 1000;
          localStorage.setItem("yirui_form_cooldown", cooldownEnd.toString());
          setCooldownTime(3 * 60);
        } else {
          setSubmitError(
            data.message || "Something went wrong. Please try again later.",
          );
        }
      })
      .catch((error) => {
        setIsSubmitting(false);
        setSubmitError("Failed to send message. Please try again later.");
        console.error("FormSubmit Error:", error);
      });
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="py-32 relative border-t border-white/5 overflow-hidden"
    >
      <div className="absolute inset-0 bg-dark-900 z-0"></div>
      {/* Premium ambient gold spotlight effect for the contact form */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] max-w-400 h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(197,160,89,0.02)_0%,transparent_70%)] z-0 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-6 md:px-12 fade-in-section relative z-10">
        <div className="text-center mb-16">
          <h3 className="text-gold uppercase tracking-[0.2em] text-xs mb-4">
            Connect
          </h3>
          <h2 className="font-serif text-4xl text-white tracking-wide">
            Inquiries & Booking
          </h2>
          <div className="h-px w-24 bg-gold mx-auto mt-8 mb-6 opacity-50"></div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              onClick={handleEmailClick}
              title="Click to copy"
              className="inline-flex items-center space-x-3 px-5 py-2 rounded-full border border-white/10 bg-dark-900 shadow-lg transition-colors duration-300 hover:border-gold/50"
            >
              <Mail className="w-4 h-4 text-gold opacity-80" />
              <span className="text-gold font-medium text-xs tracking-wide">
                {emailCopied ? "Copied!" : CONTACT_EMAIL}
              </span>
            </a>

            <div className="inline-flex items-center space-x-3 px-5 py-2 rounded-full border border-white/10 bg-dark-900 shadow-lg">
              <MessageSquare className="w-4 h-4 text-gold opacity-80" />
              <span className="text-gray-400 font-light text-[11px] tracking-[0.15em] uppercase">
                WeChat
              </span>
              <span
                className="text-gold font-medium text-xs tracking-wide cursor-pointer transition-all duration-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(197,160,89,0.8)]"
                title="Click to copy"
                onClick={handleCopyWeChat}
              >
                {wechatCopied ? "Copied!" : CONTACT_WECHAT}
              </span>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          onFocusCapture={handleFormStart}
          className="space-y-12 relative z-10 pb-12"
        >
          {/* Honeypot field for bot protection */}
          <input
            type="text"
            name="_honey"
            style={{ display: "none" }}
            tabIndex="-1"
            autoComplete="off"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
            <div className="relative group">
              <label
                htmlFor="name"
                className="block text-xs uppercase tracking-widest text-gray-500 mb-2"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                className={`w-full bg-transparent border-b py-3 text-gold placeholder-gray-600 focus:outline-none focus:ring-0 transition-colors [&:-webkit-autofill]:[-webkit-text-fill-color:#C5A059] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#111111_inset] ${errors.name ? "border-[#d9736c]/50" : "border-white/20 focus:border-gold"}`}
                placeholder="Yirui Li"
              />
              {errors.name && (
                <p
                  className={`absolute -bottom-6 left-0 text-[10px] text-[#d9736c] tracking-wider uppercase ${shakeError ? "animate-error-shake" : "animate-error-pulse"}`}
                >
                  {errors.name}
                </p>
              )}
            </div>
            <div className="relative group">
              <label
                htmlFor="email"
                className="block text-xs uppercase tracking-widest text-gray-500 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                inputMode="email"
                className={`w-full bg-transparent border-b py-3 text-gold placeholder-gray-600 focus:outline-none focus:ring-0 transition-colors [&:-webkit-autofill]:[-webkit-text-fill-color:#C5A059] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#111111_inset] ${errors.email ? "border-[#d9736c]/50" : "border-white/20 focus:border-gold"}`}
                placeholder="email@example.com"
              />
              {errors.email && (
                <p
                  className={`absolute -bottom-6 left-0 text-[10px] text-[#d9736c] tracking-wider uppercase ${shakeError ? "animate-error-shake" : "animate-error-pulse"}`}
                >
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
            <div className="relative group">
              <label
                htmlFor="phone"
                className="block text-xs uppercase tracking-widest text-gray-500 mb-2"
              >
                Phone <span className="text-gray-600">(Optional)</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                autoComplete="tel"
                inputMode="tel"
                className="w-full bg-transparent border-b border-white/20 py-3 text-gold placeholder-gray-600 focus:outline-none focus:ring-0 focus:border-gold transition-colors [&:-webkit-autofill]:[-webkit-text-fill-color:#C5A059] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#111111_inset]"
                placeholder="(713) 000-0000"
              />
            </div>

            <div className="relative group" ref={dropdownRef}>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                Inquiry Type
              </label>
              <input type="hidden" name="inquiry_type" value={inquiryType} />

              <div
                className={`w-full bg-transparent border-b py-3 focus:outline-none transition-colors cursor-pointer flex justify-between items-center relative z-20 ${dropdownOpen ? "border-gold" : "border-white/20 hover:border-white/50"}`}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span
                  className={inquiryType ? "text-gold" : "text-gray-600"}
                >
                  {inquiryType}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gold transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </div>

              <div
                className={`absolute left-0 top-full w-full mt-2 bg-dark-900 border border-white/10 shadow-2xl transition-all duration-300 transform z-30 ${dropdownOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"}`}
              >
                {inquiryOptions.map((option, index) => (
                  <div
                    key={index}
                    className={`px-6 py-3 cursor-pointer transition-colors border-b border-white/5 last:border-0 flex justify-between items-center ${inquiryType === option ? "bg-[#1a1a1a] text-gold" : "text-gray-400 hover:bg-[#151515] hover:text-white"}`}
                    onClick={() => selectOption(option)}
                  >
                    <span
                      className={
                        inquiryType === option
                          ? "font-medium"
                          : "font-light"
                      }
                    >
                      {option}
                    </span>
                    {inquiryType === option && (
                      <Check className="w-4 h-4 text-gold" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative group">
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
              Message <span className="text-gray-600">(Optional)</span>
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="4"
              className="w-full bg-transparent border-b border-white/20 py-3 text-gold placeholder-gray-600 focus:outline-none focus:ring-0 focus:border-gold transition-colors resize-none custom-scrollbar"
              placeholder="Anything helpful to know — dates, venue, or the student's age and experience."
            ></textarea>
          </div>

          <div className="text-center pt-8 relative">
            {isSuccess ? (
              <div className="max-w-md mx-auto border border-gold bg-gold/5 px-8 py-7">
                <div className="flex items-center justify-center space-x-3 text-gold tracking-[0.2em] uppercase text-xs mb-4">
                  <Check className="w-4 h-4" />
                  <span>Inquiry Sent</span>
                </div>
                <p className="text-gray-300 font-light text-sm leading-relaxed">
                  Thank you — your inquiry is on its way to Dr. Li, and you can
                  expect a personal reply {RESPONSE_TIME}.
                </p>
                <p className="text-gray-500 font-light text-xs leading-relaxed mt-4">
                  If it&rsquo;s time-sensitive, email{" "}
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    onClick={() =>
                      trackEvent("contact_click", {
                        method: "email",
                        location: "post_submit",
                      })
                    }
                    className="text-gold hover:text-white transition-colors"
                  >
                    {CONTACT_EMAIL}
                  </a>{" "}
                  directly.
                </p>
              </div>
            ) : (
              <>
                <p className="text-gray-500 font-light text-xs tracking-wide mb-6">
                  Dr. Li replies personally {RESPONSE_TIME}.
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting || cooldownTime > 0}
                  className={`inline-flex items-center justify-center space-x-3 border px-10 py-4 tracking-[0.2em] uppercase text-xs transition-all duration-500 min-w-[300px] ${
                    isSubmitting
                      ? "border-gold text-dark-900 bg-gold/70 cursor-wait"
                      : cooldownTime > 0
                        ? "border-white/10 text-gray-500 bg-transparent cursor-not-allowed hover:bg-white/5"
                        : "border-gold text-gold hover:bg-gold hover:text-dark-900"
                  }`}
                >
                  {isSubmitting ? (
                    <span>SENDING...</span>
                  ) : cooldownTime > 0 ? (
                    <>
                      <Clock className="w-4 h-4 text-gold/50" />
                      <span>
                        AVAILABLE IN{" "}
                        <span className="text-gold tracking-[0.25em] ml-1">
                          {formatTime(cooldownTime)}
                        </span>
                      </span>
                    </>
                  ) : (
                    <span>SUBMIT INQUIRY</span>
                  )}
                </button>
              </>
            )}
            {submitError && (
              <p
                className={`absolute -bottom-8 left-0 right-0 text-[10px] text-[#d9736c] tracking-wider uppercase text-center ${shakeError ? "animate-error-shake" : "animate-error-pulse"}`}
              >
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
