/** User object returned on login / reset-password (full profile). */
export type AuthUser = {
  id: string;
  email: string;
  _verified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  collection?: string;
};

export type LoginResponse = {
  message: string;
  user: AuthUser;
  token: string;
  exp: number;
};

export type LogoutResponse = {
  message: string;
};

export type RefreshTokenResponse = {
  message: string;
  refreshedToken: string;
  exp: number;
  user: Pick<AuthUser, 'id' | 'email'> & { collection?: string };
};

export type ForgotPasswordResponse = {
  message: string;
};

export type ResetPasswordResponse = {
  message: string;
  token: string;
  user: AuthUser;
};
