import type { Session, User } from "@supabase/supabase-js";
import React, { createContext, ReactNode, useContext } from "react";
import { useAuth } from "../hooks/useAuth";

//AuthContext provides global access to authentication info (user, session, loading) by using useAuth under the hood.


interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

//AuthProvider — used once, at the top level (like in Index.tsx)
// It wraps your entire app (or at least the part that needs authentication) and provides the authentication data to all components inside.
export function AuthProvider({ children }: AuthProviderProps) {

  //  Calls custom hook `useAuth()` to get the user, session, loading, etc.
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}


// Defines a custom hook to safely use the AuthContext.
// useAuthContext() — used in any component that needs user/session info
// This is what you’ll use inside other components to access the user, session, loading, or isAuthenticated values that your provider supplies.
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
