import { Test, TestingModule } from "@nestjs/testing";
import { SignInUseCase } from "../usecases/sign-in.usecase";
import { IUserRepository } from "../../domain/repositories/abstract-user.repository";
import { ITokenService } from "../../domain/services/abstract-token.service";
import { UnauthorizedException, ForbiddenException } from "@nestjs/common";

describe("SignInUseCase", () => {
  let useCase: SignInUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let tokenService: jest.Mocked<ITokenService>;
  let res: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignInUseCase,
        {
          provide: IUserRepository,
          useValue: {
            findByEmail: jest.fn(),
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

    useCase = module.get(SignInUseCase);
    userRepository = module.get(IUserRepository);
    tokenService = module.get(ITokenService);
    res = { cookie: jest.fn() };
  });

  it("should sign in user with correct credentials", async () => {
    const user = {
      id: "user-id",
      name: "Test User",
      email: "test@example.com",
      password: await require("bcryptjs").hash("123456", 10),
      verified: true,
    };

    userRepository.findByEmail.mockResolvedValue(user);

    tokenService.generateToken
      .mockReturnValueOnce("access-token")
      .mockReturnValueOnce("refresh-token");

    const result = await useCase.execute("test@example.com", "123456", res);

    expect(userRepository.findByEmail).toHaveBeenCalledWith("test@example.com");
    expect(tokenService.generateToken).toHaveBeenCalledTimes(2);
    expect(tokenService.setRefreshTokenCookie).toHaveBeenCalledWith(
      "refresh-token",
      res
    );
    
    expect(result).toMatchObject({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        verified: user.verified,
      },
      accessToken: "access-token",
    });
  });

  it("should throw UnauthorizedException for invalid credentials", async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute("test@example.com", "wrongpass", res)
    ).rejects.toThrow(UnauthorizedException);
  });

  it("should throw ForbiddenException if user is not verified", async () => {
    const user = {
      id: "user-id",
      name: "Test User",
      email: "test@example.com",
      password: await require("bcryptjs").hash("123456", 10),
      verified: false,
    };
    userRepository.findByEmail.mockResolvedValue(user);

    await expect(
      useCase.execute("test@example.com", "123456", res)
    ).rejects.toThrow(ForbiddenException);
  });
});
