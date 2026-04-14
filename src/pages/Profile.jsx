import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Save, Lock, Check, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatPhoneNumber } from '../data/bookingData';
import SEO from '../components/SEO';

const Profile = () => {
  const { user, userProfile, updateUserProfile, changePassword } = useAuth();
  const navigate = useNavigate();

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
    'w-full bg-transparent border-b border-white/20 py-3 text-gold placeholder-gray-600 focus:outline-none focus:border-gold transition-colors [&:-webkit-autofill]:[-webkit-text-fill-color:#C5A059] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#0a0a0a_inset]';

  return (
    <>
      <SEO title="Profile | Dr. Yirui Li" url="/profile" />
      <section className="min-h-screen bg-dark-900 pt-36 pb-16 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(197,160,89,0.03)_0%,transparent_70%)] pointer-events-none" />

        <div className="max-w-2xl mx-auto relative z-10">
          {/* Header */}
          <div className="mb-10 animate-fadeInUp">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center space-x-2 text-gray-500 hover:text-gold text-xs uppercase tracking-widest transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <h1 className="font-serif text-2xl md:text-3xl text-white tracking-wide">Profile</h1>
          </div>

          {/* Avatar + basic info */}
          <div className="flex items-center space-x-5 mb-12 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30 flex items-center justify-center flex-shrink-0">
              <span className="text-gold font-serif text-2xl">{getInitials()}</span>
            </div>
            <div>
              <p className="text-white font-serif text-xl">{formData.displayName || 'Member'}</p>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <p className="text-gray-600 text-xs mt-1">Member since {memberSince}</p>
            </div>
          </div>

          {/* Profile form */}
          <form onSubmit={handleSaveProfile} className="mb-16 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
            <h2 className="font-serif text-lg text-white mb-6 flex items-center space-x-2">
              <User className="w-5 h-5 text-gold" />
              <span>Personal Information</span>
            </h2>

            <div className="space-y-8 mb-8">
              <div>
                <label htmlFor="prof-name" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  id="prof-name"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleProfileChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="prof-phone" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  id="prof-phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleProfileChange}
                  className={inputClass}
                  placeholder="(555) 000-0000"
                />
              </div>
              <div>
                <label htmlFor="prof-bio" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                  Bio
                </label>
                <textarea
                  id="prof-bio"
                  name="bio"
                  rows="3"
                  value={formData.bio}
                  onChange={handleProfileChange}
                  className={`${inputClass} resize-none custom-scrollbar`}
                  placeholder="Tell us a little about yourself..."
                />
              </div>
            </div>

            {profileError && (
              <p className="text-[11px] text-[#d9736c] tracking-wider uppercase mb-4">{profileError}</p>
            )}

            <button
              type="submit"
              disabled={saving}
              className={`inline-flex items-center space-x-2 border px-8 py-3 text-xs uppercase tracking-widest transition-all duration-300 ${
                saved
                  ? 'border-gold text-gold bg-gold/5'
                  : saving
                    ? 'border-gold bg-gold/70 text-dark-900 cursor-wait'
                    : 'border-gold text-gold hover:bg-gold hover:text-dark-900'
              }`}
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved</span>
                </>
              ) : saving ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </form>

          {/* Change Password */}
          <div className="border-t border-white/[0.06] pt-12 animate-fadeInUp" style={{ animationDelay: '300ms' }}>
            <h2 className="font-serif text-lg text-white mb-6 flex items-center space-x-2">
              <Lock className="w-5 h-5 text-gold" />
              <span>Change Password</span>
            </h2>

            <form onSubmit={handleChangePassword} className="space-y-8">
              <div>
                <label htmlFor="current-pw" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  id="current-pw"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="new-pw" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="new-pw"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={inputClass}
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label htmlFor="confirm-pw" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirm-pw"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={inputClass}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {passwordError && (
                <p className="text-[11px] text-[#d9736c] tracking-wider uppercase">{passwordError}</p>
              )}

              <button
                type="submit"
                disabled={changingPassword}
                className={`inline-flex items-center space-x-2 border px-8 py-3 text-xs uppercase tracking-widest transition-all duration-300 ${
                  passwordSaved
                    ? 'border-gold text-gold bg-gold/5'
                    : changingPassword
                      ? 'border-gold bg-gold/70 text-dark-900 cursor-wait'
                      : 'border-gold text-gold hover:bg-gold hover:text-dark-900'
                }`}
              >
                {passwordSaved ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Password Changed</span>
                  </>
                ) : changingPassword ? (
                  <span>Changing...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default Profile;
