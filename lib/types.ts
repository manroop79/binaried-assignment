export interface User {
  _id: string;
  username: string;
  email: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  followers: string[];
  following: string[];
  createdAt: string;
  updatedAt: string;
  followersCount?: number;
  followingCount?: number;
  postCount?: number;
}

export interface Post {
  _id: string;
  author: User;
  content: string;
  images?: string[];
  likes: string[];
  replyTo?: string;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  errors?: any[];
}

