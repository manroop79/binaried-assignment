import { create } from 'zustand';
import { User, Post } from './types';
import { authApi } from './api';
import { initializeSocket, disconnectSocket } from './socket';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  updateUser: (user: User) => void;
}

interface PostState {
  posts: Post[];
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  updatePost: (postId: string, updates: Partial<Post>) => void;
  removePost: (postId: string) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    try {
      const data = await authApi.login({ email, password });
      localStorage.setItem('token', data.token);
      initializeSocket(data.token);
      set({ user: data.user, token: data.token, isAuthenticated: true });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  register: async (username: string, email: string, password: string, displayName: string) => {
    try {
      const data = await authApi.register({ username, email, password, displayName });
      localStorage.setItem('token', data.token);
      initializeSocket(data.token);
      set({ user: data.user, token: data.token, isAuthenticated: true });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    disconnectSocket();
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isLoading: false });
      return;
    }

    try {
      const user = await authApi.getCurrentUser();
      initializeSocket(token);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateUser: (user: User) => {
    set({ user });
  },
}));

export const usePostStore = create<PostState>((set) => ({
  posts: [],

  setPosts: (posts: Post[]) => {
    set({ posts });
  },

  addPost: (post: Post) => {
    set((state) => ({ posts: [post, ...state.posts] }));
  },

  updatePost: (postId: string, updates: Partial<Post>) => {
    set((state) => ({
      posts: state.posts.map((post) =>
        post._id === postId ? { ...post, ...updates } : post
      ),
    }));
  },

  removePost: (postId: string) => {
    set((state) => ({
      posts: state.posts.filter((post) => post._id !== postId),
    }));
  },
}));

