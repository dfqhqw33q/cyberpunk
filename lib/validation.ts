// Password validation types and functions that can be used in client components
// This file is kept separate from lib/auth.ts to avoid importing server-only code in client components

export interface PasswordStrength {
  score: number
  level: "Weak" | "Medium" | "Strong"
  requirements: {
    minLength: boolean
    hasUppercase: boolean
    hasLowercase: boolean
    hasNumber: boolean
    hasSpecial: boolean
  }
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  }

  const score = Object.values(requirements).filter(Boolean).length

  let level: "Weak" | "Medium" | "Strong" = "Weak"
  if (score >= 5) level = "Strong"
  else if (score >= 3) level = "Medium"

  return { score, level, requirements }
}

export function isPasswordValid(password: string): boolean {
  const { requirements } = validatePasswordStrength(password)
  return Object.values(requirements).every(Boolean)
}
