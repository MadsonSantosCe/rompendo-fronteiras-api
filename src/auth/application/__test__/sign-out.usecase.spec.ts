import { Test, TestingModule } from '@nestjs/testing';
import { ITokenService } from "../../domain/services/abstract-token.service";
import { SignOutUseCase } from "../usecases/sign-out.usecase";

describe("SignOutUseCase", () => {
  let useCase: SignOutUseCase;
  let tokenService: jest.Mocked<ITokenService>;
  let res: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignOutUseCase,
        {
          provide: ITokenService,
          useValue: {
            clearRefreshTokenCookie: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(SignOutUseCase);
    tokenService = module.get(ITokenService);
    res = { clearCookie: jest.fn() };
  });

  it("should clear refresh token cookie on sign out", async () => {
    useCase.execute(res);
    expect(tokenService.clearRefreshTokenCookie).toHaveBeenCalledWith(res);
  });
});