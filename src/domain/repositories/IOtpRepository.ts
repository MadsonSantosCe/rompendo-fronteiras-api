import { Otp, OtpType } from "../entities/Otp";

export interface IOtpRepository {
  findValidOtp(code: string, type: OtpType): Promise<Otp | null>;
  create(otp: Omit<Otp, "id" | "deletionAt">): Promise<Otp>;
  invalidateOtp(id: string): Promise<void>;
  findValidOtpByUser(userId: string, type: OtpType): Promise<Otp | null>;
}
