import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { UserRole } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { JwtTokenData } from '../../authorize/types/authorize.types';

@Injectable()
export class RolesGuard implements CanActivate {
    private readonly jwtService: JwtService;

    constructor(private readonly roles: UserRole[]) {
        this.jwtService = new JwtService();
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const gqlContext = GqlExecutionContext.create(context);
        const userRole = this.getRoleFromContext(gqlContext);
        return userRole && this.hasRole(userRole);
    }

    private getRoleFromContext(context: GqlExecutionContext): UserRole[] | null {
        if (context.getContext().connectionParams?.Authorization) {
            const connectionParams = context.getContext().connectionParams;
            const decodedUser: JwtTokenData = this.jwtService.decode(
                connectionParams.Authorization.replace('Bearer ', ''),
            );
            return decodedUser?.role ?? null;
        }

        return context.getContext().req.user?.role ?? null;
    }

    private hasRole(roles: UserRole[]): boolean {
        return this.roles.every((item: UserRole) => roles.includes(item));
    }
}
