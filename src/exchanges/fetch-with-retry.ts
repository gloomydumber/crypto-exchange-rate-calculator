export async function fetchWithRetry(
  url: string,
  signal?: AbortSignal,
  retries = 2,
  timeout = 5000,
): Promise<unknown> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const combinedSignal = signal
      ? AbortSignal.any([signal, controller.signal])
      : controller.signal

    const timer = setTimeout(() => controller.abort(), timeout)

    try {
      const res = await fetch(url, { signal: combinedSignal })
      clearTimeout(timer)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    } catch (err) {
      clearTimeout(timer)
      lastError = err as Error
      if (signal?.aborted) throw lastError
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 500))
      }
    }
  }

  throw lastError!
}
