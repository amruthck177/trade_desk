import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  
  login: (userData) => {
    localStorage.setItem('user', JSON.stringify({
      _id: userData._id,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      businessName: userData.businessName,
      gstNumber: userData.gstNumber,
      upiId: userData.upiId,
      logoUrl: userData.logoUrl,
      invoicePrefix: userData.invoicePrefix,
    }));
    localStorage.setItem('token', userData.token);
    
    set({
      user: userData,
      token: userData.token,
    });
  },
  
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
  
  updateUser: (updatedData) => {
    const currentUser = JSON.parse(localStorage.getItem('user')) || {};
    const newUser = { ...currentUser, ...updatedData };
    localStorage.setItem('user', JSON.stringify(newUser));
    set({ user: newUser });
  }
}));
