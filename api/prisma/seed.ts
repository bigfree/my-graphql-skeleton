import { PrismaClient, UserRole, UserType } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    await prisma.user.deleteMany();
    await prisma.log.deleteMany();

    console.log('Seeding...');

    const roleAdminUser = await prisma.user.create({
        include: {
            profile: true,
            password: true,
        },
        data: {
            email: 'adam@miko.sk',
            role: [UserRole.ROLE_GUEST, UserRole.ROLE_USER, UserRole.ROLE_ADMIN],
            type: UserType.ADMIN,
            password: {
                create: {
                    password: await hash('123456', 10),
                },
            },
            profile: {
                create: {
                    firstName: 'Adam',
                    lastName: 'Miko',
                    username: 'Adminko',
                },
            },
        },
    });

    const roleUserUser = await prisma.user.create({
        include: {
            profile: true,
            password: true,
        },
        data: {
            email: 'user@user.sk',
            role: [UserRole.ROLE_GUEST, UserRole.ROLE_USER],
            type: UserType.USER,
            password: {
                create: {
                    password: await hash('123456', 10),
                },
            },
            profile: {
                create: {
                    firstName: 'User',
                    lastName: 'User',
                    username: 'Userko',
                },
            },
        },
    });

    const roleGuestUser = await prisma.user.create({
        include: {
            profile: true,
            password: true,
        },
        data: {
            email: 'guest@guest.sk',
            role: [UserRole.ROLE_GUEST],
            type: UserType.GUEST,
            password: {
                create: {
                    password: await hash('123456', 10),
                },
            },
            profile: {
                create: {
                    firstName: 'Guest',
                    lastName: 'Guest',
                    username: 'Guestko',
                },
            },
        },
    });

    console.log({
        roleAdminUser,
        roleUserUser,
        roleGuestUser,
    });
}

main()
    .catch((error) => console.error(error))
    .finally(async () => await prisma.$disconnect());
