"use client"; // auth context needs to be fetched and stored client-side
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const router = useRouter(); // Hook to programmatically navigate users

  const authenticateUser = async () => {
    try {
      router.push(`${process.env.NEXT_PUBLIC_BACKEND_URL}`);
    } catch (error) {
      console.error("Error during authentication:", error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      // get auth info from end point
      fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}`, {
        credentials: "include",
        method: "GET",
      })
        .then((response) => response.json())
        .then((data) => {
          setIsAuthenticated(!!data?.isAuthenticated);
          if (!data?.isAuthenticated) {
            authenticateUser();
          }
        })
        .finally(() => {
          setIsLoadingAuth(false);
        });
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoadingAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
