import { RateLimiterMemory } from 'rate-limiter-flexible';

// Rate limiter for login attempts: max 5 attempts per 15 minutes
const loginLimiter = new RateLimiterMemory({
  points: 5,
  duration: 15 * 60, // 15 minutes
});

export async function checkLoginRateLimit(email: string): Promise<boolean> {
  try {
    await loginLimiter.consume(email);
    return true;
  } catch {
    return false;
  }
}

export async function resetLoginRateLimit(email: string): Promise<void> {
  try {
    await loginLimiter.delete(email);
  } catch {
    // Already reset or doesn't exist
  }
}
