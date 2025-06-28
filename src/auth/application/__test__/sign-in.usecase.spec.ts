import { SignInUseCase } from "../usecases/sign-in.usecase";

jest.mock("bcryptjs", () => ({
  compare: jest.fn().mockResolvedValue(true),
}));

describe("SignInUseCase", () => {
  let useCase: SignInUseCase;

  const mockUserRepository = {
    findByEmail: jest.fn(),
  };

  const mockJwtTokenService = {
    generateToken: jest.fn(),
    setRefreshTokenCookie: jest.fn(),
  };

  beforeAll(() => {
    mockUserRepository.findByEmail.mockResolvedValue({
      id: "user-id",
      password: "hashed",
      verified: true,
    });

    mockJwtTokenService.generateToken.mockReturnValue("mock-token");

    useCase = new SignInUseCase(
      mockUserRepository as any,
      mockJwtTokenService as any
    );
  });

  it("should sign in user with correct credentials", async () => {
    const res = {} as any;
    const result = await useCase.execute("test@example.com", "123456", res);

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
      "test@example.com"
    );

    expect(result).toMatchObject({
      accessToken: "mock-token",
      user: {
        id: "user-id",
        verified: true,
      },
    });

    expect(mockJwtTokenService.generateToken).toHaveBeenCalledWith(
      "user-id",
      "7d"
    );

    expect(mockJwtTokenService.generateToken).toHaveBeenCalledWith(
      "user-id",
      "24h"
    );

    expect(mockJwtTokenService.generateToken).toHaveBeenCalledTimes(2);
  });
});
