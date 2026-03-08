export interface CreateBusinessData {
  name: string;
  type: "restaurant" | "cafe" | "bar" | "patisserie" | "other";
}

export interface CreateUserData {
  businessId: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "admin" | "manager" | "waiter" | "cashier";
}

export interface CreateRefreshTokenData {
  userId: string;
  tokenId: string;
  expiresAt: Date;
}

export interface AccessTokenPayload {
  sub: string;
  businessId: string;
  role: string;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
}
