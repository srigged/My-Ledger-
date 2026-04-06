import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../api';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface AuthContextType {
  user: UserProfile | null;
  loginWithEmail: (email: string, password: string, role?: 'admin' | 'analyst' | 'viewer') => Promise<void>;
  signupWithEmail: (email: string, password: string, displayName: string, role: 'admin' | 'analyst' | 'viewer') => Promise<void>;
  loginWithGoogle: (role?: 'admin' | 'analyst' | 'viewer') => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Use onSnapshot to keep the user profile in sync
        const userRef = doc(db, 'users', firebaseUser.uid);
        unsubscribeDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUser(docSnap.data() as UserProfile);
          } else {
            setUser(null);
          }
          setLoading(false);
        }, (err) => {
          console.error("Firestore Profile Sync Error:", err);
          setLoading(false);
        });
      } else {
        setUser(null);
        if (unsubscribeDoc) unsubscribeDoc();
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  const loginWithEmail = async (email: string, password: string, role?: 'admin' | 'analyst' | 'viewer') => {
    setLoading(true);
    setError(null);
    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
      if (role) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        await setDoc(userRef, { role }, { merge: true });
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
      setLoading(false);
      throw err;
    }
  };

  const signupWithEmail = async (email: string, password: string, displayName: string, role: 'admin' | 'analyst' | 'viewer') => {
    setLoading(true);
    setError(null);
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      const newUser: UserProfile = {
        uid: firebaseUser.uid,
        email,
        displayName,
        role,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
    } catch (err: any) {
      setError(err.message || 'Signup failed');
      setLoading(false);
      throw err;
    }
  };

  const loginWithGoogle = async (role?: 'admin' | 'analyst' | 'viewer') => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const { user: firebaseUser } = await signInWithPopup(auth, provider);
      
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Create full profile for new Google user
        const newUser: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Unknown',
          role: role || 'viewer',
          status: 'active',
          createdAt: new Date().toISOString(),
        };
        await setDoc(userRef, newUser);
      } else if (role) {
        // Update role for existing user
        await setDoc(userRef, { role }, { merge: true });
      }
    } catch (err: any) {
      setError(err.message || 'Google login failed');
      setLoading(false);
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Password reset failed');
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      setError(err.message || 'Logout failed');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loginWithEmail, 
      signupWithEmail, 
      loginWithGoogle, 
      resetPassword, 
      logout, 
      loading, 
      error 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
