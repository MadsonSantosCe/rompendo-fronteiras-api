import { Test, TestingModule } from "@nestjs/testing";
import { RefreshTokenUseCase } from "../usecases/refresh-token.usecase";
import { ITokenService } from "../../domain/services/abstract-token.service";
import { IUserRepository } from "../../domain/repositories/abstract-user.repository";
import { UnauthorizedException, NotFoundException } from "@nestjs/common";

describe("RefreshTokenUseCase", () => {
  let useCase: RefreshTokenUseCase;
  let tokenService: jest.Mocked<ITokenService>;
  let userRepository: jest.Mocked<IUserRepository>;
  let res: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenUseCase,
        {
          provide: ITokenService,
          useValue: {
            verifyToken: jest.fn(),
            generateToken: jest.fn(),
            setRefreshTokenCookie: jest.fn(),
          },
        },
        {
          provide: IUserRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(RefreshTokenUseCase);
    tokenService = module.get(ITokenService);
    userRepository = module.get(IUserRepository);
    res = { cookie: jest.fn() };
  });

  it("should refresh tokens for valid refresh token", async () => {
    const user = {
      id: "user-id",
      name: "Test User",
      email: "test@example.com",
      password: "hashedpassword",
      verified: true,
    };

    tokenService.verifyToken.mockReturnValue({ id: "user-id" });
    userRepository.findById.mockResolvedValue(user);
    tokenService.generateToken
      .mockReturnValueOnce("new-access-token")
      .mockReturnValueOnce("new-refresh-token");

    const result = await useCase.execute("valid-refresh-token");

    expect(tokenService.verifyToken).toHaveBeenCalledWith(
      "valid-refresh-token"
    );
    expect(userRepository.findById).toHaveBeenCalledWith("user-id");
    expect(tokenService.generateToken).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        verified: user.verified,
      },
      accessToken: "new-access-token",
    });
  });

  it("should throw UnauthorizedException if refresh token is invalid", async () => {
    tokenService.verifyToken.mockImplementation(() => {
      throw new UnauthorizedException();
    });

    await expect(useCase.execute("invalid-refresh-token")).rejects.toThrow(
      UnauthorizedException
    );
  });

  it("should throw NotFoundException if user is not found", async () => {
    tokenService.verifyToken.mockReturnValue({ id: "user-id" });
    userRepository.findById.mockResolvedValue(null as any);

    await expect(useCase.execute("valid-refresh-token")).rejects.toThrow(
      NotFoundException
    );
  });

  it("should throw NotFoundException with message 'Usuário não encontrado' if user is not found", async () => {
    tokenService.verifyToken.mockReturnValue({ id: "user-id" });
    userRepository.findById.mockResolvedValue(null as any);

    await expect(useCase.execute("valid-refresh-token")).rejects.toThrow(
      new NotFoundException("Usuário não encontrado")
    );
  });
});
