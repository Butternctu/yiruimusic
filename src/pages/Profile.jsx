import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Save, Lock, Check, ArrowLeft, Mail, Phone, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatPhoneNumber } from '../data/bookingData';
import SEO from '../components/SEO';

const Profile = () => {
  const { user, userProfile, updateUserProfile, changePassword } = useAuth();

  const [formData, setFormData] = useState({
    displayName: userProfile?.displayName || user?.displayName || '',
    phone: userProfile?.phone || '',
    bio: userProfile?.bio || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const getInitials = () => {
    const name = formData.displayName || 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const memberSince = userProfile?.createdAt?.toDate
    ? formatDate(userProfile.createdAt.toDate())
    : '—';

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    if (name === 'phone') {
      formattedValue = formatPhoneNumber(value);
    }
    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    setSaved(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!formData.displayName.trim()) {
      setProfileError('Name is required.');
      return;
    }
    setSaving(true);
    setProfileError('');
    try {
      await updateUserProfile({
        displayName: formData.displayName.trim(),
        phone: formData.phone.trim(),
        bio: formData.bio.trim(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setProfileError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setPasswordSaved(false);
    setPasswordError('');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setPasswordError('Please fill in all password fields.');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordSaved(true);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch (err) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setPasswordError('Current password is incorrect.');
      } else {
        setPasswordError('Failed to change password. Please try again.');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const inputClass =
    'w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-gold placeholder-gray-600 focus:outline-none focus:border-gold/50 focus:bg-white/10 transition-all [&:-webkit-autofill]:[-webkit-text-fill-color:#C5A059] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#0a0a0a_inset]';

  return (
    <>
      <SEO title="Profile | Dr. Yirui Li" url="/profile" />
      <section className="min-h-screen bg-dark-900 pt-36 pb-12 px-6 md:px-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(197,160,89,0.04)_0%,transparent_60%)] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Header & Back Button */}
          <div className="flex items-center space-x-4 mb-12 animate-fadeInUp">
            <Link to="/dashboard" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-gold/30 transition-all duration-300">
              <ArrowLeft className="w-4 h-4 text-gray-400" />
            </Link>
            <div>
              <h1 className="font-serif text-2xl md:text-3xl text-white tracking-wide">Account Settings</h1>
              <p className="text-gray-500 text-[10px] tracking-[0.2em] uppercase mt-1">Manage your personal information and security</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Sidebar: Profile Overview */}
            <div className="lg:col-span-4 space-y-6 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
              <div className="glass-card rounded-sm border border-white/[0.06] p-8 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(197,160,89,0.1)]">
                    <span className="text-gold font-serif text-3xl">{getInitials()}</span>
                  </div>
                  <h2 className="font-serif text-xl text-white mb-1">{formData.displayName || 'Member'}</h2>
                  <p className="text-gray-500 text-sm mb-6">{user?.email}</p>
                  
                  <div className="space-y-4 pt-6 border-t border-white/[0.06] text-left">
                    <div className="flex items-center space-x-3 text-xs">
                      <Mail className="w-3.5 h-3.5 text-gold/60" />
                      <span className="text-gray-400 truncate">{user?.email}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs">
                      <Phone className="w-3.5 h-3.5 text-gold/60" />
                      <span className="text-gray-400">{formData.phone || 'No phone added'}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs">
                      <Calendar className="w-3.5 h-3.5 text-gold/60" />
                      <span className="text-gray-400">Joined {memberSince}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-gold/5 border border-gold/10 rounded-sm">
                <p className="text-[10px] uppercase tracking-widest text-gold/80 mb-2 font-bold italic">Member Note</p>
                <p className="text-xs text-gray-400 leading-relaxed italic">
                  Keep your information up to date to receive session reminders and personalized repertoire suggestions.
                </p>
              </div>
            </div>

            {/* Right Side: Forms */}
            <div className="lg:col-span-8 space-y-8 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
              
              {/* Personal Info Card */}
              <div className="glass-card rounded-sm border border-white/[0.06] p-8">
                <h3 className="font-serif text-lg text-white mb-8 flex items-center space-x-3">
                  <User className="w-5 h-5 text-gold" />
                  <span>Personal Details</span>
                </h3>
                
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="prof-name" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Full Name</label>
                      <input type="text" id="prof-name" name="displayName" value={formData.displayName} onChange={handleProfileChange} className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="prof-phone" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Phone Number</label>
                      <input type="tel" id="prof-phone" name="phone" value={formData.phone} onChange={handleProfileChange} className={inputClass} placeholder="(555) 000-0000" />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="prof-bio" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Short Bio</label>
                    <textarea id="prof-bio" name="bio" rows="4" value={formData.bio} onChange={handleProfileChange} className={`${inputClass} resize-none custom-scrollbar`} placeholder="Briefly describe your musical journey..." />
                  </div>

                  {profileError && <p className="text-[11px] text-[#d9736c] tracking-wider uppercase">{profileError}</p>}

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className={`min-w-[160px] inline-flex items-center justify-center space-x-2 border px-8 py-3.5 text-xs uppercase tracking-widest transition-all duration-300 ${
                        saved ? 'border-green-500/50 text-green-500 bg-green-500/5' : saving ? 'border-gold bg-gold/70 text-dark-900 cursor-wait' : 'border-gold text-gold hover:bg-gold hover:text-dark-900 shadow-[0_4_15px_rgba(197,160,89,0.1)]'
                      }`}
                    >
                      {saved ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Saved Successfully</span>
                        </>
                      ) : saving ? (
                        <span>Saving Changes...</span>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Profile</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Security Card */}
              <div className="glass-card rounded-sm border border-white/[0.06] p-8">
                <h3 className="font-serif text-lg text-white mb-8 flex items-center space-x-3">
                  <Lock className="w-5 h-5 text-gold" />
                  <span>Account Security</span>
                </h3>

                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div>
                    <label htmlFor="current-pw" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Current Password</label>
                    <input type="password" id="current-pw" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} className={inputClass} placeholder="••••••••" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="new-pw" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">New Password</label>
                      <input type="password" id="new-pw" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className={inputClass} placeholder="••••••••" />
                    </div>
                    <div>
                      <label htmlFor="confirm-pw" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Confirm Password</label>
                      <input type="password" id="confirm-pw" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} className={inputClass} placeholder="••••••••" />
                    </div>
                  </div>

                  {passwordError && <p className="text-[11px] text-[#d9736c] tracking-wider uppercase">{passwordError}</p>}

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={changingPassword}
                      className={`min-w-[160px] inline-flex items-center justify-center space-x-2 border px-8 py-3.5 text-xs uppercase tracking-widest transition-all duration-300 ${
                        passwordSaved ? 'border-green-500/50 text-green-500 bg-green-500/5' : changingPassword ? 'border-gold bg-gold/70 text-dark-900 cursor-wait' : 'border-white/20 text-white hover:border-gold hover:text-gold'
                      }`}
                    >
                      {passwordSaved ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Password Updated</span>
                        </>
                      ) : changingPassword ? (
                        <span>Updating...</span>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Update Password</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Profile;
