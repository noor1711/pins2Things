"use client"; // auth context needs to be fetched and stored client-side
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const authenticateUser = async (board) => {
    try {
      if (!!board) {
        await fetch(
          `${process.env.NEXT_PUBLIC_BOARD_URL}?board=${encodeURIComponent(
            board
          )}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
      }
      const CLIENT_ID = `${process.env.NEXT_PUBLIC_PINTEREST_CLIENT_ID}`;
      const REDIRECT_URI = `${process.env.NEXT_PUBLIC_PINTEREST_REDIRECT_URI}`;
      const SCOPES = "boards:read,pins:read,user_accounts:read";
      const AUTH_URL = "https://pinterest.com/oauth/";

      const authUrl = `${AUTH_URL}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPES}`;

      // Navigate the user's browser to the URL, which will trigger the app link
      window.location.href = authUrl;
    } catch (error) {
      console.error("Error during authentication:", error);
    }
  };

  useEffect(() => {
    // get auth info from end point
    fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}`, {
      credentials: "include",
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        setIsAuthenticated(!!data?.isAuthenticated);
        // create an error context
      })
      .finally(() => {
        setIsLoadingAuth(false);
      });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoadingAuth,
        authenticateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
