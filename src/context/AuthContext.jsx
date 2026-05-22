import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { mockDb } from '../services/mockDb';
import { supabase } from '../services/supabase';
import { safeStorage } from '../services/safeStorage';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionMode, setSessionMode] = useState('mock'); // 'mock' or 'supabase'

  // Keep a ref of the current user state to avoid stale closure issues in onAuthStateChange
  const userRef = useRef(null);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    // Bulletproof Safety Timeout: Force-set loading to false after 4.5 seconds
    // to prevent any browser security/extensions/network hangs from locking the user out!
    const safetyTimeout = setTimeout(() => {
      console.warn("Safety trigger: Auth initialization took too long. Forcing loading screen termination.");
      setLoading(false);
    }, 4500);

    let subscription = null;

    // Determine active session mode
    if (supabase) {
      setSessionMode('supabase');
      
      let isInitialized = false;

      // Listen to auth state transitions reactively.
      // In Supabase v2, onAuthStateChange fires immediately upon subscription with the initial session.
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log(`Supabase Auth Transition Event: ${event}`);
        try {
          if (session?.user) {
            // Sync the user profile from Supabase
            const syncRes = await syncSupabaseProfile(session.user.id, session.user.email);
            if (!syncRes || !syncRes.success) {
              console.warn("Failed to sync profile on auth change, clearing session:", syncRes?.error);
              await supabase.auth.signOut();
              setUser(null);
              safeStorage.removeItem('adviral_active_user');
            }
          } else {
            setUser(null);
            safeStorage.removeItem('adviral_active_user');
          }
        } catch (err) {
          console.error("Auth state change error: ", err);
        } finally {
          // Once the first auth check finishes, terminate loading state and clear the safety timeout
          if (!isInitialized) {
            isInitialized = true;
            setLoading(false);
            clearTimeout(safetyTimeout);
          }
        }
      });
      subscription = data?.subscription;
    } else {
      // Mock Fallback mode
      setSessionMode('mock');
      const storedUser = safeStorage.getItem('adviral_active_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          const freshUser = mockDb.getUserById(parsed.id);
          if (freshUser) {
            setUser(freshUser);
            safeStorage.setItem('adviral_active_user', JSON.stringify(freshUser));
          } else {
            setUser(parsed);
          }
        } catch (e) {
          console.warn("Failed to parse stored active user:", e);
          safeStorage.removeItem('adviral_active_user');
        }
      } else {
        // Auto seed normal creator alex for smooth developer testing experience
        const alex = mockDb.getUsers().find(u => u.email === 'alex@example.com');
        if (alex) {
          setUser(alex);
          safeStorage.setItem('adviral_active_user', JSON.stringify(alex));
        }
      }
      setLoading(false);
      clearTimeout(safetyTimeout);
    }

    return () => {
      clearTimeout(safetyTimeout);
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Helper to fetch custom profile details from public.profiles table in Supabase
  async function syncSupabaseProfile(uid, email) {
    try {
      let profileData = null;
      let fetchError = null;

      // Try up to 3 times with a delay to let the database trigger complete
      for (let attempt = 1; attempt <= 3; attempt++) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', uid)
          .single();

        if (data) {
          profileData = data;
          break;
        }

        fetchError = error;
        if (attempt < 3) {
          console.log(`Profile not found yet (attempt ${attempt}/3). Retrying in 800ms to allow trigger to execute...`);
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }

      if (profileData) {
        if (profileData.is_banned) {
          // Force logout if banned
          await supabase.auth.signOut();
          setUser(null);
          safeStorage.removeItem('adviral_active_user');
          return { success: false, error: 'This account has been banned by the administrator.' };
        }
        setUser(profileData);
        safeStorage.setItem('adviral_active_user', JSON.stringify(profileData));
        return { success: true, user: profileData };
      } else {
        console.warn("Error fetching profile, attempting to recreate in public schema: ", fetchError);
        
        // Edge case: if trigger failed, manually insert a fallback profile row
        const fallbackProfile = {
          id: uid,
          name: email.split('@')[0],
          email: email,
          role: 'user',
          plan: 'Free',
          credits: 50
        };

        const { data: inserted, error: insertErr } = await supabase
          .from('profiles')
          .insert([fallbackProfile])
          .select()
          .single();

        if (inserted) {
          setUser(inserted);
          safeStorage.setItem('adviral_active_user', JSON.stringify(inserted));
          return { success: true, user: inserted };
        } else if (insertErr) {
          console.warn("Manual insert failed. Doing one final select query to check if profile was created: ", insertErr);
          const { data: finalData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', uid)
            .single();

          if (finalData) {
            if (finalData.is_banned) {
              await supabase.auth.signOut();
              setUser(null);
              safeStorage.removeItem('adviral_active_user');
              return { success: false, error: 'This account has been banned by the administrator.' };
            }
            setUser(finalData);
            safeStorage.setItem('adviral_active_user', JSON.stringify(finalData));
            return { success: true, user: finalData };
          }
        }
      }
    } catch (err) {
      console.error("Profile sync exception: ", err);
    }
    return { success: false, error: 'Failed to sync user session profile.' };
  }

  const login = async (email, password) => {
    setLoading(true);
    const loginTimeout = setTimeout(() => {
      console.warn("Login request timed out. Forcing loading state release.");
      setLoading(false);
    }, 8000);

    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Network delay simulation

      if (sessionMode === 'supabase') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          clearTimeout(loginTimeout);
          setLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          const syncRes = await syncSupabaseProfile(data.user.id, data.user.email);
          clearTimeout(loginTimeout);
          setLoading(false);
          return syncRes;
        }
      } else {
        // Mock Login Mode
        if (email === 'admin@adviral.ai' && password === 'admin') {
          const adminUser = mockDb.getUserById('admin-uuid-1');
          setUser(adminUser);
          safeStorage.setItem('adviral_active_user', JSON.stringify(adminUser));
          clearTimeout(loginTimeout);
          setLoading(false);
          return { success: true, user: adminUser };
        }

        const users = mockDb.getUsers();
        const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!foundUser) {
          clearTimeout(loginTimeout);
          setLoading(false);
          return { success: false, error: 'No account found with this email.' };
        }

        if (foundUser.password !== password) {
          clearTimeout(loginTimeout);
          setLoading(false);
          return { success: false, error: 'Incorrect password.' };
        }

        if (foundUser.is_banned) {
          clearTimeout(loginTimeout);
          setLoading(false);
          return { success: false, error: 'This account has been banned by the administrator.' };
        }

        setUser(foundUser);
        safeStorage.setItem('adviral_active_user', JSON.stringify(foundUser));
        clearTimeout(loginTimeout);
        setLoading(false);
        return { success: true, user: foundUser };
      }
    } catch (err) {
      clearTimeout(loginTimeout);
      setLoading(false);
      return { success: false, error: err.message || 'Authentication error.' };
    }
  };

  const signup = async (name, email, password) => {
    setLoading(true);
    const signupTimeout = setTimeout(() => {
      console.warn("Signup request timed out. Forcing loading state release.");
      setLoading(false);
    }, 8000);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (sessionMode === 'supabase') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
          },
        });

        if (error) {
          clearTimeout(signupTimeout);
          setLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          // Trigger profile sync (wait slightly to let DB handle trigger insertion)
          await new Promise(resolve => setTimeout(resolve, 500));
          const syncRes = await syncSupabaseProfile(data.user.id, data.user.email);
          clearTimeout(signupTimeout);
          setLoading(false);
          return syncRes;
        }
      } else {
        // Mock Sign Up Mode
        const users = mockDb.getUsers();
        const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

        if (exists) {
          clearTimeout(signupTimeout);
          setLoading(false);
          return { success: false, error: 'An account with this email already exists.' };
        }

        const newUser = mockDb.createUser({
          name,
          email,
          password,
          role: 'user',
          credits: 50,
          plan: 'Free',
          is_banned: false,
        });

        setUser(newUser);
        safeStorage.setItem('adviral_active_user', JSON.stringify(newUser));
        clearTimeout(signupTimeout);
        setLoading(false);
        return { success: true, user: newUser };
      }
    } catch (err) {
      clearTimeout(signupTimeout);
      setLoading(false);
      return { success: false, error: err.message || 'Sign up exception occurred.' };
    }
  };

  const logout = async () => {
    setLoading(true);
    const logoutTimeout = setTimeout(() => {
      console.warn("Logout request timed out. Forcing loading state release.");
      setLoading(false);
    }, 8000);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (sessionMode === 'supabase') {
        await supabase.auth.signOut();
      }
      
      setUser(null);
      safeStorage.removeItem('adviral_active_user');
      clearTimeout(logoutTimeout);
      setLoading(false);
      return { success: true };
    } catch (err) {
      console.error("Logout exception:", err);
      setUser(null);
      safeStorage.removeItem('adviral_active_user');
      clearTimeout(logoutTimeout);
      setLoading(false);
      return { success: true };
    }
  };

  const googleLogin = async () => {
    setLoading(true);
    const googleTimeout = setTimeout(() => {
      console.warn("Google login timed out. Forcing loading state release.");
      setLoading(false);
    }, 8000);

    try {
      await new Promise(resolve => setTimeout(resolve, 1200));

      if (sessionMode === 'supabase') {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
        });
        if (error) {
          clearTimeout(googleTimeout);
          setLoading(false);
          return { success: false, error: error.message };
        }
        clearTimeout(googleTimeout);
        return { success: true }; // Vercel/Supabase will redirect automatically
      } else {
        // Mock Google OAuth
        const randomId = Math.floor(Math.random() * 10000);
        const googleUser = mockDb.createUser({
          name: `Google User #${randomId}`,
          email: `google.user${randomId}@gmail.com`,
          password: 'oauth-login',
          role: 'user',
          credits: 50,
          plan: 'Free',
        });

        setUser(googleUser);
        safeStorage.setItem('adviral_active_user', JSON.stringify(googleUser));
        clearTimeout(googleTimeout);
        setLoading(false);
        return { success: true, user: googleUser };
      }
    } catch (e) {
      clearTimeout(googleTimeout);
      setLoading(false);
      return { success: false, error: e.message };
    }
  };

  const forgotPassword = async (email) => {
    await new Promise(resolve => setTimeout(resolve, 800));

    if (sessionMode === 'supabase') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } else {
      const users = mockDb.getUsers();
      const found = users.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (!found) {
        return { success: false, error: 'No user registered with this email address.' };
      }
      return { success: true };
    }
  };

  const refreshSessionUser = async () => {
    if (user) {
      if (sessionMode === 'supabase') {
        await syncSupabaseProfile(user.id, user.email);
      } else {
        const freshUser = mockDb.getUserById(user.id);
        if (freshUser) {
          setUser(freshUser);
          safeStorage.setItem('adviral_active_user', JSON.stringify(freshUser));
        }
      }
    }
  };

  const switchUserRole = async (newRole) => {
    if (!user) return;
    
    if (sessionMode === 'supabase') {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', user.id);
      
      if (!error) {
        await refreshSessionUser();
      }
    } else {
      const updated = mockDb.updateUser(user.id, { role: newRole });
      if (updated) {
        setUser(updated);
        safeStorage.setItem('adviral_active_user', JSON.stringify(updated));
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      sessionMode,
      login,
      signup,
      logout,
      googleLogin,
      forgotPassword,
      refreshSessionUser,
      switchUserRole,
      setUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
export default AuthContext;
