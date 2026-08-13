import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, SupportedLanguage, UserProfile } from '../types';
import { authApi, profileApi, settingsApi } from '../api/endpoints';
import { useLanguage } from './LanguageContext';

interface AuthContextType extends AuthState {
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (email: string, password: string, lang?: SupportedLanguage) => Promise<void>;
  loginWithSocial: (provider: 'google' | 'apple', name?: string, email?: string) => Promise<void>;
  sendPhoneOtp: (phone: string) => Promise<void>;
  verifyPhoneOtp: (phone: string, otp: string) => Promise<void>;
  logout: () => void;
  updateUserStatus: (updates: Partial<AuthState>) => void;
  profile: UserProfile | null;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { setLanguage, language } = useLanguage();
  
  const [authState, setAuthState] = useState<AuthState>(() => {
    const savedToken = localStorage.getItem('digital_twin_token');
    const savedUser = localStorage.getItem('digital_twin_user');
    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        return {
          token: savedToken,
          userId: parsed.userId || null,
          email: parsed.email || null,
          phone: parsed.phone || null,
          language: parsed.language || 'en',
          hasProfile: !!parsed.hasProfile,
          hasDay1Data: !!parsed.hasDay1Data,
          isAuthenticated: true,
        };
      } catch (e) {
        // invalid
      }
    }
    return {
      token: null,
      userId: null,
      email: null,
      phone: null,
      language: 'en',
      hasProfile: false,
      hasDay1Data: false,
      isAuthenticated: false,
    };
  });

  const [profile, setProfile] = useState<UserProfile | null>(null);

  const saveAuthSession = (tokenData: any) => {
    localStorage.setItem('digital_twin_token', tokenData.access_token);
    const userObj = {
      userId: tokenData.user_id,
      email: tokenData.email,
      phone: tokenData.phone,
      language: tokenData.language || 'en',
      hasProfile: tokenData.has_profile,
      hasDay1Data: tokenData.has_day1_data,
    };
    localStorage.setItem('digital_twin_user', JSON.stringify(userObj));
    
    if (tokenData.language) {
      setLanguage(tokenData.language as SupportedLanguage);
    }

    setAuthState({
      token: tokenData.access_token,
      userId: tokenData.user_id,
      email: tokenData.email,
      phone: tokenData.phone,
      language: tokenData.language || 'en',
      hasProfile: tokenData.has_profile,
      hasDay1Data: tokenData.has_day1_data,
      isAuthenticated: true,
    });
  };

  const refreshProfile = async () => {
    if (!authState.token) return;
    try {
      const data = await profileApi.getProfile();
      setProfile(data);
      updateUserStatus({ hasProfile: true });
    } catch (e) {
      setProfile(null);
    }
  };

  useEffect(() => {
    if (authState.isAuthenticated) {
      refreshProfile();
    }
  }, [authState.isAuthenticated]);

  useEffect(() => {
    const handleLogoutEvent = () => logout();
    window.addEventListener('auth-logout', handleLogoutEvent);
    return () => window.removeEventListener('auth-logout', handleLogoutEvent);
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    saveAuthSession(res);
  };

  const signupWithEmail = async (email: string, password: string, lang?: SupportedLanguage) => {
    const res = await authApi.signup({ email, password, language: lang || language });
    saveAuthSession(res);
  };

  const loginWithSocial = async (provider: 'google' | 'apple', name?: string, email?: string) => {
    const res = await authApi.socialLogin({
      provider,
      name: name || (provider === 'google' ? 'Google Health Explorer' : 'Apple Health User'),
      email: email || `${provider}.user@digitaltwin.ai`,
      language
    });
    saveAuthSession(res);
  };

  const sendPhoneOtp = async (phone: string) => {
    await authApi.sendPhoneOtp(phone);
  };

  const verifyPhoneOtp = async (phone: string, otp: string) => {
    const res = await authApi.verifyPhoneOtp(phone, otp);
    saveAuthSession(res);
  };

  const logout = () => {
    localStorage.removeItem('digital_twin_token');
    localStorage.removeItem('digital_twin_user');
    setAuthState({
      token: null,
      userId: null,
      email: null,
      phone: null,
      language: 'en',
      hasProfile: false,
      hasDay1Data: false,
      isAuthenticated: false,
    });
    setProfile(null);
  };

  const updateUserStatus = (updates: Partial<AuthState>) => {
    setAuthState(prev => {
      const updated = { ...prev, ...updates };
      const userObj = {
        userId: updated.userId,
        email: updated.email,
        phone: updated.phone,
        language: updated.language,
        hasProfile: updated.hasProfile,
        hasDay1Data: updated.hasDay1Data,
      };
      localStorage.setItem('digital_twin_user', JSON.stringify(userObj));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        loginWithEmail,
        signupWithEmail,
        loginWithSocial,
        sendPhoneOtp,
        verifyPhoneOtp,
        logout,
        updateUserStatus,
        profile,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
