/**
 * Sports data layer errors. These stay server-side; pages translate them
 * into empty states - they are never surfaced raw to visitors.
 */

export class SportsProviderError extends Error {
  readonly provider: string;
  readonly cause?: unknown;

  constructor(provider: string, message: string, cause?: unknown) {
    super(`[${provider}] ${message}`);
    this.name = "SportsProviderError";
    this.provider = provider;
    this.cause = cause;
  }
}

export class SportsTimeoutError extends SportsProviderError {
  constructor(provider: string, timeoutMs: number) {
    super(provider, `Request timed out after ${timeoutMs}ms`);
    this.name = "SportsTimeoutError";
  }
}

export class SportsNotConfiguredError extends SportsProviderError {
  constructor(provider: string) {
    super(
      provider,
      "Missing SPORTS_API_KEY. Add it to .env.local (server-only) to enable sports data."
    );
    this.name = "SportsNotConfiguredError";
  }
}
