import { Test, TestingModule } from '@nestjs/testing';
import { AuthorizeResolver } from './authorize.resolver';
import { AuthorizeService } from './authorize.service';

describe('AuthorizeResolver', () => {
  let resolver: AuthorizeResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthorizeResolver, AuthorizeService],
    }).compile();

    resolver = module.get<AuthorizeResolver>(AuthorizeResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
