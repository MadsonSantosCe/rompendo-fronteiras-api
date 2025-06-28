import { AuthUser } from "../entities/user.entity";

export abstract class IUserRepository {
  abstract findByEmail(email: string): Promise<AuthUser | null>;
  abstract findById(id: string): Promise<AuthUser>;
  abstract create(
    user: Omit<AuthUser, "id" | "verified"> & { password: string }
  ): Promise<AuthUser>;
  abstract updateVerified(
    id: string,
    verified: boolean
  ): Promise<AuthUser | null>;
  abstract updatePassword(id: string, password: string): Promise<void>;
}
