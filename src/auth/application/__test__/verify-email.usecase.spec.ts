import { Test, TestingModule } from "@nestjs/testing";
import { VerifyEmailUseCase } from "../usecases/verify-email.usecase";
import { IOtpRepository } from "../../domain/repositories/abstract-otp.repository";
import { IUserRepository } from "../../domain/repositories/abstract-user.repository";
import { ITokenService } from "../../domain/services/abstract-token.service";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { OtpType } from "../../domain/entities/otp.entity";

describe("VerifyEmailUseCase", () => {
  let useCase: VerifyEmailUseCase;
  let otpRepository: jest.Mocked<IOtpRepository>;
  let userRepository: jest.Mocked<IUserRepository>;
  let tokenService: jest.Mocked<ITokenService>;
  let res: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerifyEmailUseCase,
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
            updateVerified: jest.fn(),
          },
        },
        {
          provide: ITokenService,
          useValue: {
            generateToken: jest.fn(),
            setRefreshTokenCookie: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(VerifyEmailUseCase);
    otpRepository = module.get(IOtpRepository);
    userRepository = module.get(IUserRepository);
    tokenService = module.get(ITokenService);
    res = { cookie: jest.fn() };
  });

  it("should verify email and return tokens", async () => {
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

    const updatedUser = { ...user, verified: true };

    otpRepository.findValidOtp.mockResolvedValue(otp);
    userRepository.findById.mockResolvedValue(user);
    userRepository.updateVerified.mockResolvedValue(updatedUser);
    tokenService.generateToken
      .mockReturnValueOnce("access-token")
      .mockReturnValueOnce("refresh-token");

    const result = await useCase.execute("valid-code", res);

    expect(otpRepository.findValidOtp).toHaveBeenCalledWith(
      "valid-code",
      OtpType.EMAIL_VERIFICATION
    );
    expect(userRepository.findById).toHaveBeenCalledWith("user-id");
    expect(userRepository.updateVerified).toHaveBeenCalledWith("user-id", true);
    expect(otpRepository.invalidateOtp).toHaveBeenCalledWith("otp-id");
    expect(tokenService.generateToken).toHaveBeenCalledTimes(2);
    expect(tokenService.setRefreshTokenCookie).toHaveBeenCalledWith(
      "refresh-token",
      res
    );
    expect(result).toMatchObject({
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        verified: updatedUser.verified,
      },
      accessToken: "access-token",
    });
  });

  it("should throw BadRequestException if otp is invalid", async () => {
    otpRepository.findValidOtp.mockResolvedValue(null);

    await expect(useCase.execute("invalid-code", res)).rejects.toThrow(
      BadRequestException
    );
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

    await expect(useCase.execute("valid-code", res)).rejects.toThrow(
      NotFoundException
    );
  });
});
