import { Injectable } from '@nestjs/common';
import { compare, genSaltSync, hash } from 'bcryptjs';

@Injectable()
export class UserPasswordService {
    /**
     * Represents a salt value used in cryptography.
     * @typedef {string} salt
     */
    private readonly salt: string;

    constructor() {
        this.salt = genSaltSync(10);
    }

    /**
     * Generates a password hash using bcrypt hashing algorithm.
     *
     * @param {string} plainPassword - The plain password to be hashed.
     * @return {Promise<string>} - A promise that resolves to the password hash.
     */
    public async hashPassword(plainPassword: string): Promise<string> {
        return await hash(plainPassword, this.salt);
    }

    /**
     * Compares a plain password with a hashed password.
     *
     * @param {string} plainPassword - The plain password to be compared.
     * @param {string} hashedPassword - The hashed password to compare against.
     * @return {Promise<boolean>} - A promise that resolves to true if the plain password matches the hashed password,
     *                              or false otherwise.
     */
    public async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return await compare(plainPassword, hashedPassword);
    }
}
