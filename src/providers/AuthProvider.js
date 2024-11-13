import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // {username, role}

  const login = (username, role) => setUser({ username, role });
  const logout = () => setUser(null);

  return (<AuthContext.Provider value={{ user, login, logout }}>
    {children}
  </AuthContext.Provider>);
}

export default AuthProvider;
