import { DayjsDateProvider } from '../../../../shared/container/providers/DateProvider/implementations/DayjsDateProvider';
import { AppError } from '../../../../shared/errors/AppError';
import { ICreateUserDTO } from '../../DTOs/ICreateUserDTO';
import { UsersRepositoryInMemory } from '../../repositories/in-memory/UsersRepositoryInMemory';
import { UsersTokensRepositoryInMemory } from '../../repositories/in-memory/UsersTokensRepositoryInMemory';
import { CreateUserUseCase } from '../createUsers/CreateUserUseCase';
import { AuthenticateUserUseCase } from './AuthenticateUserUseCase';

let authenticateUserUseCase: AuthenticateUserUseCase;
let usersRepositoryInMemory: UsersRepositoryInMemory;
let usersTokensRepositoryInMemory: UsersTokensRepositoryInMemory;
let createUserUseCase: CreateUserUseCase;
let dateprovider: DayjsDateProvider;

describe('Authenticate User', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new UsersRepositoryInMemory();
    usersTokensRepositoryInMemory = new UsersTokensRepositoryInMemory();
    dateprovider = new DayjsDateProvider();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      usersRepositoryInMemory,
      usersTokensRepositoryInMemory,
      dateprovider,
    );
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it('should be able to authenticate an user', async () => {
    const user: ICreateUserDTO = {
      driver_license: '000011',
      email: 'rodrigo@gmail.com',
      name: 'Rodrigo',
      password: '1234',
    };

    await createUserUseCase.execute(user);

    const result = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    expect(result).toHaveProperty('token');
  });

  it('should not be able to authenticate an nonexistent user', async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: 'false@gmail.com',
        password: '1234',
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to authenticate with incorrect password', () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        driver_license: '000012',
        email: 'teste@gmail.com',
        name: 'User Teste Error',
        password: '1234',
      };

      await createUserUseCase.execute(user);

      await authenticateUserUseCase.execute({
        email: user.email,
        password: 'incorrectPassword',
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
