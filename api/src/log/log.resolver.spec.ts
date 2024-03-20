import { Test, TestingModule } from '@nestjs/testing';
import { LogResolver } from './log.resolver';
import { LogService } from './log.service';

describe('LogsResolver', () => {
    let resolver: LogResolver;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [LogResolver, LogService],
        }).compile();

        resolver = module.get<LogResolver>(LogResolver);
    });

    it('should be defined', () => {
        expect(resolver).toBeDefined();
    });
});
