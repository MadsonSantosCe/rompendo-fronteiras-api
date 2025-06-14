export enum OtpType {
  EMAIL_VERIFICATION = "EMAIL_VERIFICATION",
  PASSWORD_RESET = "PASSWORD_RESET",
}

export class Otp {
  constructor(
    public id: string,
    public code: string,
    public type: OtpType,
    public userId: string,
    public expiresAt: Date,
    public deletionAt: Date | null
  ) {}
}
