import React, { createContext, useContext, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          if (db) {
            // Race the profile fetch against a timeout so offline doesn't hang forever
            const profilePromise = getDoc(doc(db, 'users', firebaseUser.uid));
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Profile fetch timed out')), 5000)
            );
            const profileDoc = await Promise.race([profilePromise, timeoutPromise]);
            if (profileDoc.exists()) {
              setUserProfile({ id: profileDoc.id, ...profileDoc.data() });
            }
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    if (!auth) throw new Error('Firebase Auth not initialized. Check your credentials.');
    const result = await signInWithEmailAndPassword(auth, email, password);
    if (db) {
      const profileDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (profileDoc.exists()) {
        setUserProfile({ id: profileDoc.id, ...profileDoc.data() });
      }
    }
    return result;
  };

  const register = async (email, password, displayName, phone = '') => {
    if (!auth) throw new Error('Firebase Auth not initialized. Check your credentials.');
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    
    if (db) {
      const profileData = {
        displayName,
        email,
        phone,
        bio: '',
        role: 'member',
        membershipTier: 'bronze',
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'users', result.user.uid), profileData);
      setUserProfile({ id: result.user.uid, ...profileData });
    }
    return result;
  };

  const loginWithGoogle = async () => {
    if (!auth) throw new Error('Firebase Auth not initialized. Check your credentials.');
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    
    if (db) {
      // Check if user already has a profile
      const profileDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!profileDoc.exists()) {
        // Create new profile for first-time Google sign-in
        const profileData = {
          displayName: result.user.displayName || 'Google User',
          email: result.user.email,
          phone: result.user.phoneNumber || '',
          bio: '',
          role: 'member',
          membershipTier: 'bronze',
          createdAt: serverTimestamp(),
        };
        await setDoc(doc(db, 'users', result.user.uid), profileData);
        setUserProfile({ id: result.user.uid, ...profileData });
      } else {
        setUserProfile({ id: profileDoc.id, ...profileDoc.data() });
      }
    }
    return result;
  };

  const logout = async () => {
    if (auth) await signOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  const updateUserProfile = async (data) => {
    if (!user || !db) throw new Error('Not authenticated or database not initialized');
    await updateDoc(doc(db, 'users', user.uid), data);
    if (data.displayName) {
      await updateProfile(user, { displayName: data.displayName });
    }
    const profileDoc = await getDoc(doc(db, 'users', user.uid));
    if (profileDoc.exists()) {
      setUserProfile({ id: profileDoc.id, ...profileDoc.data() });
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    if (!user || !auth) throw new Error('Not authenticated');
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
  };

  const isAdmin = userProfile?.role === 'admin';

  const value = {
    user,
    userProfile,
    loading,
    isAuthenticated: !!user,
    isConfigured: !!auth, // New helper to check if Firebase is ready
    isAdmin,
    login,
    register,
    loginWithGoogle,
    logout,
    updateUserProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export function RequireAdmin({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
