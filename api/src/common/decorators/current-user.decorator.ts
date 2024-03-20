import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Retrieves the current user from the request object.
 *
 * @param {_data: unknown} data - The additional data (unused).
 * @param {ExecutionContext} context - The execution context from the framework.
 * @returns {unknown} - The current user object.
 */
export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
});
