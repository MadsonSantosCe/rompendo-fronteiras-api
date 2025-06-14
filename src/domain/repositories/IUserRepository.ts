import { User } from "../entities/User";

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(
    user: Omit<User, "id" | "verified"> & { password: string }
  ): Promise<User>;
  updateVerified(id: string, verified: boolean): Promise<User>;
  updatePassword(id: string, password: string): Promise<void>;
}
