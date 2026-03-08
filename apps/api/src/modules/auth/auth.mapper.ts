import type { UserResponse } from "@repo/shared/types/user";
import type { BusinessResponse } from "@repo/shared/types/business";

export function toUserResponse(user: {
  id: string;
  businessId: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
}): UserResponse {
  return {
    id: user.id,
    businessId: user.businessId,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
  };
}

export function toBusinessResponse(business: {
  id: string;
  name: string;
  type: string;
  phone: string | null;
  address: string | null;
  currency: string;
  createdAt: Date;
}): BusinessResponse {
  return {
    id: business.id,
    name: business.name,
    type: business.type,
    phone: business.phone,
    address: business.address,
    currency: business.currency,
    createdAt: business.createdAt.toISOString(),
  };
}
