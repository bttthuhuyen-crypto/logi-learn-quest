export interface PasswordStrengthResult {
  score: 0 | 1 | 2 | 3 | 4;
  label: 'weak' | 'fair' | 'good' | 'strong';
  checks: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const passedChecks = Object.values(checks).filter(Boolean).length;

  let score: 0 | 1 | 2 | 3 | 4;
  let label: 'weak' | 'fair' | 'good' | 'strong';

  if (passedChecks <= 1) {
    score = 0;
    label = 'weak';
  } else if (passedChecks === 2) {
    score = 1;
    label = 'weak';
  } else if (passedChecks === 3) {
    score = 2;
    label = 'fair';
  } else if (passedChecks === 4) {
    score = 3;
    label = 'good';
  } else {
    score = 4;
    label = 'strong';
  }

  return { score, label, checks };
}

export function getStrengthColor(label: string): string {
  switch (label) {
    case 'weak':
      return 'bg-destructive';
    case 'fair':
      return 'bg-yellow-500';
    case 'good':
      return 'bg-blue-500';
    case 'strong':
      return 'bg-green-500';
    default:
      return 'bg-muted';
  }
}
