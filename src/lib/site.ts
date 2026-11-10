export const SITE_NAME = 'Nudra'

/** Public contact address; contact page and links are hidden when unset */
export function contactEmail(): string | undefined {
  const v = process.env.CONTACT_EMAIL?.trim()
  return v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? v : undefined
}
