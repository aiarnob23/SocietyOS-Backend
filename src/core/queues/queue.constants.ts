
export const QUEUES = {
    SESSION: 'session-queue',
    NOTIFICATION: 'notification',
    CLEANUP: 'otp-cleanup',
} as const;

export const SESSION_JOBS = {
    CLEANUP: 'cleanup',
} as const;

export const OTP_JOBS = {
    CLEANUP: 'cleanup',
} as const;