import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  supabase,
  isLiveSupabaseConfigured,
  AuthUser,
  getCurrentSession,
  setCurrentSession,
  getLocalUsers,
  saveLocalUsers,
} from '../lib/supabase';
import { dbService } from '../services/db';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isLiveSupabase: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string; success?: boolean }>;
  updatePassword: (newPassword: string) => Promise<{ error?: string; success?: boolean }>;
  switchQuickTestUser: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize Auth state
  useEffect(() => {
    async function initAuth() {
      try {
        if (isLiveSupabaseConfigured && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              display_name: session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'User',
              avatar_url: session.user.user_metadata?.avatar_url,
              created_at: session.user.created_at,
            });
          } else {
            setUser(null);
          }

          const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                display_name: session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'User',
                avatar_url: session.user.user_metadata?.avatar_url,
                created_at: session.user.created_at,
              });
            } else {
              setUser(null);
            }
          });

          return () => {
            subscription.unsubscribe();
          };
        } else {
          // Local multi-tenant sandbox mode
          const session = getCurrentSession();
          if (session?.user) {
            setUser(session.user);
          } else {
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const signUp = async (email: string, password: string, displayName?: string): Promise<{ error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const name = displayName?.trim() || trimmedEmail.split('@')[0];

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return { error: 'Please enter a valid email address.' };
    }
    if (password.length < 6) {
      return { error: 'Password must be at least 6 characters long.' };
    }

    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: { display_name: name },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email || trimmedEmail,
          display_name: name,
          created_at: data.user.created_at,
        };
        setUser(authUser);
        // Initialize default user profile and data
        await dbService.initializeUserData(authUser.id, name, trimmedEmail);
      }
      return {};
    } else {
      // Local sandbox registration
      const users = getLocalUsers();
      if (users.some((u) => u.email === trimmedEmail)) {
        return { error: 'An account with this email address already exists. Please sign in.' };
      }

      // Generate a distinct UUID for this user to guarantee strict tenant isolation
      const newUserId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const newUserRecord = {
        id: newUserId,
        email: trimmedEmail,
        passwordHash: btoa(password),
        display_name: name,
      };

      users.push(newUserRecord);
      saveLocalUsers(users);

      const authUser: AuthUser = {
        id: newUserId,
        email: trimmedEmail,
        display_name: name,
        created_at: new Date().toISOString(),
      };

      setCurrentSession({
        user: authUser,
        token: `mock_jwt_${newUserId}`,
      });

      setUser(authUser);

      // Seed starter profile and clean sandbox for this user
      await dbService.initializeUserData(newUserId, name, trimmedEmail);
      return {};
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      return { error: 'Please enter both email and password.' };
    }

    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email || trimmedEmail,
          display_name: data.user.user_metadata?.display_name || trimmedEmail.split('@')[0],
          avatar_url: data.user.user_metadata?.avatar_url,
          created_at: data.user.created_at,
        };
        setUser(authUser);
      }
      return {};
    } else {
      const users = getLocalUsers();
      const existingUser = users.find((u) => u.email === trimmedEmail);

      if (!existingUser) {
        return { error: 'No account found with this email. Please check your credentials or sign up.' };
      }

      if (existingUser.passwordHash !== btoa(password)) {
        return { error: 'Incorrect password. Please try again.' };
      }

      const authUser: AuthUser = {
        id: existingUser.id,
        email: existingUser.email,
        display_name: existingUser.display_name,
        created_at: new Date().toISOString(),
      };

      setCurrentSession({
        user: authUser,
        token: `mock_jwt_${existingUser.id}`,
      });

      setUser(authUser);
      return {};
    }
  };

  const signOut = async (): Promise<void> => {
    if (isLiveSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    } else {
      setCurrentSession(null);
    }
    setUser(null);
  };

  const resetPassword = async (email: string): Promise<{ error?: string; success?: boolean }> => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      return { error: 'Please enter your email address.' };
    }

    if (isLiveSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail);
      if (error) return { error: error.message };
      return { success: true };
    } else {
      const users = getLocalUsers();
      const found = users.find((u) => u.email === trimmedEmail);
      if (!found) {
        return { error: 'No account found with that email address.' };
      }
      return { success: true };
    }
  };

  const updatePassword = async (newPassword: string): Promise<{ error?: string; success?: boolean }> => {
    if (newPassword.length < 6) {
      return { error: 'Password must be at least 6 characters long.' };
    }

    if (isLiveSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { error: error.message };
      return { success: true };
    } else {
      if (!user) return { error: 'Not authenticated.' };
      const users = getLocalUsers();
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx !== -1) {
        users[idx].passwordHash = btoa(newPassword);
        saveLocalUsers(users);
        return { success: true };
      }
      return { error: 'User record not found.' };
    }
  };

  // Quick switcher for instant multi-user verification (User 1 vs User 2 test requirement)
  const switchQuickTestUser = async (testEmail: string): Promise<void> => {
    const trimmed = testEmail.toLowerCase();
    const users = getLocalUsers();
    let target = users.find((u) => u.email === trimmed);

    if (!target) {
      // Auto-provision test user if does not exist yet
      const newId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const name = trimmed.split('@')[0];
      target = {
        id: newId,
        email: trimmed,
        passwordHash: btoa('password123'),
        display_name: name.charAt(0).toUpperCase() + name.slice(1),
      };
      users.push(target);
      saveLocalUsers(users);
      await dbService.initializeUserData(newId, target.display_name, target.email);
    }

    const authUser: AuthUser = {
      id: target.id,
      email: target.email,
      display_name: target.display_name,
      created_at: new Date().toISOString(),
    };

    setCurrentSession({
      user: authUser,
      token: `mock_jwt_${target.id}`,
    });

    setUser(authUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLiveSupabase: isLiveSupabaseConfigured,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        switchQuickTestUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
