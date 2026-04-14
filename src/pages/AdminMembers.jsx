import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Search, Edit2, Trash2, ArrowLeft, Check, X, Mail, Phone, Calendar, Shield, ChevronDown } from 'lucide-react';
import { collection, query, getDocs, doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, auth } from '../firebase';
import { MEMBERSHIP_TIERS, formatDate, formatPhoneNumber } from '../data/bookingData';
import SEO from '../components/SEO';

const AdminMembers = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('list'); // list | create
  const [searchQuery, setSearchQuery] = useState('');

  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingId, setSavingId] = useState(null);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Create State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    tier: 'bronze',
    role: 'member',
  });
  const [creating, setCreating] = useState(false);
  const [createResult, setCreateResult] = useState('');

  // Dropdown State
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      // NOTE: requires an index on createdAt or just fetch all and sort client-side.
      // Easiest is to fetch all since "users" usually isn't huge.
      const q = query(collection(db, 'users'));
      const snap = await getDocs(q);
      const fetched = snap.docs
        .map(d => ({
          id: d.id,
          ...d.data(),
        }))
        .sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB - dateA; // Descending
        });
      setMembers(fetched);
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTierDetails = tierId => {
    return MEMBERSHIP_TIERS.find(t => t.id === tierId) || MEMBERSHIP_TIERS[0];
  };

  const getInitials = name => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // ── Search & Filter ──
  const filteredMembers = members.filter(m => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (m.displayName || '').toLowerCase().includes(q) || (m.email || '').toLowerCase().includes(q) || (m.phone || '').toLowerCase().includes(q);
  });

  // ── Inline Edit ──
  const startEdit = member => {
    setEditingId(member.id);
    setEditForm({
      displayName: member.displayName || '',
      phone: member.phone || '',
      membershipTier: member.membershipTier || 'bronze',
      role: member.role || 'member',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async memberId => {
    setSavingId(memberId);
    try {
      await updateDoc(doc(db, 'users', memberId), editForm);
      setMembers(prev => prev.map(m => (m.id === memberId ? { ...m, ...editForm } : m)));
      setEditingId(null);
    } catch (err) {
      console.error('Error saving member:', err);
      alert('Failed to save member details.');
    } finally {
      setSavingId(null);
    }
  };

  // ── Delete ──
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      // Delete the Firestore document
      await deleteDoc(doc(db, 'users', deleteTarget.id));
      setMembers(prev => prev.filter(m => m.id !== deleteTarget.id));
      setDeleteTarget(null);

      // Note: This does NOT delete the Firebase Auth user because only the Admin SDK
      // or the user themselves can do that. Explain this via UI if needed.
    } catch (err) {
      console.error('Error deleting member:', err);
      alert('Failed to delete member.');
    } finally {
      setDeleting(false);
    }
  };

  // ── Create User ──
  const handleCreateUser = async e => {
    e.preventDefault();
    if (!newUser.email || !newUser.password || !newUser.name) return;
    setCreating(true);
    setCreateResult({ type: '', message: '' });

    try {
      // 1. Initialize a secondary Firebase App to create the user without logging out the Admin
      const secondaryApp = initializeApp(auth.app.options, 'SecondaryApp');
      const secondaryAuth = getAuth(secondaryApp);

      const { user } = await createUserWithEmailAndPassword(secondaryAuth, newUser.email, newUser.password);

      // 2. Sign out the secondary app immediately so it doesn't linger
      await signOut(secondaryAuth);

      // 3. Create the user profile document in Firestore (using main App db)
      const profileData = {
        displayName: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        bio: '',
        role: newUser.role,
        membershipTier: newUser.tier,
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', user.uid), profileData);

      // Reset form on success
      setNewUser({ name: '', email: '', phone: '', password: '', tier: 'bronze', role: 'member' });
      setCreateResult({ type: 'success', message: 'User created successfully!' });

      // Refresh list
      fetchMembers();
    } catch (err) {
      console.error('Error creating user:', err);
      let message = 'Failed to create user.';
      if (err.code === 'auth/email-already-in-use') message = 'Email is already in use.';
      if (err.code === 'auth/weak-password') message = 'Password must be at least 6 characters.';
      setCreateResult({ type: 'error', message });
    } finally {
      setCreating(false);
    }
  };

  const inputClass =
    'w-full bg-transparent border-b border-white/20 py-2.5 text-gold placeholder-gray-600 focus:outline-none focus:border-gold transition-colors tracking-wide [&:-webkit-autofill]:[-webkit-text-fill-color:#C5A059] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#141414_inset]';
  const smallInputClass =
    'w-full bg-transparent border-b border-white/20 py-1 text-white text-sm focus:outline-none focus:border-gold transition-colors [&:-webkit-autofill]:[-webkit-text-fill-color:#fff] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#141414_inset]';

  return (
    <>
      <SEO title="Manage Members | Admin" url="/admin/members" />
      <section className="min-h-screen bg-dark-900 pt-36 pb-16 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(197,160,89,0.03)_0%,transparent_70%)] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header */}
          <div className="mb-10 animate-fadeInUp">
            <button
              onClick={() => navigate('/admin')}
              className="inline-flex items-center space-x-2 text-gray-500 hover:text-gold text-xs uppercase tracking-widest transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Admin Panel</span>
            </button>
            <h1 className="font-serif text-2xl md:text-3xl text-white tracking-wide">Manage Members</h1>
          </div>

          {/* View Tabs */}
          <div className="flex space-x-1 mb-8 border-b border-white/[0.06] animate-fadeInUp" style={{ animationDelay: '100ms' }}>
            <button
              onClick={() => setActiveView('list')}
              className={`flex items-center space-x-2 px-5 py-3 text-xs uppercase tracking-widest transition-all duration-300 border-b-2 -mb-px ${
                activeView === 'list' ? 'border-gold text-gold' : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>All Members</span>
            </button>
            <button
              onClick={() => setActiveView('create')}
              className={`flex items-center space-x-2 px-5 py-3 text-xs uppercase tracking-widest transition-all duration-300 border-b-2 -mb-px ${
                activeView === 'create' ? 'border-gold text-gold' : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          </div>

          {activeView === 'list' && (
            <div className="animate-fadeInUp" style={{ animationDelay: '200ms' }}>
              {/* Search Bar */}
              <div className="mb-6 relative max-w-md">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-b border-white/20 py-3 pl-8 text-white focus:outline-none focus:border-gold transition-colors text-sm"
                />
              </div>

              {loading ? (
                <div className="flex justify-center py-16">
                  <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="text-center py-16 glass-card rounded-sm border border-white/[0.06]">
                  <Users className="w-10 h-10 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">No members found</p>
                </div>
              ) : (
                <div className="overflow-x-auto pb-48">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="pb-3 text-xs uppercase tracking-widest text-gray-500 font-normal">Member</th>
                        <th className="pb-3 text-xs uppercase tracking-widest text-gray-500 font-normal">Contact</th>
                        <th className="pb-3 text-xs uppercase tracking-widest text-gray-500 font-normal">Tier</th>
                        <th className="pb-3 text-xs uppercase tracking-widest text-gray-500 font-normal hidden md:table-cell">Joined</th>
                        <th className="pb-3 text-xs uppercase tracking-widest text-gray-500 font-normal text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {filteredMembers.map(member => {
                        const isEditing = editingId === member.id;

                        if (isEditing) {
                          return (
                            <tr key={`edit-${member.id}`} className="bg-white/[0.02] relative z-20">
                              <td colSpan="5" className="p-0 border-b border-white/[0.03]">
                                <div className="p-6 my-2 mx-1 rounded-sm border border-gold/30 bg-dark-800 shadow-2xl relative animate-fadeInUp">
                                  <div className="flex items-center space-x-3 mb-6">
                                    <Edit2 className="w-4 h-4 text-gold" />
                                    <h4 className="text-white font-serif tracking-wide text-lg">Edit Profile: {member.displayName}</h4>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {/* Name Input */}
                                    <div>
                                      <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Display Name</label>
                                      <input
                                        type="text"
                                        value={editForm.displayName}
                                        onChange={e => setEditForm(p => ({ ...p, displayName: e.target.value }))}
                                        className="w-full bg-transparent border-b border-white/20 py-2 text-sm text-white focus:outline-none focus:border-gold transition-colors [&:-webkit-autofill]:[-webkit-text-fill-color:#fff] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#141414_inset]"
                                        placeholder="Full Name"
                                      />
                                    </div>

                                    {/* Phone Input */}
                                    <div>
                                      <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                                        Phone (<span className="normal-case">Optional</span>)
                                      </label>
                                      <input
                                        type="tel"
                                        value={editForm.phone}
                                        onChange={e => setEditForm(p => ({ ...p, phone: formatPhoneNumber(e.target.value) }))}
                                        className="w-full bg-transparent border-b border-white/20 py-2 text-sm text-white focus:outline-none focus:border-gold transition-colors [&:-webkit-autofill]:[-webkit-text-fill-color:#fff] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#141414_inset]"
                                        placeholder="(555) 000-0000"
                                      />
                                    </div>

                                    {/* Role Select */}
                                    <div ref={dropdownRef}>
                                      <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">System Role</label>
                                      <div className="relative">
                                        <div
                                          className={`w-full bg-transparent border-b py-2 focus:outline-none transition-colors cursor-pointer flex justify-between items-center z-10 ${openDropdown === 'edit-role-' + member.id ? 'border-gold' : 'border-white/20 hover:border-white/50'}`}
                                          onClick={() => setOpenDropdown(openDropdown === 'edit-role-' + member.id ? null : 'edit-role-' + member.id)}
                                        >
                                          <span className="text-white text-sm capitalize">{editForm.role}</span>
                                          <ChevronDown
                                            className={`w-4 h-4 text-gold transition-transform duration-300 ${openDropdown === 'edit-role-' + member.id ? 'rotate-180' : ''}`}
                                          />
                                        </div>

                                        <div
                                          className={`absolute left-0 top-[calc(100%+4px)] w-full bg-dark-800 border border-white/10 shadow-2xl transition-all duration-300 transform z-50 ${openDropdown === 'edit-role-' + member.id ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}
                                        >
                                          {['member', 'admin'].map(opt => (
                                            <div
                                              key={opt}
                                              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors border-b border-white/5 last:border-0 flex justify-between items-center ${editForm.role === opt ? 'bg-white/[0.04] text-gold' : 'text-gray-400 hover:bg-white/[0.02] hover:text-white'}`}
                                              onClick={() => {
                                                setEditForm(p => ({ ...p, role: opt }));
                                                setOpenDropdown(null);
                                              }}
                                            >
                                              <span className="capitalize">{opt}</span>
                                              {editForm.role === opt && <Check className="w-4 h-4 text-gold" />}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Tier Select */}
                                    <div ref={dropdownRef}>
                                      <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Membership Tier</label>
                                      <div className="relative">
                                        <div
                                          className={`w-full bg-transparent border-b py-2 focus:outline-none transition-colors cursor-pointer flex justify-between items-center z-10 ${openDropdown === 'edit-tier-' + member.id ? 'border-gold' : 'border-white/20 hover:border-white/50'}`}
                                          onClick={() => setOpenDropdown(openDropdown === 'edit-tier-' + member.id ? null : 'edit-tier-' + member.id)}
                                        >
                                          <span className="text-gold text-sm uppercase tracking-wider">{getTierDetails(editForm.membershipTier).name}</span>
                                          <ChevronDown
                                            className={`w-4 h-4 text-gold transition-transform duration-300 ${openDropdown === 'edit-tier-' + member.id ? 'rotate-180' : ''}`}
                                          />
                                        </div>

                                        <div
                                          className={`absolute left-0 top-[calc(100%+4px)] w-full bg-dark-800 border border-white/10 shadow-2xl transition-all duration-300 transform z-50 ${openDropdown === 'edit-tier-' + member.id ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}
                                        >
                                          {MEMBERSHIP_TIERS.map(t => (
                                            <div
                                              key={t.id}
                                              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors border-b border-white/5 last:border-0 flex justify-between items-center uppercase tracking-wider ${editForm.membershipTier === t.id ? 'bg-white/[0.04] text-gold' : 'text-gray-400 hover:bg-white/[0.02] hover:text-white'}`}
                                              onClick={() => {
                                                setEditForm(p => ({ ...p, membershipTier: t.id }));
                                                setOpenDropdown(null);
                                              }}
                                            >
                                              <span>{t.name}</span>
                                              {editForm.membershipTier === t.id && <Check className="w-4 h-4 text-gold" />}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-white/[0.06]">
                                    <button
                                      onClick={cancelEdit}
                                      className="px-6 py-2 text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => saveEdit(member.id)}
                                      disabled={savingId === member.id}
                                      className="px-6 py-2 border border-gold/50 text-xs uppercase tracking-widest bg-gold/10 text-gold hover:bg-gold hover:text-dark-900 transition-all duration-300 disabled:opacity-50 flex items-center space-x-2"
                                    >
                                      {savingId === member.id ? (
                                        <>
                                          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                          <span>Saving...</span>
                                        </>
                                      ) : (
                                        <>
                                          <Check className="w-3 h-3" />
                                          <span>Save Changes</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        }

                        // Normal View
                        const tier = getTierDetails(member.membershipTier || 'bronze');
                        const joinedDate = member.createdAt?.toDate ? formatDate(member.createdAt.toDate()) : 'Unknown';

                        return (
                          <tr key={member.id} className="group hover:bg-white/[0.01] transition-colors">
                            {/* Member Name */}
                            <td className="py-4 align-middle pr-4">
                              <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-full border ${tier.borderColor} ${tier.bgColor} flex items-center justify-center shrink-0`}>
                                  <span className={`text-xs font-serif ${tier.textColor}`}>{getInitials(member.displayName)}</span>
                                </div>
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-white text-sm">{member.displayName || 'No Name'}</span>
                                    {member.role === 'admin' && <Shield className="w-3 h-3 text-gold" title="Admin User" />}
                                  </div>
                                  <span className="text-gray-500 text-[11px] hidden sm:inline-block font-mono tracking-wider">ID: {member.id}</span>
                                </div>
                              </div>
                            </td>

                            {/* Contact Info */}
                            <td className="py-4 align-middle pr-4">
                              <div className="flex flex-col space-y-1.5">
                                <div className="flex items-center space-x-2 text-gray-400">
                                  <Mail className="w-3 h-3" />
                                  <span className="text-sm">{member.email}</span>
                                </div>
                                {member.phone && (
                                  <div className="flex items-center space-x-2 text-gray-500">
                                    <Phone className="w-3 h-3" />
                                    <span className="text-xs">{member.phone}</span>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Tier Badge */}
                            <td className="py-4 align-middle pr-4">
                              <span
                                className={`inline-block px-2.5 py-1 text-[10px] uppercase tracking-widest rounded-sm border ${tier.borderColor} ${tier.textColor} ${tier.bgColor}`}
                              >
                                {tier.name}
                              </span>
                            </td>

                            {/* Joined Date */}
                            <td className="py-4 align-middle hidden md:table-cell pr-4">
                              <div className="flex items-center space-x-2 text-gray-500 w-max">
                                <Calendar className="w-3 h-3" />
                                <span className="text-xs">{joinedDate}</span>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="py-4 align-middle text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => startEdit(member)}
                                  className="p-1.5 text-gray-500 hover:text-gold transition-colors"
                                  title="Edit Profile"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                {/* Prevent admin from deleting themselves! */}
                                {auth.currentUser?.uid !== member.id && (
                                  <button
                                    onClick={() => setDeleteTarget(member)}
                                    className="p-1.5 text-gray-500 hover:text-[#d9736c] transition-colors"
                                    title="Delete Data"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeView === 'create' && (
            <div className="max-w-4xl mx-auto animate-fadeInUp" style={{ animationDelay: '200ms' }}>
              <div className="p-8 md:p-10 rounded-sm border border-gold/20 bg-dark-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-2">
                    <UserPlus className="w-5 h-5 text-gold" />
                    <h3 className="font-serif text-xl text-white tracking-wide">Create New Member</h3>
                  </div>
                  <p className="text-gray-400 text-xs tracking-wider mb-10">
                    Manually generate a new user profile. This will create both a Firebase Auth account and a profile data document.
                  </p>

                  <form onSubmit={handleCreateUser} className="space-y-8" autoComplete="off">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                      {/* Full Name */}
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={newUser.name}
                          onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))}
                          autoComplete="off"
                          className={inputClass}
                          required
                          placeholder="John Doe"
                        />
                      </div>

                      {/* Email Address */}
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Email Address</label>
                        <input
                          type="email"
                          value={newUser.email}
                          onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))}
                          autoComplete="new-password"
                          className={inputClass}
                          required
                          placeholder="john@example.com"
                        />
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Security Password</label>
                        <input
                          type="password"
                          value={newUser.password}
                          onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))}
                          autoComplete="new-password"
                          className={inputClass}
                          placeholder="Min. 6 characters"
                          required
                          minLength={6}
                        />
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                          Phone Number (<span className="normal-case">Optional</span>)
                        </label>
                        <input
                          type="tel"
                          value={newUser.phone}
                          onChange={e => setNewUser(p => ({ ...p, phone: formatPhoneNumber(e.target.value) }))}
                          autoComplete="off"
                          className={inputClass}
                          placeholder="(555) 000-0000"
                        />
                      </div>

                      {/* Role & Tier grid inside flex spacing */}
                      <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8" ref={dropdownRef}>
                        {/* Member Role dropdown */}
                        <div className="relative">
                          <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">System Role</label>
                          <input type="hidden" name="role" value={newUser.role} />

                          <div
                            className={`w-full bg-transparent border-b py-3 focus:outline-none transition-colors cursor-pointer flex justify-between items-center relative z-20 ${openDropdown === 'create-role' ? 'border-gold' : 'border-white/20 hover:border-white/50'}`}
                            onClick={() => setOpenDropdown(openDropdown === 'create-role' ? null : 'create-role')}
                          >
                            <span className={newUser.role ? 'text-white capitalize text-sm' : 'text-gray-600 text-sm'}>{newUser.role}</span>
                            <ChevronDown
                              className={`w-4 h-4 text-gold transition-transform duration-300 ${openDropdown === 'create-role' ? 'rotate-180' : ''}`}
                            />
                          </div>

                          <div
                            className={`absolute left-0 top-full w-full mt-2 bg-dark-900 border border-white/10 shadow-2xl transition-all duration-300 transform z-30 ${openDropdown === 'create-role' ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}
                          >
                            {['member', 'admin'].map(opt => (
                              <div
                                key={opt}
                                className={`px-6 py-3 text-sm cursor-pointer transition-colors border-b border-white/5 last:border-0 flex justify-between items-center capitalize ${newUser.role === opt ? 'bg-[#1a1a1a] text-gold' : 'text-gray-400 hover:bg-[#151515] hover:text-white'}`}
                                onClick={() => {
                                  setNewUser(p => ({ ...p, role: opt }));
                                  setOpenDropdown(null);
                                }}
                              >
                                <span className={newUser.role === opt ? 'font-medium' : 'font-light'}>{opt}</span>
                                {newUser.role === opt && <Check className="w-4 h-4 text-gold" />}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Membership Tier Dropdown */}
                        <div className="relative">
                          <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Membership Tier</label>
                          <input type="hidden" name="tier" value={newUser.tier} />

                          <div
                            className={`w-full bg-transparent border-b py-3 focus:outline-none transition-colors cursor-pointer flex justify-between items-center relative z-20 ${openDropdown === 'create-tier' ? 'border-gold' : 'border-white/20 hover:border-white/50'}`}
                            onClick={() => setOpenDropdown(openDropdown === 'create-tier' ? null : 'create-tier')}
                          >
                            <span className={newUser.tier ? 'text-gold text-sm tracking-wider uppercase' : 'text-gray-600 text-sm tracking-wider uppercase'}>
                              {getTierDetails(newUser.tier).name}
                            </span>
                            <ChevronDown
                              className={`w-4 h-4 text-gold transition-transform duration-300 ${openDropdown === 'create-tier' ? 'rotate-180' : ''}`}
                            />
                          </div>

                          <div
                            className={`absolute left-0 top-full w-full mt-2 bg-dark-900 border border-white/10 shadow-2xl transition-all duration-300 transform z-30 ${openDropdown === 'create-tier' ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}
                          >
                            {MEMBERSHIP_TIERS.map(t => (
                              <div
                                key={t.id}
                                className={`px-6 py-3 text-sm cursor-pointer transition-colors border-b border-white/5 last:border-0 flex justify-between items-center ${newUser.tier === t.id ? 'bg-[#1a1a1a] text-gold' : 'text-gray-400 hover:bg-[#151515] hover:text-white'}`}
                                onClick={() => {
                                  setNewUser(p => ({ ...p, tier: t.id }));
                                  setOpenDropdown(null);
                                }}
                              >
                                <span className={newUser.tier === t.id ? 'font-medium tracking-wider uppercase' : 'font-light tracking-wider uppercase'}>
                                  {t.name}
                                </span>
                                {newUser.tier === t.id && <Check className="w-4 h-4 text-gold" />}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/[0.06] mt-8">
                      {createResult.message && (
                        <p
                          className={`text-sm tracking-widest mb-6 text-center uppercase font-medium ${createResult.type === 'error' ? 'text-[#d9736c]' : 'text-gold'}`}
                        >
                          {createResult.message}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={creating}
                        className={`inline-flex items-center justify-center space-x-2 border px-10 py-4 text-xs uppercase tracking-widest transition-all duration-300 w-full md:w-auto md:min-w-[240px] md:float-right ${
                          creating
                            ? 'border-gold bg-gold/70 text-dark-900 cursor-wait'
                            : 'border-gold/50 bg-gold/10 text-gold hover:bg-gold hover:text-dark-900'
                        }`}
                      >
                        {creating ? (
                          <div className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <UserPlus className="w-4 h-4" />
                        )}
                        <span>{creating ? 'Creating Account...' : 'Create Account'}</span>
                      </button>
                      <div className="clear-both" />
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6 animate-fadeIn">
            <div className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
            <div className="relative bg-dark-800 border border-white/10 rounded-sm p-8 max-w-md w-full animate-scaleIn shadow-2xl">
              <h3 className="font-serif text-xl text-white mb-4">Delete Member Profile?</h3>
              <p className="text-gray-400 text-sm mb-4">
                This will delete <span className="text-white">{deleteTarget.displayName}</span>'s profile data from the database.
              </p>
              <div className="p-3 bg-[#d9736c]/10 border border-[#d9736c]/20 rounded-sm mb-6 flex items-start space-x-3">
                <Trash2 className="w-4 h-4 text-[#d9736c] shrink-0 mt-0.5" />
                <p className="text-[#d9736c] text-xs leading-relaxed">
                  <strong>Note:</strong> Due to Firebase rules, this only deletes their profile data. The actual email/password account can only be deleted via
                  the Firebase Console.
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 border border-white/10 text-gray-300 py-3 text-xs uppercase tracking-widest hover:border-white/30 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 border border-[#d9736c] bg-[#d9736c] text-white py-3 text-xs uppercase tracking-widest hover:bg-[#c0625b] transition-colors"
                >
                  {deleting ? 'Deleting...' : 'Delete Data'}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default AdminMembers;
