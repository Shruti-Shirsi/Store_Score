import { body, validationResult } from 'express-validator';

// Practical account-email policy: deliberately stricter than the complete RFC grammar,
// which permits uncommon addresses that are rarely useful in a consumer web app.
export function isRealisticEmail(value) {
  if (typeof value !== 'string') return false;
  const email = value;
  if (email.length < 6 || email.length > 254 || /\s|\\/.test(email)) return false;
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (local.length < 1 || local.length > 64 || local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;
  if (!/^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(local)) return false;
  if (domain.length > 253 || domain.includes('..')) return false;
  const labels = domain.split('.');
  if (labels.length < 2 || !/^[A-Z]{2,63}$/i.test(labels.at(-1))) return false;
  return labels.every(label => label.length >= 1 && label.length <= 63 && /^[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?$/i.test(label));
}

export const userRules = [
  body('name').trim().isLength({ min: 20, max: 60 }).withMessage('Name must be 20–60 characters.'),
  body('email').custom(isRealisticEmail).withMessage('Email is invalid. Use a real address such as name@example.com.').normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false }),
  body('address').trim().isLength({ min: 1, max: 400 }).withMessage('Address must be at most 400 characters.'),
  body('password').isLength({ min: 8, max: 16 }).matches(/[A-Z]/).matches(/[^A-Za-z0-9]/).withMessage('Password must be 8–16 characters with an uppercase letter and special character.')
];
export const validate = (req, res, next) => { const errors = validationResult(req); return errors.isEmpty() ? next() : res.status(422).json({ message: errors.array()[0].msg, errors: errors.array() }); };
