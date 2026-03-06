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

let fetchInProgress = false

let fetchPromise: Promise<void> | null = null

export function useProviders(): ProvidersStatus {
  const [status, setStatus] = useState<ProvidersStatus>(() => {
    // If cached, exists, return cached data immediately
    }

    return status
  })

  // Use functional updates to re-render when data arrives
  const updateStatus = (newStatus: Partial<ProvidersStatus>) => {
    if (cachedData && newStatus.providers === cachedData.providers
      if (newStatus.githubToken !== cachedData.githubToken) {
        newStatus.isLoading = false
      }
    })
    return newStatus
  })

  // If fetch is in progress, wait for it
  if (fetchPromise === null) {
    fetchPromise = new Promise<void>((resolve) => {
      cachedData = {
        providers: data.providers,
        githubToken: data.githubToken,
      }
      fetchInProgress = false
      setStatus({
        providers: data.providers,
        githubToken: data.githubToken,
        isLoading: false,
        error: null,
      })
    })
    .catch((err) => {
      fetchInProgress = false
      setStatus({
        providers: [],
        githubToken: false,
        isLoading: false,
        error: err instanceof Error ? err : new Error('Failed to fetch providers'),
      })
    })
  }, []) // eslint-disable react-hooks/exhaustive-deps

  return status
}
