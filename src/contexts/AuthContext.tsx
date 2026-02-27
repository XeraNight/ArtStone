"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

export type UserRole = 'admin' | 'manager' | 'sales' | 'správca';
export type OAuthProvider = 'google' | 'github' | 'azure' | 'facebook';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  regionId: string | null;
  regionName: string;
  avatar?: string;
  phone?: string;
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  loginWithOAuth: (provider: OAuthProvider) => Promise<{ error: string | null }>;
  signup: (email: string, password: string, fullName: string, role: UserRole, regionId?: string) => Promise<{ error: string | null; session?: Session | null }>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<{ error: string | null }>;
  refreshUser: () => Promise<void>;
  // MFA Methods
  enrollMfa: () => Promise<{ data: any; error: any }>;
  verifyMfa: (factorId: string, code: string) => Promise<{ error: any }>;
  unenrollMfa: (factorId: string) => Promise<{ error: any }>;
  challengeMfa: (factorId: string) => Promise<{ data: any; error: any }>;
  verifyChallenge: (factorId: string, challengeId: string, code: string) => Promise<{ error: any }>;
  listMfaFactors: () => Promise<{ data: any; error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchUserData(userId: string, authEmail?: string): Promise<AppUser | null> {
  try {
    console.log('[Auth] Fetching user data for:', userId);

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*, regions(name)')
      .eq('id', userId)
      .maybeSingle();

    console.log('[Auth] Profile fetch result:', { profile, error: profileError });

    if (!profile) {
      console.log('[Auth] No profile found, creating fallback');
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const email = authEmail || authUser?.email || 'unknown@email.com';
      const fullName = authUser?.user_metadata?.full_name || email.split('@')[0];
      const metaRole = authUser?.user_metadata?.role as UserRole;
      const metaRegionId = authUser?.user_metadata?.region_id;

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      const role = metaRole || (roleData?.role as UserRole) || 'sales';
      const regionId = metaRegionId || null;

      const { data: checkProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (!checkProfile) {
        await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: email,
            full_name: fullName,
            role: role,
            region_id: regionId,
            updated_at: new Date().toISOString()
          });
      }

      return {
        id: userId,
        name: fullName,
        email: email,
        role,
        regionId: regionId,
        regionName: 'Košický kraj',
        avatar: fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U',
        phone: '',
      };
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    const role = (profile.role as UserRole) || (roleData?.role as UserRole) || 'sales';

    let regionName = 'Neurčený región';
    if (profile.regions) {
      if (Array.isArray(profile.regions) && profile.regions.length > 0) {
        regionName = profile.regions[0].name;
      } else if (typeof profile.regions === 'object' && 'name' in profile.regions) {
        regionName = (profile.regions as any).name;
      }
    }

    return {
      id: profile.id,
      name: profile.full_name || profile.email,
      email: profile.email,
      role,
      regionId: profile.region_id,
      regionName: regionName,
      avatar: profile.avatar_url || profile.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
      phone: profile.phone || '',
    };
  } catch (error) {
    console.error('[Auth] Error in fetchUserData:', error);
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const email = authEmail || authUser.email || 'unknown@email.com';
      const fullName = authUser.user_metadata?.full_name || email.split('@')[0];
      return {
        id: userId,
        name: fullName,
        email: email,
        role: 'sales' as UserRole,
        regionId: null,
        regionName: 'Neurčený región',
        avatar: fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U',
        phone: '',
      };
    }
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage AFTER mounting to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('artstone-user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {
          console.error("Error parsing stored user:", e);
          localStorage.removeItem('artstone-user');
        }
      }
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);

        if (currentSession?.user) {
          // Defer Supabase calls with setTimeout to avoid deadlock
          setTimeout(async () => {
            const userData = await fetchUserData(currentSession.user.id);
            if (userData) {
              setUser(userData);
              localStorage.setItem('artstone-user', JSON.stringify(userData));
            }
            setIsLoading(false);
          }, 0);
        } else {
          const storedUser = localStorage.getItem('artstone-user');
          if (!storedUser || event === 'SIGNED_OUT') {
            setUser(null);
            localStorage.removeItem('artstone-user');
          }
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    const initAuth = async () => {
      if (typeof window === 'undefined') return;
      
      try {
        const { data: { session: existingSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[Auth] Error getting session:', error);
          throw error;
        }

        setSession(existingSession);
        if (existingSession?.user) {
          const userData = await fetchUserData(existingSession.user.id);
          if (userData) {
            setUser(userData);
            localStorage.setItem('artstone-user', JSON.stringify(userData));
          }
        } else {
          const storedUser = localStorage.getItem('artstone-user');
          if (!storedUser) {
            setUser(null);
            localStorage.removeItem('artstone-user');
          }
        }
      } catch (error) {
        console.error('[Auth] Initialization error:', error);
        // On error, we still want to stop loading
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Safety timeout: if auth takes too long (e.g. network hang), stop loading
    const timeoutTimer = setTimeout(() => {
      setIsLoading((prev) => {
        if (prev) {
          console.warn('[Auth] Initialization timed out, forcing load completion');
          return false;
        }
        return prev;
      });
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutTimer);
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      // CLEAR localStorage cache BEFORE login to ensure fresh data
      console.log('[Auth] Clearing localStorage cache before login');
      localStorage.removeItem('artstone-user');
      setUser(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          return { error: 'Nesprávny email alebo heslo' };
        }
        if (error.message.includes('Email not confirmed')) {
          return { error: 'Email ešte nebol potvrdený. Skontrolujte svoju emailovú schránku.' };
        }
        return { error: error.message };
      }

      if (data.user) {
        console.log('[Auth] Login successful, fetching fresh user data');
        const userData = await fetchUserData(data.user.id, email);
        console.log('[Auth] User data after login:', userData);
        if (userData) {
          setUser(userData);
          localStorage.setItem('artstone-user', JSON.stringify(userData));
        }
      }

      return { error: null };
    } catch (err) {
      console.error('[Auth] Login error:', err);
      return { error: 'Nastala chyba pri prihlásení' };
    }
  };

  const signup = async (email: string, password: string, fullName: string, role: UserRole = 'sales', regionId?: string): Promise<{ error: string | null; session?: Session | null }> => {
    try {
      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            role: role,
            region_id: regionId
          },
        },
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          return { error: 'Tento email je už zaregistrovaný' };
        }
        return { error: error.message };
      }

      if (data.user) {
        console.log('[Auth] Attempting to create profile for user:', data.user.id);
        // Explicitly create/update profile
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: email,
            full_name: fullName,
            role: role,
            region_id: regionId || null,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (profileError) {
          console.error('[Auth] Manual profile creation failed:', profileError);
          // Alert the user if it's likely a permission issue
          if (profileError.code === '42501' || profileError.message.includes('security policy')) {
            console.error('CRITICAL: Database RLS policy is blocking profile creation.');
            // We don't return error here to allow login, but we log loud
          }
        }
      }

      if (data.user && !data.session) {
        return { error: null, session: null }; // Email confirmation required
      }

      return { error: null, session: data.session };
    } catch (err) {
      return { error: 'Nastala chyba pri registrácii' };
    }
  };

  const loginWithOAuth = async (provider: OAuthProvider): Promise<{ error: string | null }> => {
    try {
      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        console.error('[Auth] OAuth error:', error);
        return { error: error.message };
      }

      // OAuth will redirect, so we don't need to do anything else here
      return { error: null };
    } catch (err) {
      console.error('[Auth] OAuth error:', err);
      return { error: 'Nastala chyba pri OAuth prihlásení' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    localStorage.removeItem('artstone-user');
  };

  const deleteAccount = async (): Promise<{ error: string | null }> => {
    if (!user || !session) return { error: 'Nie ste prihlásený' };

    try {
      console.log('[Auth] Deleting account for:', user.id);

      // 1. Delete profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) {
        console.error('[Auth] Error deleting profile:', profileError);
        // Continue anyway to try to clean up other things
      }

      // 2. Delete user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.id);

      if (roleError) {
        console.error('[Auth] Error deleting user role:', roleError);
      }

      // 3. Try to call RPC to delete from auth.users (if exists)
      // This might fail if the RPC function doesn't exist, which is expected in some setups
      const { error: rpcError } = await supabase.rpc('delete_user');

      if (rpcError) {
        console.warn('[Auth] RPC delete_user failed (this is expected if function is missing):', rpcError);
      }

      // 4. Logout cleanup
      await logout();

      return { error: null };
    } catch (err: any) {
      console.error('[Auth] Delete account error:', err);
      return { error: err.message || 'Nastala chyba pri mazaní účtu' };
    }
  };

  const refreshUser = async () => {
    if (!session?.user?.id) {
      return;
    }

    try {
      const userData = await fetchUserData(session.user.id, session.user.email || '');
      if (userData) {
        setUser(userData);
        localStorage.setItem('artstone-user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('[Auth] Refresh user error:', error);
    }
  };

  const enrollMfa = async () => {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      issuer: 'ArtStone CRM'
    });
    return { data, error };
  };

  const verifyMfa = async (factorId: string, code: string) => {
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code,
    });
    return { error };
  };

  const unenrollMfa = async (factorId: string) => {
    const { error } = await supabase.auth.mfa.unenroll({
      factorId,
    });
    return { error };
  };

  const challengeMfa = async (factorId: string) => {
    const { data, error } = await supabase.auth.mfa.challenge({
      factorId,
    });
    return { data, error };
  };

  const verifyChallenge = async (factorId: string, challengeId: string, code: string) => {
    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code,
    });
    return { error };
  };

  const listMfaFactors = async () => {
    const { data, error } = await supabase.auth.mfa.listFactors();
    return { data, error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithOAuth,
        signup,
        logout,
        deleteAccount,
        refreshUser,
        enrollMfa,
        verifyMfa,
        unenrollMfa,
        challengeMfa,
        verifyChallenge,
        listMfaFactors,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
