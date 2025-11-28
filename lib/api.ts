import axios from 'axios';
import { AuthResponse, User, Post } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  register: async (data: {
    username: string;
    email: string;
    password: string;
    displayName: string;
  }): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// User API
export const userApi = {
  getProfile: async (username: string): Promise<User> => {
    const response = await api.get(`/users/${username}`);
    return response.data;
  },

  updateProfile: async (data: { displayName?: string; bio?: string }): Promise<User> => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  uploadAvatar: async (file: File): Promise<{ avatar: string; user: User }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  uploadCover: async (file: File): Promise<{ coverImage: string; user: User }> => {
    const formData = new FormData();
    formData.append('cover', file);
    const response = await api.post('/users/cover', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  followUser: async (userId: string): Promise<{ message: string; isFollowing: boolean }> => {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data;
  },

  getFollowers: async (userId: string): Promise<User[]> => {
    const response = await api.get(`/users/${userId}/followers`);
    return response.data;
  },

  getFollowing: async (userId: string): Promise<User[]> => {
    const response = await api.get(`/users/${userId}/following`);
    return response.data;
  },

  searchUsers: async (query: string): Promise<User[]> => {
    const response = await api.get(`/users/search/${query}`);
    return response.data;
  },
};

// Post API
export const postApi = {
  createPost: async (data: {
    content: string;
    images?: File[];
    replyTo?: string;
  }): Promise<Post> => {
    const formData = new FormData();
    formData.append('content', data.content);
    if (data.replyTo) {
      formData.append('replyTo', data.replyTo);
    }
    if (data.images) {
      data.images.forEach((image) => {
        formData.append('images', image);
      });
    }

    const response = await api.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getFeed: async (page = 1): Promise<Post[]> => {
    const response = await api.get(`/posts/feed?page=${page}`);
    return response.data;
  },

  getExplore: async (page = 1): Promise<Post[]> => {
    const response = await api.get(`/posts/explore?page=${page}`);
    return response.data;
  },

  getPost: async (postId: string): Promise<Post> => {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  },

  getReplies: async (postId: string): Promise<Post[]> => {
    const response = await api.get(`/posts/${postId}/replies`);
    return response.data;
  },

  getUserPosts: async (username: string, page = 1): Promise<Post[]> => {
    const response = await api.get(`/posts/user/${username}?page=${page}`);
    return response.data;
  },

  likePost: async (postId: string): Promise<{ message: string; isLiked: boolean; likesCount: number }> => {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  },

  deletePost: async (postId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  },

  searchPosts: async (query: string): Promise<Post[]> => {
    const response = await api.get(`/posts/search/${query}`);
    return response.data;
  },
};

