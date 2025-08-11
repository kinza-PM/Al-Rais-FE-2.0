import { signIn, signUp, signOut, getCurrentUser, fetchAuthSession, confirmSignUp, resendSignUpCode, resetPassword, confirmResetPassword } from 'aws-amplify/auth';
import type { LoginForm, SignupForm, AuthResponse, User, ForgotPasswordForm, OTPVerificationForm, ResetPasswordForm } from '../types';

export class AuthService {
  /**
   * Sign in user
   */
  static async signIn(credentials: LoginForm): Promise<AuthResponse> {
    try {
      const { isSignedIn } = await signIn({
        username: credentials.email,
        password: credentials.password,
      });
      if (isSignedIn) {
        const user = await this.getCurrentUser();
        return {
          success: true,
          user: user || undefined,
          message: 'Login successful',
        };
      }

      return {
        success: false,
        message: 'Login failed',
      };
    } catch (error: unknown) {
      const errorObj = error as Record<string, unknown>;
      const errorMessage = (errorObj.message as string) || (error as Error).message || 'Login failed';
      
      // Handle specific AWS Cognito errors
      if (errorObj.name === 'UserNotConfirmedException') {
        return {
          success: false,
          message: 'Account not confirmed. Please check your email.',
        };
      }
      
      if (errorObj.name === 'NotAuthorizedException') {
        return {
          success: false,
          message: 'Invalid credentials or user not confirmed.',
        };
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Sign up user
   */
  static async signUp(userData: SignupForm): Promise<AuthResponse> {
    try {
      const result = await signUp({
        username: userData.email,
        password: userData.password,
        options: {
          userAttributes: {
            email: userData.email,
            name: userData.name,
          },
        },
      });
      
      // Check if user needs confirmation
      if (result.nextStep?.signUpStep === 'CONFIRM_SIGN_UP') {
        return {
          success: true,
          message: 'Account created! Please check your email to confirm your account.',
          requiresConfirmation: true
        };
      }

      return {
        success: true,
        message: 'Signup successful',
      };
    } catch (error: unknown) {
      const errorObj = error as Record<string, unknown>;
      const errorMessage = (errorObj.message as string) || (error as Error).message || 'Signup failed';
      
      // Handle specific signup errors
      if (errorMessage.includes('SignUp is not permitted')) {
        return {
          success: false,
          message: 'Self-registration is disabled. Please contact support or check your AWS Cognito User Pool settings.',
        };
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Sign out user
   */
  static async signOut(): Promise<AuthResponse> {
    try {
      await signOut();
      return {
        success: true,
        message: 'Logout successful',
      };
    } catch (error: unknown) {
      return {
        success: false,
        message: (error as Error).message || 'Logout failed',
      };
    }
  }

  /**
   * Get current user
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { userId } = await getCurrentUser();
      
      const session = await fetchAuthSession();
      
      if (session.tokens) {
        const idToken = session.tokens.idToken;
        const payload = idToken?.payload;
        
        const user = {
          id: userId,
          email: payload?.email as string,
          emailVerified: payload?.email_verified as boolean,
          name: payload?.name as string,
        };
        
        return user;
      }
      
      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  /**
   * Confirm signup with OTP code
   */
  static async confirmSignUp(email: string, confirmationCode: string): Promise<AuthResponse> {
    try {
      await confirmSignUp({
        username: email,
        confirmationCode: confirmationCode,
      });

      return {
        success: true,
        message: 'Account confirmed successfully!',
      };
    } catch (error: unknown) {
      console.error(error);
      const errorObj = error as Record<string, unknown>;
      const errorMessage = (errorObj.message as string) || (error as Error).message || 'Confirmation failed';
      
      // Handle specific AWS Cognito errors
      if (errorObj.name === 'CodeMismatchException') {
        return {
          success: false,
          message: 'Invalid confirmation code. Please try again.',
        };
      }
      
      if (errorObj.name === 'ExpiredCodeException') {
        return {
          success: false,
          message: 'Confirmation code has expired. Please request a new one.',
        };
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Resend confirmation code
   */
  static async resendConfirmationCode(email: string): Promise<AuthResponse> {
    try {
      await resendSignUpCode({
        username: email,
      });

      return {
        success: true,
        message: 'Confirmation code sent to your email!',
      };
    } catch (error: unknown) {
      console.error(' AuthService: resendConfirmationCode error:', error);
      return {
        success: false,
        message: (error as Error).message || 'Failed to resend confirmation code',
      };
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const session = await fetchAuthSession();
      
      const isAuth = session.tokens !== undefined;
      return isAuth;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  /**
   * Initiate forgot password flow
   */
  static async forgotPassword(forgotPasswordData: ForgotPasswordForm): Promise<AuthResponse> {
    try {
      await resetPassword({
        username: forgotPasswordData.email,
      });

      return {
        success: true,
        message: 'Password reset code sent to your email!',
      };
    } catch (error: unknown) {
      console.error(' AuthService: forgotPassword error:', error);
      const errorObj = error as Record<string, unknown>;
      const errorMessage = (errorObj.message as string) || (error as Error).message || 'Failed to send reset code';
      
      // Handle specific AWS Cognito errors
      if (errorObj.name === 'UserNotFoundException') {
        return {
          success: false,
          message: 'No account found with this email address.',
        };
      }
      
      if (errorObj.name === 'LimitExceededException') {
        return {
          success: false,
          message: 'Too many requests. Please try again later.',
        };
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Verify OTP code for password reset
   */
  static async verifyResetCode(otpData: OTPVerificationForm): Promise<AuthResponse> {
    try {
      // AWS Amplify doesn't have a separate verify method, so we'll use this for validation
      // The actual verification happens in confirmResetPassword
      
      if (!otpData.otp || otpData.otp.length !== 6) {
        return {
          success: false,
          message: 'Please enter a valid 6-digit code.',
        };
      }

      return {
        success: true,
        message: 'Code verified successfully!',
      };
    } catch (error: unknown) {
      console.error(' AuthService: verifyResetCode error:', error);
      return {
        success: false,
        message: (error as Error).message || 'Failed to verify code',
      };
    }
  }

  /**
   * Reset password with OTP code
   */
  static async resetPasswordWithCode(resetData: ResetPasswordForm): Promise<AuthResponse> {
    try {
      if (resetData.newPassword !== resetData.confirmPassword) {
        return {
          success: false,
          message: 'Passwords do not match.',
        };
      }

      await confirmResetPassword({
        username: resetData.email,
        confirmationCode: resetData.otp,
        newPassword: resetData.newPassword,
      });

      return {
        success: true,
        message: 'Password reset successfully! You can now login with your new password.',
      };
    } catch (error: unknown) {
      console.error(' AuthService: resetPasswordWithCode error:', error);
      const errorObj = error as Record<string, unknown>;
      const errorMessage = (errorObj.message as string) || (error as Error).message || 'Failed to reset password';
      
      // Handle specific AWS Cognito errors
      if (errorObj.name === 'CodeMismatchException') {
        return {
          success: false,
          message: 'Invalid verification code. Please try again.',
        };
      }
      
      if (errorObj.name === 'ExpiredCodeException') {
        return {
          success: false,
          message: 'Verification code has expired. Please request a new one.',
        };
      }
      
      if (errorObj.name === 'InvalidPasswordException') {
        return {
          success: false,
          message: 'Password does not meet requirements. Please try a stronger password.',
        };
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  }
} 