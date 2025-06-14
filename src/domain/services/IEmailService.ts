export interface IEmailService {
  sendVerificationEmail(email: string, code: string): Promise<void>;
  sendPasswordResetEmail(email: string, link: string): Promise<void>;
}
