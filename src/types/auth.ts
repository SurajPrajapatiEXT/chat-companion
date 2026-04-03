export interface LoginRequest {
  username: string;
  password: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  profilePic: string;
  isFirstLogin: boolean;
  createdAt: string;
}

export interface LoginResponse {
  user: UserProfile;
  token: string;
  expiresIn: number;
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  expiresAt: number | null;
  isAuthenticated: boolean;
}
