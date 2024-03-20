import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    /**
     * Get the request object from the execution context
     *
     * @param {ExecutionContext} context - The execution context of the current request
     */
    // public getRequest = (context: ExecutionContext) => {
    //     const ctx: GqlExecutionContext = GqlExecutionContext.create(context);
    //     return ctx.getContext().req;
    // };

    getRequest(context: ExecutionContext): any {
        const ctx = GqlExecutionContext.create(context);
        const { req, connectionParams } = ctx.getContext();

        return req.headers ? req : (
                {
                    ...req,
                    // Convert the uppercase key to lowercase.
                    headers: Object.entries(connectionParams).reduce((acc, [key, value]) => {
                        acc[key.toLowerCase()] = value;
                        return acc;
                    }, {}),
                }
            );
    }
}
