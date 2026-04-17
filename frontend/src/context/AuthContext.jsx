import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data.data);
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    const { token, id, name, email: userEmail, roles } = response.data.data;
    localStorage.setItem('token', token);
    const userData = { id, name, email: userEmail, roles: Array.isArray(roles) ? roles : Object.values(roles) };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const response = await authAPI.register({ name, email, password });
    const { token, id, name: userName, email: userEmail, roles } = response.data.data;
    localStorage.setItem('token', token);
    const userData = { id, name: userName, email: userEmail, roles: Array.isArray(roles) ? roles : Object.values(roles) };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const deleteAccount = async () => {
    await authAPI.deleteMe();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAdmin = () => {
    return user?.roles?.includes('ADMIN');
  };

  const isTechnician = () => {
    return user?.roles?.includes('TECHNICIAN');
  };

  const setAuthToken = async (token) => {
    localStorage.setItem('token', token);
    await loadUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, deleteAccount, isAdmin, isTechnician, loadUser, setAuthToken }}>
      {children}
    </AuthContext.Provider>
  );
};
