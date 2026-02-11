import {
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  fetchAuthSession,
  confirmSignUp,
  resendSignUpCode,
  resetPassword,
  confirmResetPassword,
} from "aws-amplify/auth";
import type {
  LoginForm,
  SignupForm,
  SignupMethod,
  AuthResponse,
  User,
  ForgotPasswordForm,
  OTPVerificationForm,
  ResetPasswordForm,
} from "../types";

interface RemoteUserPayload {
  userId: string;
  email: string | null;
  phoneNumber: string | null;
  name: string;
  signupMethod: SignupMethod;
}

interface RemoteUserCreationResult {
  userId: string;
  createdAt: string;
}

interface RemoteUserUpdatePayload {
  userId: string;
  createdAt: string;
  allowNotifications: boolean;
}

export class AuthService {
  private static readonly GENERIC_ERROR =
    "Something went wrong. Please try again.";
  private static readonly USED_RESET_CODES_KEY = "usedResetCodes";

  private static loadUsedResetCodes(): Record<string, string[]> {
    if (typeof window === "undefined" || !window.sessionStorage) {
      return {};
    }

    try {
      const raw = window.sessionStorage.getItem(
        AuthService.USED_RESET_CODES_KEY,
      );
      const parsed = raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  private static saveUsedResetCodes(data: Record<string, string[]>): void {
    if (typeof window === "undefined" || !window.sessionStorage) {
      return;
    }

    try {
      window.sessionStorage.setItem(
        AuthService.USED_RESET_CODES_KEY,
        JSON.stringify(data),
      );
    } catch {
      // Ignore storage errors (private mode, quota, etc.)
    }
  }

  static isResetCodeUsed(email: string, otp: string): boolean {
    if (!email || !otp) return false;
    const identifier = email.trim().toLowerCase();
    const used = AuthService.loadUsedResetCodes();
    return Array.isArray(used[identifier]) && used[identifier].includes(otp);
  }

  static markResetCodeUsed(email: string, otp: string): void {
    if (!email || !otp) return;
    const identifier = email.trim().toLowerCase();
    const used = AuthService.loadUsedResetCodes();
    const list = Array.isArray(used[identifier]) ? used[identifier] : [];
    if (!list.includes(otp)) {
      list.push(otp);
      used[identifier] = list;
      AuthService.saveUsedResetCodes(used);
    }
  }

  private static getFriendlyPasswordMessage(errorMessage: string): string {
    const msg = (errorMessage || "").toLowerCase();

    // Cognito sometimes returns very technical validation messages; never show those verbatim.
    if (
      msg.includes("failed to satisfy constraint") ||
      msg.includes("regular expression pattern")
    ) {
      return "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.";
    }

    if (msg.includes("password") && msg.includes("not long enough")) {
      return "Password is too short. Please use a longer password.";
    }

    if (msg.includes("password") && msg.includes("conform with policy")) {
      return "Password does not meet requirements. Please try a stronger password.";
    }

    return "Password does not meet requirements. Please try a stronger password.";
  }

  /**
   * Sign in user
   */
  static async signIn(credentials: LoginForm): Promise<AuthResponse> {
    try {
      // Use email or phone as username (phone numbers should be in E.164 format)
      const username = credentials.email.trim();

      const { isSignedIn, nextStep } = await signIn({
        username,
        password: credentials.password,
      });

      if (nextStep.signInStep === "CONFIRM_SIGN_UP") {
        const isPhoneNumber = username.startsWith("+");
        const message = isPhoneNumber
          ? "Account not confirmed. Please check your phone for any messages."
          : "Account not confirmed. Please check your email.";

        return {
          success: false,
          message,
          errorCode: "USER_NOT_CONFIRMED",
          nextStep: nextStep.signInStep,
        };
      }

      if (nextStep.signInStep && nextStep.signInStep !== "DONE") {
        return {
          success: false,
          message:
            "Additional verification is required to complete sign in. Please follow the verification steps.",
          errorCode: "MFA_REQUIRED",
          nextStep: nextStep.signInStep,
        };
      }

      if (isSignedIn) {
        const user = await this.getCurrentUser();
        return {
          success: true,
          user: user || undefined,
          message: "Login successful",
        };
      }

      return {
        success: false,
        message: "Incorrect email or password. Please try again.",
        errorCode: "INVALID_CREDENTIALS",
      };
    } catch (error: unknown) {
      const errorObj = error as Record<string, unknown>;
      const metadata = errorObj?.$metadata as
        | { httpStatusCode?: number; requestId?: string }
        | undefined;
      const requestId = metadata?.requestId;
      // Handle specific auth errors (user-facing)
      if (errorObj.name === "UserNotConfirmedException") {
        const isPhoneNumber = credentials.email.trim().startsWith("+");
        const message = isPhoneNumber
          ? "Account not confirmed. Please check your phone for the confirmation code."
          : "Account not confirmed. Please check your email.";

        return {
          success: false,
          message,
          errorCode: "USER_NOT_CONFIRMED",
          errorRef: requestId,
        };
      }

      if (errorObj.name === "UserNotFoundException") {
        return {
          success: false,
          message: "No account found with this email or phone number.",
          errorCode: "USER_NOT_FOUND",
          errorRef: requestId,
        };
      }

      if (errorObj.name === "NotAuthorizedException") {
        return {
          success: false,
          message: "Incorrect email or password. Please try again.",
          errorCode: "INVALID_CREDENTIALS",
          errorRef: requestId,
        };
      }

      if (errorObj.name === "PasswordResetRequiredException") {
        return {
          success: false,
          message: "Password reset required. Please reset your password.",
          errorCode: "PASSWORD_RESET_REQUIRED",
          errorRef: requestId,
        };
      }

      if (errorObj.name === "UserDisabledException") {
        return {
          success: false,
          message: "Your account is disabled. Please contact support.",
          errorCode: "USER_DISABLED",
          errorRef: requestId,
        };
      }

      if (
        errorObj.name === "LimitExceededException" ||
        errorObj.name === "TooManyRequestsException"
      ) {
        return {
          success: false,
          message: "Too many attempts. Please try again later.",
          errorCode: "TOO_MANY_REQUESTS",
          errorRef: requestId,
        };
      }

      if (errorObj.name === "NetworkError") {
        return {
          success: false,
          message:
            "No internet connection. Check your connection and try again.",
          errorCode: "NETWORK_ERROR",
          errorRef: requestId,
        };
      }

      if (
        typeof metadata?.httpStatusCode === "number" &&
        metadata.httpStatusCode >= 500
      ) {
        return {
          success: false,
          message: "Something went wrong on our side. Please try again later.",
          errorCode: "SERVER_ERROR",
          errorRef: requestId,
        };
      }

      return {
        success: false,
        message: AuthService.GENERIC_ERROR,
        errorCode: "UNKNOWN_ERROR",
        errorRef: requestId,
      };
    }
  }

  /**
   * Sign up user
   */
  static async signUp(userData: SignupForm): Promise<AuthResponse> {
    try {
      const identifier = userData.email.trim();
      // Check if email is actually a phone number (starts with +)
      const isPhoneNumber = identifier.startsWith("+");

      // Prepare user attributes
      const userAttributes: Record<string, string> = {
        name: userData.name,
        // title: userData.title,
      };

      // If it's a phone number, use phone_number attribute, otherwise use email
      if (isPhoneNumber) {
        userAttributes.phone_number = identifier; // Phone in E.164 format
      } else {
        userAttributes.email = identifier;
      }

      const result = await signUp({
        username: identifier, // Use email or phone as username
        password: userData.password,
        options: {
          userAttributes,
        },
      });
      // console.log("signUp response:", result);

      // Check if user needs confirmation
      if (result.nextStep?.signUpStep === "CONFIRM_SIGN_UP") {
        const confirmationMessage = isPhoneNumber
          ? "Account created! Please check your phone for the confirmation code."
          : "Account created! Please check your email to confirm your account.";

        return {
          success: true,
          message: confirmationMessage,
          requiresConfirmation: true,
        };
      }

      return {
        success: true,
        message: "Signup successful",
      };
    } catch (error: unknown) {
      const errorObj = error as Record<string, unknown>;
      const errorMessage = (errorObj.message as string) || "";
      // Handle known signup errors (user-facing)
      if (
        errorObj.name === "InvalidPasswordException" ||
        errorMessage.toLowerCase().includes("password")
      ) {
        return {
          success: false,
          message: AuthService.getFriendlyPasswordMessage(errorMessage),
        };
      }

      if (errorObj.name === "UsernameExistsException") {
        return {
          success: false,
          message:
            "An account already exists with this email/phone. Please log in instead.",
        };
      }

      if (errorMessage.includes("SignUp is not permitted")) {
        return {
          success: false,
          message: "Sign up is currently unavailable. Please contact support.",
        };
      }

      return {
        success: false,
        message: AuthService.GENERIC_ERROR,
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
        message: "Logout successful",
      };
    } catch (error: unknown) {
      return {
        success: false,
        message: (error as Error).message || "Logout failed",
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

        const user: User = {
          id: userId,
          email: (payload?.email as string) || "",
          phone: (payload?.phone_number as string) || "",
          emailVerified: (payload?.email_verified as boolean) ?? false,
          name: (payload?.name as string) || "",
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
  static async confirmSignUp(
    emailOrPhone: string,
    confirmationCode: string,
  ): Promise<AuthResponse> {
    try {
      const identifier = emailOrPhone.trim();

      await confirmSignUp({
        username: identifier, // Can be email or phone number
        confirmationCode: confirmationCode,
      });

      return {
        success: true,
        message: "Account confirmed successfully!",
      };
    } catch (error: unknown) {
      console.error(error);
      const errorObj = error as Record<string, unknown>;
      // Handle known confirmation errors (user-facing)
      if (errorObj.name === "CodeMismatchException") {
        return {
          success: false,
          message: "Invalid confirmation code. Please try again.",
        };
      }

      if (errorObj.name === "ExpiredCodeException") {
        return {
          success: false,
          message: "Confirmation code has expired. Please request a new one.",
        };
      }

      return {
        success: false,
        message: AuthService.GENERIC_ERROR,
      };
    }
  }

  /**
   * Resend confirmation code
   */
  static async resendConfirmationCode(
    emailOrPhone: string,
  ): Promise<AuthResponse> {
    try {
      const identifier = emailOrPhone.trim();

      await resendSignUpCode({
        username: identifier, // Can be email or phone number
      });

      const isPhoneNumber = identifier.startsWith("+");
      const message = isPhoneNumber
        ? "Confirmation code sent to your phone!"
        : "Confirmation code sent to your email!";

      return {
        success: true,
        message,
      };
    } catch (error: unknown) {
      console.error("AuthService: resendConfirmationCode error:", error);
      return {
        success: false,
        message: AuthService.GENERIC_ERROR,
      };
    }
  }

  /**
   * Create verified user record in external system
   */
  static async createRemoteUserRecord(
    payload: RemoteUserPayload,
  ): Promise<RemoteUserCreationResult | null> {
    try {
      const response = await fetch(
        "https://yjz5d5q2i0.execute-api.eu-west-1.amazonaws.com/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AuthService: Failed to create remote user:", errorText);
        return null;
      }

      const data = (await response.json()) as RemoteUserCreationResult;
      return data;
    } catch (error) {
      console.error("AuthService: Error creating remote user:", error);
      return null;
    }
  }

  /**
   * Update remote user preferences
   */
  static async updateRemoteUserNotifications(
    payload: RemoteUserUpdatePayload,
  ): Promise<boolean> {
    try {
      const { userId, createdAt, ...body } = payload;
      const response = await fetch(
        `https://yjz5d5q2i0.execute-api.eu-west-1.amazonaws.com/users/${encodeURIComponent(
          userId,
        )}/${encodeURIComponent(createdAt)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AuthService: Failed to update remote user:", errorText);
        return false;
      }

      return true;
    } catch (error) {
      console.error("AuthService: Error updating remote user:", error);
      return false;
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
  static async forgotPassword(
    forgotPasswordData: ForgotPasswordForm,
  ): Promise<AuthResponse> {
    try {
      const identifier = forgotPasswordData.email.trim();

      await resetPassword({
        username: identifier, // Can be email or phone
      });

      const isPhoneNumber = identifier.startsWith("+");
      const message = isPhoneNumber
        ? "Password reset code sent to your phone!"
        : "Password reset code sent to your email!";

      return {
        success: true,
        message,
      };
    } catch (error: unknown) {
      console.error("AuthService: forgotPassword error:", error);
      const errorObj = error as Record<string, unknown>;
      // Handle known errors (user-facing)
      if (errorObj.name === "UserNotFoundException") {
        return {
          success: false,
          message: "No account found with this email address.",
        };
      }

      if (errorObj.name === "LimitExceededException") {
        return {
          success: false,
          message: "Too many requests. Please try again later.",
        };
      }

      if (
        errorObj.name === "InvalidParameterException" &&
        typeof errorObj.message === "string" &&
        errorObj.message.toLowerCase().includes("verified")
      ) {
        return {
          success: false,
          message:
            "Your email address is not verified. Please verify it first.",
        };
      }

      return {
        success: false,
        message: AuthService.GENERIC_ERROR,
      };
    }
  }

  /**
   * Verify OTP code for password reset
   */
  static async verifyResetCode(
    otpData: OTPVerificationForm,
  ): Promise<AuthResponse> {
    try {
      if (!otpData.otp || otpData.otp.length !== 6) {
        return {
          success: false,
          message: "Please enter a valid 6-digit code.",
        };
      }

      if (AuthService.isResetCodeUsed(otpData.email, otpData.otp)) {
        return {
          success: false,
          message: "This code has expired. Please request a new one.",
        };
      }

      return {
        success: true,
        message: "Code verified successfully!",
      };
    } catch (error: unknown) {
      console.error("AuthService: verifyResetCode error:", error);
      return {
        success: false,
        message: AuthService.GENERIC_ERROR,
      };
    }
  }

  /**
   * Reset password with OTP code
   */
  static async resetPasswordWithCode(
    resetData: ResetPasswordForm,
  ): Promise<AuthResponse> {
    try {
      if (!resetData.otp || resetData.otp.length !== 6) {
        return {
          success: false,
          message: "Please enter a valid 6-digit verification code.",
        };
      }

      if (resetData.newPassword !== resetData.confirmPassword) {
        return {
          success: false,
          message: "Passwords do not match.",
        };
      }

      const identifier = resetData.email.trim();

      if (AuthService.isResetCodeUsed(identifier, resetData.otp)) {
        return {
          success: false,
          message: "This code has expired. Please request a new one.",
        };
      }

      await confirmResetPassword({
        username: identifier,
        confirmationCode: resetData.otp,
        newPassword: resetData.newPassword,
      });

      AuthService.markResetCodeUsed(identifier, resetData.otp);

      return {
        success: true,
        message:
          "Password reset successfully! You can now login with your new password.",
      };
    } catch (error: unknown) {
      console.error("AuthService: resetPasswordWithCode error:", error);
      const errorObj = error as Record<string, unknown>;
      // Handle known errors (user-facing)
      if (errorObj.name === "CodeMismatchException") {
        return {
          success: false,
          message: "Invalid verification code. Please try again.",
        };
      }

      if (errorObj.name === "ExpiredCodeException") {
        return {
          success: false,
          message: "Verification code has expired. Please request a new one.",
        };
      }

      if (errorObj.name === "InvalidPasswordException") {
        return {
          success: false,
          message:
            "Password does not meet requirements. Please try a stronger password.",
        };
      }

      return {
        success: false,
        message: AuthService.GENERIC_ERROR,
      };
    }
  }
}
