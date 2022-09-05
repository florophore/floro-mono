import { createHash } from 'crypto';
import { env } from 'process';

const PW_STATIC_SALT = env['PW_STATIC_SALT'] ?? 'TEST_SALT';

export default class PasswordHelper {

    public static hashPassword(userId: string, password: string): string {
        const hash = createHash('sha256');
        // userId acts as our unique salt, preventing rainbow table attacks
        // PW STATIC SALT prevents dictionary testing without having the env var value 
        // e.g. in case of db dump, data is useless without the PW_STATIC_SALT
        hash.update(userId + ":" + password + ":" + PW_STATIC_SALT);
        return hash.digest('base64');
    }

    public static compareHash(hash: string, userId: string, password: string): boolean {
        return hash === this.hashPassword(userId, password);
    }
}