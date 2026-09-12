const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (value: string) => EMAIL_PATTERN.test(value.trim());

export const getGlobalErrorMessage = (
  errors?: { global: { message: string }[] | null } | null,
) => errors?.global?.[0]?.message ?? null;

type ClerkLikeError = {
  message?: string;
  longMessage?: string;
} | null;

export const getClerkErrorMessage = (error: ClerkLikeError) =>
  error?.longMessage || error?.message || null;

export const navigateAfterAuth = (
  session: { currentTask?: unknown } | null | undefined,
  goHome: () => void,
) => {
  if (session?.currentTask) {
    return;
  }

  goHome();
};
