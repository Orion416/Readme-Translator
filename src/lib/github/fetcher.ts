import { Octokit } from '@octokit/rest'
import type { GitHubUrlInfo, FetchResult } from '@/types'

// Initialize Octokit with optional auth token
function getOctokit(): Octokit {
  const token = process.env.GITHUB_TOKEN
  return new Octokit(
    token
      ? { auth: token }
      : {}
  )
}

/**
 * Fetch content from raw.githubusercontent.com as fallback
 */
async function fetchViaRaw(
  owner: string,
  repo: string,
  path: string,
  branch: string
): Promise<string | null> {
  try {
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`
    console.log(`Trying raw URL: ${url}`)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'README-Translator/1.0',
      },
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      return await response.text()
    }
    return null
  } catch (error) {
    console.log(`Raw fetch failed: ${error instanceof Error ? error.message : 'unknown error'}`)
    return null
  }
}

/**
 * Fetch content from Gitee raw URL
 */
async function fetchGiteeViaRaw(
  owner: string,
  repo: string,
  path: string,
  branch: string
): Promise<string | null> {
  try {
    const url = `https://gitee.com/${owner}/${repo}/raw/${branch}/${path}`
    console.log(`Trying Gitee raw URL: ${url}`)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'README-Translator/1.0',
      },
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      return await response.text()
    }
    return null
  } catch (error) {
    console.log(`Gitee raw fetch failed: ${error instanceof Error ? error.message : 'unknown error'}`)
    return null
  }
}

/**
 * Fetch README from Gitee API
 */
async function fetchGiteeReadme(
  owner: string,
  repo: string,
  path?: string,
  branch?: string
): Promise<FetchResult> {
  console.log(`\nFetching from Gitee: ${owner}/${repo}`)
  console.log(`Path: ${path || 'root'}, Branch: ${branch || 'auto'}`)

  const branches = [branch, 'master', 'main', 'dev'].filter(Boolean) as string[]

  // If specific file path provided
  if (path) {
    for (const ref of branches) {
      const content = await fetchGiteeViaRaw(owner, repo, path, ref)
      if (content) {
        return { content, filename: path.split('/').pop() || 'README.md', source: 'github' }
      }
    }
    throw new Error(`File not found on Gitee: ${owner}/${repo}/${path}`)
  }

  // Try to find README
  const readmeNames = ['README.md', 'readme.md', 'Readme.md', 'README', 'readme']

  for (const ref of branches) {
    for (const readmeName of readmeNames) {
      const content = await fetchGiteeViaRaw(owner, repo, readmeName, ref)
      if (content) {
        console.log(`Found Gitee README: ${readmeName}`)
        return { content, filename: readmeName, source: 'github' }
      }
    }
  }

  throw new Error(`No README found in Gitee repository ${owner}/${repo}`)
}

// Regular expression patterns for GitHub URLs
const GITHUB_PATTERNS = {
  repo: new RegExp('^https?://(?:www\\.)?github\\.com/([^/]+)/([^/?#]+)/?(?:\\?|#.*)?$'),
  blob: new RegExp('^https?://(?:www\\.)?github\\.com/([^/]+)/([^/]+)/blob/([^/]+)/(.+?)(?:\\?|#.*)?$'),
  tree: new RegExp('^https?://(?:www\\.)?github\\.com/([^/]+)/([^/]+)/tree/([^/]+)/(.+?)(?:\\?|#.*)?$'),
  raw: new RegExp('^https?://(?:www\\.)?github\\.com/([^/]+)/([^/]+)/raw/([^/]+)/(.+?)(?:\\?|#.*)?$'),
}

// Regular expression patterns for Gitee URLs
const GITEE_PATTERNS = {
  repo: new RegExp('^https?://(?:www\\.)?gitee\\.com/([^/]+)/([^/?#]+)/?(?:\\?|#.*)?$'),
  blob: new RegExp('^https?://(?:www\\.)?gitee\\.com/([^/]+)/([^/]+)/blob/([^/]+)/(.+?)(?:\\?|#.*)?$'),
  tree: new RegExp('^https?://(?:www\\.)?gitee\\.com/([^/]+)/([^/]+)/tree/([^/]+)/(.+?)(?:\\?|#.*)?$'),
  raw: new RegExp('^https?://(?:www\\.)?gitee\\.com/([^/]+)/([^/]+)/raw/([^/]+)/(.+?)(?:\\?|#.*)?$'),
}

function cleanRepoName(repo: string): string {
  return repo.replace(/\.git$/, '')
}

export function parseGitHubUrl(url: string): GitHubUrlInfo | null {
  const trimmedUrl = url.trim()

  // Try GitHub patterns first
  const blobMatch = trimmedUrl.match(GITHUB_PATTERNS.blob)
  if (blobMatch) {
    return { owner: blobMatch[1], repo: cleanRepoName(blobMatch[2]), branch: blobMatch[3], path: blobMatch[4] }
  }

  const treeMatch = trimmedUrl.match(GITHUB_PATTERNS.tree)
  if (treeMatch) {
    return { owner: treeMatch[1], repo: cleanRepoName(treeMatch[2]), branch: treeMatch[3], path: treeMatch[4] }
  }

  const rawMatch = trimmedUrl.match(GITHUB_PATTERNS.raw)
  if (rawMatch) {
    return { owner: rawMatch[1], repo: cleanRepoName(rawMatch[2]), branch: rawMatch[3], path: rawMatch[4] }
  }

  const repoMatch = trimmedUrl.match(GITHUB_PATTERNS.repo)
  if (repoMatch) {
    return { owner: repoMatch[1], repo: cleanRepoName(repoMatch[2]) }
  }

  // Try Gitee patterns
  const giteeBlobMatch = trimmedUrl.match(GITEE_PATTERNS.blob)
  if (giteeBlobMatch) {
    return { owner: giteeBlobMatch[1], repo: cleanRepoName(giteeBlobMatch[2]), branch: giteeBlobMatch[3], path: giteeBlobMatch[4] }
  }

  const giteeTreeMatch = trimmedUrl.match(GITEE_PATTERNS.tree)
  if (giteeTreeMatch) {
    return { owner: giteeTreeMatch[1], repo: cleanRepoName(giteeTreeMatch[2]), branch: giteeTreeMatch[3], path: giteeTreeMatch[4] }
  }

  const giteeRawMatch = trimmedUrl.match(GITEE_PATTERNS.raw)
  if (giteeRawMatch) {
    return { owner: giteeRawMatch[1], repo: cleanRepoName(giteeRawMatch[2]), branch: giteeRawMatch[3], path: giteeRawMatch[4] }
  }

  const giteeRepoMatch = trimmedUrl.match(GITEE_PATTERNS.repo)
  if (giteeRepoMatch) {
    return { owner: giteeRepoMatch[1], repo: cleanRepoName(giteeRepoMatch[2]) }
  }

  return null
}

export function isValidGitHubUrl(url: string): boolean {
  return parseGitHubUrl(url) !== null
}

// Check if URL is a Gitee URL
function isGiteeUrl(url: string): boolean {
  const trimmedUrl = url.trim()
  return /^https?:\/\/(?:www\.)?gitee\.com/.test(trimmedUrl)
}

// Case-insensitive README pattern
const README_PATTERN = /^readme(\.md)?$/i

/**
 * Find README file in directory listing (case-insensitive)
 */
async function findReadmeFile(
  owner: string,
  repo: string,
  ref: string
): Promise<string | null> {
  try {
    const octokit = getOctokit()
    const response = await octokit.rest.repos.getContent({ owner, repo, path: '', ref })

    if (Array.isArray(response.data)) {
      const readmeFile = response.data.find(
        file => file.type === 'file' && README_PATTERN.test(file.name)
      )
      return readmeFile?.name || null
    }
    return null
  } catch {
    return null
  }
}

/**
 * Fetch content using Octokit API
 */
async function fetchViaAPI(
  owner: string,
  repo: string,
  path: string,
  ref: string
): Promise<string | null> {
  try {
    const octokit = getOctokit()
    const response = await octokit.rest.repos.getContent({ owner, repo, path, ref })

    if ('content' in response.data && !Array.isArray(response.data)) {
      return Buffer.from(response.data.content, 'base64').toString('utf-8')
    }
    return null
  } catch {
    return null
  }
}

/**
 * Fetch README content from a GitHub repository
 */
export async function fetchReadme(
  owner: string,
  repo: string,
  path?: string,
  branch?: string
): Promise<FetchResult> {
  console.log(`\nFetching: ${owner}/${repo}`)
  console.log(`Path: ${path || 'root'}, Branch: ${branch || 'auto'}`)

  const octokit = getOctokit()

  // If specific file path provided
  if (path) {
    const branches = [branch, 'main', 'master', 'dev'].filter(Boolean) as string[]

    for (const ref of branches) {
      console.log(`Trying API: ${path} on ${ref}`)
      let content = await fetchViaAPI(owner, repo, path, ref)
      if (content) {
        console.log(`Success via API: ${content.length} chars`)
        return { content, filename: path.split('/').pop() || 'README.md', source: 'github' }
      }

      // Try raw.githubusercontent.com as fallback
      console.log(`Trying raw GitHub content...`)
      content = await fetchViaRaw(owner, repo, path, ref)
      if (content) {
        console.log(`Success via raw: ${content.length} chars`)
        return { content, filename: path.split('/').pop() || 'README.md', source: 'github' }
      }
    }

    throw new Error(`File not found: ${owner}/${repo}/${path}`)
  }

  // Try to find README
  const branches = [branch, 'main', 'master', 'dev'].filter(Boolean) as string[]

  for (const ref of branches) {
    console.log(`Searching on branch: ${ref}`)

    // Find README file via directory listing (case-insensitive)
    const readmeName = await findReadmeFile(owner, repo, ref)
    if (readmeName) {
      console.log(`  Found: ${readmeName}`)

      // Try API first
      let content = await fetchViaAPI(owner, repo, readmeName, ref)
      if (content) {
        console.log(`Success via API: ${readmeName} (${content.length} chars)`)
        return { content, filename: readmeName, source: 'github' }
      }

      // Try raw as fallback
      content = await fetchViaRaw(owner, repo, readmeName, ref)
      if (content) {
        console.log(`Success via raw: ${readmeName} (${content.length} chars)`)
        return { content, filename: readmeName, source: 'github' }
      }
    }
  }

  // Last resort: use getReadme API
  console.log(`Trying getReadme API...`)
  try {
    const response = await octokit.rest.repos.getReadme({ owner, repo })
    const content = Buffer.from(response.data.content, 'base64').toString('utf-8')
    console.log(`Success via getReadme: ${content.length} chars`)
    return { content, filename: response.data.name, source: 'github' }
  } catch {
    throw new Error(`No README found in ${owner}/${repo}`)
  }
}

export async function fetchContent(input: string, isUrl: boolean): Promise<FetchResult> {
  if (!isUrl) {
    console.log(`Using pasted content: ${input.length} chars`)
    return { content: input, filename: 'README.md', source: 'paste' }
  }

  const urlInfo = parseGitHubUrl(input)
  if (!urlInfo) {
    throw new Error('Invalid GitHub or Gitee URL format')
  }

  // Check if it's a Gitee URL
  if (isGiteeUrl(input)) {
    return fetchGiteeReadme(urlInfo.owner, urlInfo.repo, urlInfo.path, urlInfo.branch)
  }

  return fetchReadme(urlInfo.owner, urlInfo.repo, urlInfo.path, urlInfo.branch)
}
