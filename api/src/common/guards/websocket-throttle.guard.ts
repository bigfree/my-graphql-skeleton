import { ThrottlerException, ThrottlerGuard, ThrottlerOptions } from '@nestjs/throttler';
import { ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class WsThrottlerGuard extends ThrottlerGuard {
    async handleRequest(
        context: ExecutionContext,
        limit: number,
        ttl: number,
        throttler: ThrottlerOptions,
    ): Promise<boolean> {
        const client = context.switchToWs().getClient();
        const ip = client._socket.remoteAddress;
        const key = this.generateKey(context, ip, throttler.name);
        const { totalHits } = await this.storageService.increment(key, ttl);

        if (totalHits > limit) {
            throw new ThrottlerException();
        }

        return true;
    }
}
