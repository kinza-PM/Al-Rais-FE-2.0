// User type (for both authenticated and guest users)
export interface User {
  id: string;
  email?: string; // Optional for guest users
  emailVerified?: boolean;
  name?: string;
  full_name?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
  last_seen_at?: string;
  isGuest?: boolean; // Flag to indicate if user is a guest
}

export type SignupMethod = "EMAIL" | "PHONE";

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface SignupForm {
  title: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender: string;
  signupMethod?: SignupMethod;
}

// Forgot password form types
export interface ForgotPasswordForm {
  email: string;
}

export interface OTPVerificationForm {
  email: string;
  otp: string;
}

export interface ResetPasswordForm {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

// Session type
export interface UserSession {
  id?: string;
  session_id?: string;
  user_id?: string;
  device_info?: string;
  ip_address?: string;
  user_agent?: string;
  is_guest?: boolean;
  created_at?: string;
  last_seen_at?: string;
  expires_at?: string;
}

// Response type
export interface AuthResponse {
  success: boolean;
  user?: User;
  session?: UserSession;
  message?: string;
  errorCode?: string;
  errorRef?: string;
  nextStep?: string;
  requiresConfirmation?: boolean;
  isGuest?: boolean;
}
