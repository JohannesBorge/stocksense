'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only set up auth state listener if we have Firebase config
    if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
      });

      return unsubscribe;
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      throw new Error('Firebase configuration is missing');
    }
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      throw new Error('Firebase configuration is missing');
    }
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      throw new Error('Firebase configuration is missing');
    }
    await signOut(auth);
  };

  const signInWithGoogle = async () => {
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      throw new Error('Firebase configuration is missing');
    }
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    logout,
    signInWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 