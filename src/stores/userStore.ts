import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  createdAt: string;
  lastActive: string;
}

interface UserStore {
  users: User[];
  currentUserId: string | null;
  addUser: (name: string) => User;
  selectUser: (userId: string) => void;
  deleteUser: (userId: string) => void;
  getCurrentUser: () => User | null;
  logout: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      users: [],
      currentUserId: null,

      addUser: (name: string) => {
        const newUser: User = {
          id: crypto.randomUUID(),
          name: name.trim(),
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString()
        };

        set((state) => ({
          users: [...state.users, newUser]
        }));

        return newUser;
      },

      selectUser: (userId: string) => {
        set((state) => {
          const updatedUsers = state.users.map(user =>
            user.id === userId
              ? { ...user, lastActive: new Date().toISOString() }
              : user
          );
          return {
            users: updatedUsers,
            currentUserId: userId
          };
        });
      },

      deleteUser: (userId: string) => {
        set((state) => {
          const filteredUsers = state.users.filter(user => user.id !== userId);
          const newCurrentUserId = state.currentUserId === userId ? null : state.currentUserId;
          
          // Clear the user's progress data from localStorage
          localStorage.removeItem(`science-progress-${userId}`);
          
          return {
            users: filteredUsers,
            currentUserId: newCurrentUserId
          };
        });
      },

      getCurrentUser: () => {
        const state = get();
        return state.users.find(user => user.id === state.currentUserId) || null;
      },

      logout: () => {
        set({ currentUserId: null });
      }
    }),
    {
      name: 'science-users'
    }
  )
);