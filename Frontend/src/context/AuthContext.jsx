import { useEffect, useState } from "react";
import { AuthContext } from "./context";
import * as authService from "../services/authService";
import * as userStorage from "../services/storage/userStorage";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function bootstrapSession() {
      const token = userStorage.getAccessToken();
      if (!token) {
        if (!cancelled) {
          setUser(null);
          setInitializing(false);
        }
        return;
      }
      try {
        const profile = await authService.fetchMe();
        if (!cancelled) setUser(profile);
      } catch {
        if (!cancelled) setUser(authService.getSessionUser());
      } finally {
        if (!cancelled) setInitializing(false);
      }
    }

    bootstrapSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (credentials) => {
    const { user: loggedInUser } = await authService.login(credentials);
    
    setUser(loggedInUser);
    return loggedInUser;
  };

  // const register = async (data) => authService.register(data);

  // const refreshUser = async () => {
  //   const token = userStorage.getAccessToken();
  //   if (!token) {
  //     setUser(null);
  //     return null;
  //   }

  //   try {
  //     const profile = await authService.fetchMe();
  //     setUser(profile);
  //     return profile;
  //   } catch {
  //     const stored = authService.getSessionUser();
  //     setUser(stored);
  //     return stored;
  //   }
  // };

  // const logout = async () => {
  //   await authService.logout();
  //   setUser(null);
  // };
// , login, register, refreshUser, logout,initializing
  return (
    <AuthContext.Provider value={{ user  }}>
      {children}
    </AuthContext.Provider>
  );
}
