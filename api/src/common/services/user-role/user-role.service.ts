import { Injectable } from '@nestjs/common';
import { UserRole, UserType } from '@prisma/client';

@Injectable()
export class UserRoleService {
    /**
     * Creates an array of user roles based on a specified user type.
     * @param {UserType} userType - The type of user.
     * @returns {UserRole[]} - An array of user roles.
     * @private
     */
    public createByType(userType: UserType): UserRole[] {
        const roles: UserRole[] = [UserRole.ROLE_GUEST];

        if (userType === UserType.USER) {
            roles.push(UserRole.ROLE_USER);
        }

        if (userType === UserType.ADMIN) {
            roles.push(UserRole.ROLE_USER, UserRole.ROLE_ADMIN);
        }

        return roles;
    }
}
