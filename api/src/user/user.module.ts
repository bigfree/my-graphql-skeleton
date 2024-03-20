import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { PrismaService } from '../common/prisma/prisma.service';
import { UserPasswordService } from '../common/services/user-password/user-password.service';
import { UserRoleService } from '../common/services/user-role/user-role.service';
import { PubSubModule } from '../common/pubsub/pubsub.module';

@Module({
    imports: [PubSubModule],
    providers: [UserResolver, UserService, PrismaService, UserPasswordService, UserRoleService],
})
export class UserModule {}
