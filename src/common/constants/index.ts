export const APP_MESSAGES = {
    GENERAL: {
        SUCCESS: 'Success',
        INTERNAL_SERVER_ERROR: 'Internal server error',
        UNAUTHORIZED: 'Invalid credentials',
        BAD_REQUEST: 'Bad request',
        IDENTITY_REQUIRED: 'Email or Phone Number must be provided',
        INVALID_JSON: 'Invalid JSON format in request body',
    },
    AUTH: {
        REGISTER_SUCCESS: 'User registered successfully',
        LOGIN_SUCCESS: 'Login successful',
        LOGOUT_SUCCESS: 'Logout successful',
        REFRESH_SUCCESS: 'Token refreshed successfully',
        FORGOT_PASSWORD_SENT: 'If a user with this record exists, a reset link has been sent',
        RESET_PASSWORD_SUCCESS: 'Password reset successful',
        INVALID_TOKEN: 'Invalid or expired password reset token',
        EMAIL_EXISTS: 'Email already registered',
        PHONE_EXISTS: 'Phone number already registered',
        INVALID_CREDENTIALS: 'Invalid credentials',
    },
    USER: {
        PROFILE_FETCHED: 'Profile fetched successfully',
        NOT_FOUND: 'User not found',
        UPDATE_SUCCESS: 'Profile updated successfully',
    },
};

export const STATUS_CODE_KEY = 'statusCode';
export const MESSAGE_KEY = 'message';
export const SUCCESS_KEY = 'success';
export const DATA_KEY = 'data';
export const TIMESTAMP_KEY = 'timestamp';
export const PATH_KEY = 'path';
export const ERRORS_KEY = 'errors';

export const RESPONSE_KEYS = {
    STATUS_CODE: STATUS_CODE_KEY,
    MESSAGE: MESSAGE_KEY,
    SUCCESS: SUCCESS_KEY,
    DATA: DATA_KEY,
    TIMESTAMP: TIMESTAMP_KEY,
    PATH: PATH_KEY,
    ERRORS: ERRORS_KEY,
};


export const REDIS_KEYS = {
    USER_PROFILE: (userId: string) => `user:profile:${userId}`,
    REFRESH_TOKEN: (userId: string) => `auth:refresh_token:${userId}`,
};

export const CACHE_TTL = {
    ONE_HOUR: 3600,
    SEVEN_DAYS: 604800,
};

export const DEFAULT_REDIS_CONFIG = {
    HOST: (process.env.REDIS_HOST as string) || 'localhost',
    PORT: parseInt(process.env.REDIS_PORT as string, 10) || 6379,
};
