// contexts/AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut as fbSignOut,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { auth } from "../lib/firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dùng local persistence để giữ đăng nhập trên nhiều tab
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        return onAuthStateChanged(auth, (u) => {
          setUser(u);
          setLoading(false);
        });
      })
      .catch((e) => console.error("Persistence error:", e));
  }, []);

  // Email/Password
  const signIn = (email, pass) =>
    signInWithEmailAndPassword(auth, email, pass);
  const signUp = (email, pass) =>
    createUserWithEmailAndPassword(auth, email, pass);

  // Google
  const googleProvider = new GoogleAuthProvider();
  const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

  // GitHub
  const githubProvider = new GithubAuthProvider();
  const signInWithGithub = () => signInWithPopup(auth, githubProvider);

  const signOut = () => fbSignOut(auth);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signInWithGithub,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
