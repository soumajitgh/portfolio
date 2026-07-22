const siteverifyURL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

type TurnstileResponse = {
  action?: string
  hostname?: string
  success: boolean
}

export type TurnstileAction = 'contact' | 'star'

export type TurnstileVerification = {
  configured: boolean
  valid: boolean
}

function allowedHostnames() {
  return (process.env.TURNSTILE_ALLOWED_HOSTNAMES || '')
    .split(',')
    .map((hostname) => hostname.trim().toLowerCase())
    .filter(Boolean)
}

export async function verifyTurnstileToken(
  token: unknown,
  expectedAction: TurnstileAction,
): Promise<TurnstileVerification> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return { configured: false, valid: false }
  if (typeof token !== 'string' || !token || token.length > 2048) {
    return { configured: true, valid: false }
  }

  const body = new FormData()
  body.set('secret', secret)
  body.set('response', token)

  try {
    const response = await fetch(siteverifyURL, {
      body,
      cache: 'no-store',
      method: 'POST',
      signal: AbortSignal.timeout(8000),
    })
    if (!response.ok) return { configured: true, valid: false }

    const result = (await response.json()) as TurnstileResponse
    const hostnames = allowedHostnames()
    const hostnameValid =
      !hostnames.length ||
      Boolean(result.hostname && hostnames.includes(result.hostname.toLowerCase()))

    return {
      configured: true,
      valid: result.success && result.action === expectedAction && hostnameValid,
    }
  } catch {
    return { configured: true, valid: false }
  }
}
