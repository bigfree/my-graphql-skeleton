import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Creates a parameter decorator function called `IpUser`.
 * This decorator extracts the IP address of the current request from the execution context.
 *
 * @param data - Additional data (unknown) passed to the decorator function.
 * @param context - The execution context containing information about the current request.
 * @returns The IP address of the current request.
 */
export const IpUser = createParamDecorator((data: unknown, context: ExecutionContext) => {
    const ctx: GqlExecutionContext = GqlExecutionContext.create(context);
    return ctx.getContext().req.ip;
});
