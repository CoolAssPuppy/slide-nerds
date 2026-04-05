import { useState, useEffect, useCallback, useRef } from 'react'

const DEFAULT_SERVICE_URL = 'https://slidenerds.com'
const POLL_INTERVAL_MS = 2000

type UseLiveSessionOptions = {
  sessionId?: string
  serviceUrl?: string
}

const getSessionIdFromUrl = (): string | null => {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  return params.get('session')
}

const resolveSessionId = (propSessionId?: string): string | null => {
  return propSessionId ?? getSessionIdFromUrl()
}

const resolveServiceUrl = (propServiceUrl?: string): string => {
  const url = propServiceUrl ?? DEFAULT_SERVICE_URL
  return url.endsWith('/') ? url.slice(0, -1) : url
}

const buildUrl = (serviceUrl: string, sessionId: string, path: string): string => {
  return `${serviceUrl}/api/live/${sessionId}${path}`
}

export const useLiveApi = (options: UseLiveSessionOptions) => {
  const sessionId = resolveSessionId(options.sessionId)
  const serviceUrl = resolveServiceUrl(options.serviceUrl)

  const post = useCallback(
    async (path: string, body: Record<string, unknown>) => {
      if (!sessionId) return null

      const response = await fetch(buildUrl(serviceUrl, sessionId, path), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      return response
    },
    [sessionId, serviceUrl],
  )

  const patch = useCallback(
    async (path: string, body: Record<string, unknown>) => {
      if (!sessionId) return null

      const response = await fetch(buildUrl(serviceUrl, sessionId, path), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      return response
    },
    [sessionId, serviceUrl],
  )

  const get = useCallback(
    async (path: string) => {
      if (!sessionId) return null

      const response = await fetch(buildUrl(serviceUrl, sessionId, path))
      return response
    },
    [sessionId, serviceUrl],
  )

  return { sessionId, serviceUrl, post, patch, get }
}

export const usePolling = <T>(
  fetcher: () => Promise<T | null>,
  intervalMs: number = POLL_INTERVAL_MS,
): { data: T | null; isLoading: boolean } => {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    const poll = async () => {
      const result = await fetcher()
      if (mountedRef.current) {
        setData(result)
        setIsLoading(false)
      }
    }

    poll()
    const interval = setInterval(poll, intervalMs)

    return () => {
      mountedRef.current = false
      clearInterval(interval)
    }
  }, [fetcher, intervalMs])

  return { data, isLoading }
}
