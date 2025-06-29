import { Test, TestingModule } from "@nestjs/testing";
import { ResetPasswordUseCase } from "../usecases/reset-password.usecase";
import { IOtpRepository } from "../../domain/repositories/abstract-otp.repository";
import { IUserRepository } from "../../domain/repositories/abstract-user.repository";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { OtpType } from "../../domain/entities/otp.entity";

describe("ResetPasswordUseCase", () => {
  let useCase: ResetPasswordUseCase;
  let otpRepository: jest.Mocked<IOtpRepository>;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResetPasswordUseCase,
        {
          provide: IOtpRepository,
          useValue: {
            findValidOtp: jest.fn(),
            invalidateOtp: jest.fn(),
          },
        },
        {
          provide: IUserRepository,
          useValue: {
            findById: jest.fn(),
            updatePassword: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(ResetPasswordUseCase);
    otpRepository = module.get(IOtpRepository);
    userRepository = module.get(IUserRepository);
  });

  it("should reset password with valid token and user", async () => {
    const otp = {
      id: "otp-id",
      user_id: "user-id",
      code: "123456",
      type: OtpType.PASSWORD_RESET,
      expires_at: new Date(Date.now() + 1000 * 60 * 10),
      deleted_at: null,
    };
    const user = {
      id: "user-id",
      name: "Test User",
      email: "test@example.com",
      password: "hashedpassword",
      verified: true,
    };

    otpRepository.findValidOtp.mockResolvedValue(otp);
    userRepository.findById.mockResolvedValue(user);

    const result = await useCase.execute("valid-token", "newpassword");

    expect(otpRepository.findValidOtp).toHaveBeenCalledWith(
      "valid-token",
      OtpType.PASSWORD_RESET
    );
    expect(userRepository.findById).toHaveBeenCalledWith("user-id");
    expect(userRepository.updatePassword).toHaveBeenCalled();
    expect(otpRepository.invalidateOtp).toHaveBeenCalledWith("otp-id");
    expect(result).toBe(true);
  });

  it("should throw BadRequestException if token is missing", async () => {
    await expect(useCase.execute("", "newpassword")).rejects.toThrow(
      BadRequestException
    );
  });

  it("should throw BadRequestException if otp is invalid", async () => {
    otpRepository.findValidOtp.mockResolvedValue(null);

    await expect(
      useCase.execute("invalid-token", "newpassword")
    ).rejects.toThrow(BadRequestException);
  });

  it("should throw NotFoundException if user is not found", async () => {
    const otp = {
      id: "otp-id",
      user_id: "user-id",
      code: "123456",
      type: OtpType.PASSWORD_RESET,
      expires_at: new Date(Date.now() + 1000 * 60 * 10),
      deleted_at: null,
    };
    otpRepository.findValidOtp.mockResolvedValue(otp);
    userRepository.findById.mockResolvedValue(null as any);

    await expect(useCase.execute("valid-token", "newpassword")).rejects.toThrow(
      NotFoundException
    );
  });
});
