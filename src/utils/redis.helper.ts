import redisClient from "../config/redis.config.js";
import ApiError from "./error.util.js";
// Time constants (in seconds)
export const REDIS_TTL = {
    VERIFICATION_CODE: 24 * 60 * 60, // 24 hours
    PASSWORD_RESET: 60 * 60, // 1 hour
    ACCOUNT_RESTORE: 30 * 24 * 60 * 60, // 30 days
    FAILED_LOGIN: 30 * 60, // 30 minutes
    FAILED_2FA: 15 * 60, // 15 minutes
    PASSWORD_CHANGE: 60 * 60, // 1 hour
} as const;

export const REDIS_LIMITS = {
    FAILED_LOGIN: 5,
    FAILED_2FA: 5,
    PASSWORD_CHANGE: 3,
} as const;


// ==================== VERIFICATION CODE ====================
export const setVerificationCode = async (email: string, code: string): Promise<void> => {
    // First, delete any existing verification code for this email
    await deleteVerificationCodeByEmail(email);
    
    // Store code -> email mapping
    const key = `verify_code:${code}`;
    await redisClient.setex(key, REDIS_TTL.VERIFICATION_CODE, email);
    
    // Store email -> code mapping for easy lookup/deletion
    const emailKey = `verify_email:${email}`;
    await redisClient.setex(emailKey, REDIS_TTL.VERIFICATION_CODE, code);
};

export const getVerificationCode = async (code: string): Promise<string | null> => {
    const key = `verify_code:${code}`;
    return await redisClient.get(key);
};

export const deleteVerificationCode = async (code: string): Promise<void> => {
    // Get email associated with this code
    const email = await redisClient.get(`verify_code:${code}`);
    
    if (email) {
        // Delete both mappings
        await redisClient.del(`verify_code:${code}`);
        await redisClient.del(`verify_email:${email}`);
    }
};

export const deleteVerificationCodeByEmail = async (email: string): Promise<void> => {
    // Get code associated with this email
    const code = await redisClient.get(`verify_email:${email}`);
    
    if (code) {
        // Delete both mappings
        await redisClient.del(`verify_code:${code}`);
        await redisClient.del(`verify_email:${email}`);
    }
};

// ==================== PASSWORD RESET TOKEN ====================
export const setPasswordResetToken = async (email: string,userId:string, hashedToken: string): Promise<void> => {
    const key = `pwd_reset:${hashedToken}`;
    await redisClient.setex(key, REDIS_TTL.PASSWORD_RESET, JSON.stringify({ email, userId }));
};

export const getPasswordResetData = async (hashedToken: string):  Promise<{ email: string; userId: string } | null>  => {
    const key = `pwd_reset:${hashedToken}`;
    const data = await redisClient.get(key);
    if (!data) return null;
    const parsedData = JSON.parse(data) as { email: string; userId: string };
    return parsedData;
};

export const deletePasswordResetToken = async (hashedToken: string): Promise<void> => {
    const key = `pwd_reset:${hashedToken}`;
    await redisClient.del(key);
};

// ==================== ACCOUNT RESTORE TOKEN ====================
export const setAccountRestoreToken = async (
    userId: string,
    hashedToken: string,
    deleteAfter: Date
): Promise<void> => {
    const key = `restore:${hashedToken}`;
    const data = JSON.stringify({ userId, deleteAfter: deleteAfter.toISOString() });
    await redisClient.setex(key, REDIS_TTL.ACCOUNT_RESTORE, data);
};

export const getAccountRestoreData = async (
    hashedToken: string
): Promise<{ userId: string; deleteAfter: Date } | null> => {
    const key = `restore:${hashedToken}`;
    const data = await redisClient.get(key);
    if (!data) return null;
    const parsed = JSON.parse(data);
    return {
        userId: parsed.userId,
        deleteAfter: new Date(parsed.deleteAfter),
    };
};

export const deleteAccountRestoreToken = async (hashedToken: string): Promise<void> => {
    const key = `restore:${hashedToken}`;
    await redisClient.del(key);
};

// ==================== ACCOUNT DELETION TRACKING ====================
export const setAccountDeletionData = async (
    userId: string,
    deletedAt: Date,
    deleteAfter: Date
): Promise<void> => {
    const key = `deleted:${userId}`;
    const data = JSON.stringify({  // JSON.stringify convert object in js to json 
        deletedAt: deletedAt.toISOString(),
        deleteAfter: deleteAfter.toISOString(),
    });
    await redisClient.setex(key, REDIS_TTL.ACCOUNT_RESTORE, data);
};

export const getAccountDeletionData = async (
    userId: string
): Promise<{ deletedAt: Date; deleteAfter: Date } | null> => {
    const key = `deleted:${userId}`;
    const data = await redisClient.get(key);
    if (!data) return null;
    const parsed = JSON.parse(data);
    return {
        deletedAt: new Date(parsed.deletedAt),
        deleteAfter: new Date(parsed.deleteAfter),
    };
};

export const deleteAccountDeletionData = async (userId: string): Promise<void> => {
    const key = `deleted:${userId}`;
    await redisClient.del(key);
};


// ==================== FAILED LOGIN ATTEMPTS ====================
export const checkFailedLoginAttempts = async (email: string): Promise<void> => {
    const key = `failed_login:${email}`;
    const attempts = await redisClient.get(key);

    if (attempts && parseInt(attempts) >= REDIS_LIMITS.FAILED_LOGIN) {
        const ttl = await redisClient.ttl(key);
        throw new ApiError(
            `Account temporarily locked. Too many failed login attempts. Try again in ${Math.ceil(ttl / 60)} minutes`,
            429
        );

    }
};

export const recordFailedLogin = async (email: string): Promise<void> => {
    const key = `failed_login:${email}`;
    const current = await redisClient.incr(key);

    if (current === 1) {
        await redisClient.expire(key, REDIS_TTL.FAILED_LOGIN);
    }
};

export const clearFailedLoginAttempts = async (email: string): Promise<void> => {
    await redisClient.del(`failed_login:${email}`);
};

// ==================== FAILED 2FA ATTEMPTS ====================
export const checkFailed2FAAttempts = async (userId: string): Promise<void> => {
    const key = `failed_2fa:${userId}`;
    const attempts = await redisClient.get(key);

    if (attempts && parseInt(attempts) >= REDIS_LIMITS.FAILED_2FA) {
        const ttl = await redisClient.ttl(key);
        throw new ApiError(
            `Too many failed 2FA attempts. Try again in ${Math.ceil(ttl / 60)} minutes`,
            429
        );
    }
};

export const recordFailed2FAAttempt = async (userId: string): Promise<void> => {
    const key = `failed_2fa:${userId}`;
    const current = await redisClient.incr(key);

    if (current === 1) {
        await redisClient.expire(key, REDIS_TTL.FAILED_2FA);
    }
};

export const clearFailed2FAAttempts = async (userId: string): Promise<void> => {
    await redisClient.del(`failed_2fa:${userId}`);
};

// ==================== PASSWORD CHANGE ATTEMPTS ====================
export const checkPasswordChangeAttempts = async (userId: string): Promise<void> => {
    const key = `pwd_change:${userId}`;
    const attempts = await redisClient.get(key);

    if (attempts && parseInt(attempts) >= REDIS_LIMITS.PASSWORD_CHANGE) {
        const ttl = await redisClient.ttl(key);
        throw new ApiError(
            `Too many password change attempts. Try again in ${Math.ceil(ttl / 60)} minutes`,
            429
        );
    }
};

export const recordPasswordChangeAttempt = async (userId: string): Promise<void> => {
    const key = `pwd_change:${userId}`;
    const current = await redisClient.incr(key);

    if (current === 1) {
        await redisClient.expire(key, REDIS_TTL.PASSWORD_CHANGE);
    }
};

export const clearPasswordChangeAttempts = async (userId: string): Promise<void> => {
    await redisClient.del(`pwd_change:${userId}`);
};