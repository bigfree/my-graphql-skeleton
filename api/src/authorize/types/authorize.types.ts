import { User } from '@prisma/client';

export type JwtTokenData = Pick<User, 'id' | 'email' | 'type' | 'role'>;
