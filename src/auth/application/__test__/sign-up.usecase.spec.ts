import { Test, TestingModule } from '@nestjs/testing';
import { SignUpUseCase } from './../usecases/sign-up.usecase';
import { IUserRepository } from '../../domain/repositories/abstract-user.repository';
import { IOtpRepository } from '../../domain/repositories/abstract-otp.repository';
import { IEmailService } from '../../domain/services/abstract-email.service';
import { ConflictException } from '@nestjs/common';

describe('SignUpUseCase', () => {
  let useCase: SignUpUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let otpRepository: jest.Mocked<IOtpRepository>;
  let emailService: jest.Mocked<IEmailService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignUpUseCase,
        {
          provide: IUserRepository,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: IOtpRepository,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: IEmailService,
          useValue: {
            sendVerificationEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(SignUpUseCase);
    userRepository = module.get(IUserRepository);
    otpRepository = module.get(IOtpRepository);
    emailService = module.get(IEmailService);
  });

  it('should create a new user and send verification email', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.create.mockResolvedValue({
      id: 'user-id',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashed',
      verified: false,
    });

    const result = await useCase.execute('Test User', 'test@example.com', '123456');

    expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(userRepository.create).toHaveBeenCalled();
    expect(otpRepository.create).toHaveBeenCalled();
    expect(emailService.sendVerificationEmail).toHaveBeenCalled();
    expect(result).toMatchObject({
      id: 'user-id',
      name: 'Test User',
      email: 'test@example.com',
      verified: false,
    });
  });

  it('should throw ConflictException if email already exists', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: 'existing-id',
      name: 'Existing User',
      email: 'existing@example.com',
      password: 'hashed',
      verified: false,
    });

    await expect(
      useCase.execute('Test User', 'test@example.com', '123456')
    ).rejects.toThrow(ConflictException);
  });
});