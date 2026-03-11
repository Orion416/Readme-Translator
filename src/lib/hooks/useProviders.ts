'use client'

import { useState, useEffect } from 'react'
import type { LLMProvider } from '@/types'

interface ProvidersStatus {
  providers: LLMProvider[]
  githubToken: boolean
  isLoading: boolean
  error: Error | null
}

// Module-level cache shared across all hook instances
let cachedData: { providers: LLMProvider[]; githubToken: boolean } | null = null

export function useProviders(): ProvidersStatus {
  const [status, setStatus] = useState<ProvidersStatus>(() => {
    // If cache exists, return cached data immediately
    if (cachedData) {
      return {
        providers: cachedData.providers,
        githubToken: cachedData.githubToken,
        isLoading: false,
        error: null,
      }
    }
    return {
      providers: [],
      githubToken: false,
      isLoading: true,
      error: null,
    }
  })

  useEffect(() => {
    // If already cached, no need to fetch
    if (cachedData) {
      return
    }

    fetch('/api/providers')
      .then((res) => res.json())
      .then((data) => {
        cachedData = {
          providers: data.providers,
          githubToken: data.githubToken,
        }
        setStatus({
          providers: data.providers,
          githubToken: data.githubToken,
          isLoading: false,
          error: null,
        })
      })
      .catch((err) => {
        setStatus({
          providers: [],
          githubToken: false,
          isLoading: false,
          error: err instanceof Error ? err : new Error('Failed to fetch providers'),
        })
      })
  }, [])

  return status
}
