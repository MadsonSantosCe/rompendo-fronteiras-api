import { Otp, OtpType } from "../entities/otp.entity";

export abstract class IOtpRepository {
  abstract findValidOtp(code: string, type: OtpType): Promise<Otp | null>;
  abstract create(otp: Omit<Otp, "id" | "deleted_at">): Promise<Otp>;
  abstract invalidateOtp(id: string): Promise<void>;
  abstract findValidOtpByUser(
    userId: string,
    type: OtpType
  ): Promise<Otp | null>;
}
