import { Test, TestingModule } from "@nestjs/testing";
import { ForgotPasswordUseCase } from "../usecases/forgot-password.usecase";
import { IUserRepository } from "../../domain/repositories/abstract-user.repository";
import { IOtpRepository } from "../../domain/repositories/abstract-otp.repository";
import { IEmailService } from "../../domain/services/abstract-email.service";
import { NotFoundException, ConflictException } from "@nestjs/common";
import { OtpType } from "../../domain/entities/otp.entity";

describe("ForgotPasswordUseCase", () => {
  let useCase: ForgotPasswordUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let otpRepository: jest.Mocked<IOtpRepository>;
  let emailService: jest.Mocked<IEmailService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForgotPasswordUseCase,
        {
          provide: IUserRepository,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
        {
          provide: IOtpRepository,
          useValue: {
            findValidOtpByUser: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: IEmailService,
          useValue: {
            sendPasswordResetEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(ForgotPasswordUseCase);
    userRepository = module.get(IUserRepository);
    otpRepository = module.get(IOtpRepository);
    emailService = module.get(IEmailService);
  });

  it("should send password reset email if user exists and no OTP in progress", async () => {
    const user = {
      id: "user-id",
      name: "Test User",
      email: "test@example.com",
      password: "hashedpassword",
      verified: true,
    };

    userRepository.findByEmail.mockResolvedValue(user);
    otpRepository.findValidOtpByUser.mockResolvedValue(null);

    await useCase.execute("test@example.com");

    expect(userRepository.findByEmail).toHaveBeenCalledWith("test@example.com");
    expect(otpRepository.findValidOtpByUser).toHaveBeenCalledWith(
      "user-id",
      OtpType.PASSWORD_RESET
    );
    expect(otpRepository.create).toHaveBeenCalled();
    expect(emailService.sendPasswordResetEmail).toHaveBeenCalled();
  });

  it("should throw NotFoundException if user does not exist", async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    const user = {
      id: "user-id",
      name: "Test User",
      email: "test@example.com",
      password: "hashedpassword",
      verified: true,
    };

    userRepository.findByEmail.mockResolvedValue(user);
    otpRepository.findValidOtpByUser.mockResolvedValue({
      id: "otp-id",
      user_id: "user-id",
      code: "123456",
      type: OtpType.PASSWORD_RESET,
      expires_at: new Date(Date.now() + 1000 * 60 * 10),
      deleted_at: null,
    });
  });

  it("should throw ConflictException if there is already a valid OTP", async () => {
    const user = {
      id: "user-id",
      name: "Test User",
      email: "test@example.com",
      password: "hashedpassword",
      verified: true,
    };
    
    userRepository.findByEmail.mockResolvedValue(user);
    otpRepository.findValidOtpByUser.mockResolvedValue({
      id: "otp-id",
      user_id: "user-id",
      code: "123456",
      type: OtpType.PASSWORD_RESET,
      expires_at: new Date(Date.now() + 1000 * 60 * 10),
      deleted_at: null,
    });

    await expect(useCase.execute("test@example.com")).rejects.toThrow(
      ConflictException
    );
  });
});
