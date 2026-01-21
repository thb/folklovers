function getApiUrl() {
  // Server-side (SSR): use internal Docker network or localhost
  if (typeof window === 'undefined') {
    return process.env.API_URL_INTERNAL || 'http://localhost:7001'
  }
  // Client-side: use public URL
  return import.meta.env.VITE_API_URL || 'http://localhost:7001'
}

const API_URL = getApiUrl()

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  token?: string | null
}

class ApiError extends Error {
  constructor(
    public status: number,
    public data: unknown
  ) {
    super(`API Error: ${status}`)
    this.name = 'ApiError'
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  // Handle 204 No Content (e.g., DELETE responses)
  if (response.status === 204) {
    return undefined as T
  }

  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(response.status, data)
  }

  return data
}

// Auth API
export const auth = {
  register: (data: { email: string; username: string; password: string }) =>
    request<{ token: string; user: User }>('/auth/register', { method: 'POST', body: data }),

  login: (data: { email: string; password: string }) =>
    request<{ token: string; user: User }>('/auth/login', { method: 'POST', body: data }),

  google: (data: { credential: string }) =>
    request<{ token: string; user: User }>('/auth/google', { method: 'POST', body: data }),

  me: (token: string) =>
    request<{ user: User }>('/auth/me', { token }),
}

// Songs API
export const songs = {
  list: (params?: { page?: number; per_page?: number; by_artist?: string; search?: string; sorted_by?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString())
    if (params?.by_artist) searchParams.set('by_artist', params.by_artist)
    if (params?.search) searchParams.set('search', params.search)
    if (params?.sorted_by) searchParams.set('sorted_by', params.sorted_by)
    const query = searchParams.toString()
    return request<{ songs: Song[]; pagination: Pagination }>(`/songs${query ? `?${query}` : ''}`)
  },

  top: (limit?: number) =>
    request<{ songs: Song[] }>(`/songs/top${limit ? `?limit=${limit}` : ''}`),

  get: (slug: string, token?: string | null) =>
    request<{ song: SongWithCovers }>(`/songs/${slug}`, { token: token || undefined }),

  search: (query: string) =>
    request<{ songs: SongSearchResult[] }>(`/songs/search?q=${encodeURIComponent(query)}`),

  create: (data: { title: string; original_artist: string; year?: number; youtube_url?: string; description?: string }, token: string) =>
    request<{ song: Song }>('/songs', {
      method: 'POST',
      body: data,
      token,
    }),
}

// Covers API
export const covers = {
  list: (songSlug: string, params?: { sorted_by?: 'score' | 'recent' }, token?: string | null) => {
    const searchParams = new URLSearchParams()
    if (params?.sorted_by) searchParams.set('sorted_by', params.sorted_by)
    const query = searchParams.toString()
    return request<{ covers: Cover[] }>(
      `/songs/${songSlug}/covers${query ? `?${query}` : ''}`,
      { token: token || undefined }
    )
  },

  top: (limit?: number) =>
    request<{ covers: CoverWithSong[] }>(`/covers/top${limit ? `?limit=${limit}` : ''}`),

  recent: (limit?: number) =>
    request<{ covers: CoverWithSong[] }>(`/covers/recent${limit ? `?limit=${limit}` : ''}`),

  create: (songSlug: string, data: { artist: string; year?: number; youtube_url: string; description?: string; original?: boolean; tag_ids?: number[] }, token: string) =>
    request<{ cover: Cover }>(`/songs/${songSlug}/covers`, {
      method: 'POST',
      body: data,
      token,
    }),

  createWithSong: (
    data: {
      song_id?: number
      song_title?: string
      original_artist?: string
      song_year?: number
      artist: string
      year?: number
      youtube_url: string
      description?: string
      original?: boolean
      tag_ids?: number[]
    },
    token: string
  ) =>
    request<{ cover: Cover; song: Song }>('/covers', {
      method: 'POST',
      body: data,
      token,
    }),
}

// Tags API
export const tags = {
  list: () =>
    request<{ tags: Tag[] }>('/tags'),
}

// Rankings API
export const rankings = {
  covers: (limit?: number) =>
    request<{ covers: RankedCover[] }>(`/rankings/covers${limit ? `?limit=${limit}` : ''}`),

  songs: (limit?: number) =>
    request<{ songs: RankedSong[] }>(`/rankings/songs${limit ? `?limit=${limit}` : ''}`),

  contributors: (limit?: number) =>
    request<{ contributors: RankedContributor[] }>(`/rankings/contributors${limit ? `?limit=${limit}` : ''}`),
}

export type RankedCover = CoverWithSong & {
  rank: number
}

export type RankedSong = Song & {
  rank: number
  total_score: number
}

export type RankedContributor = {
  rank: number
  id: number
  username: string
  avatar_url: string | null
  covers_count: number
  total_score: number
}

// User Space API
export const userSpace = {
  myCovers: (token: string) =>
    request<{ covers: CoverWithSong[] }>('/me/covers', { token }),

  myVotes: (token: string) =>
    request<{ votes: UserVote[] }>('/me/votes', { token }),

  updateCover: (id: number, data: { artist?: string; year?: number; youtube_url?: string; description?: string; tag_ids?: number[] }, token: string) =>
    request<{ cover: CoverWithSong }>(`/me/covers/${id}`, { method: 'PATCH', body: data, token }),

  deleteCover: (id: number, token: string) =>
    request<void>(`/me/covers/${id}`, { method: 'DELETE', token }),
}

export type UserVote = {
  vote_value: 1 | -1
  voted_at: string
  cover: CoverWithSong
}

// Votes API
export const votes = {
  vote: (coverId: number, value: 1 | -1, token: string) =>
    request<{ message: string; cover: Cover }>(`/covers/${coverId}/vote`, {
      method: 'POST',
      body: { value },
      token,
    }),

  remove: (coverId: number, token: string) =>
    request<{ message: string; cover: Cover }>(`/covers/${coverId}/vote`, {
      method: 'DELETE',
      token,
    }),
}

// Types
export type User = {
  id: number
  email?: string
  username: string
  avatar_url: string | null
  role?: 'user' | 'admin'
  created_at: string
}

export type Song = {
  id: number
  title: string
  original_artist: string
  year: number | null
  thumbnail_url: string | null
  slug: string
  covers_count: number
  has_original: boolean
  created_at: string
}

export type SongSearchResult = {
  id: number
  title: string
  original_artist: string
  slug: string
  has_original: boolean
}

export type SongWithCovers = Song & {
  covers: Cover[]
}

export type Tag = {
  id: number
  name: string
  slug: string
}

export type Cover = {
  id: number
  artist: string
  year: number | null
  youtube_url: string
  description: string | null
  original: boolean
  votes_score: number
  votes_count: number
  user_vote: 1 | -1 | null
  submitted_by: User | null
  tags: Tag[]
  created_at: string
}

export type CoverWithSong = Cover & {
  song: {
    title: string
    slug: string
  }
}

export type Pagination = {
  current_page: number
  total_pages: number
  total_count: number
  per_page: number
}

// Blog types
export type Tag = {
  id: number
  name: string
  slug: string
  articles_count?: number
}

export type Article = {
  id: number
  title: string
  slug: string
  excerpt: string | null
  cover_image_url: string | null
  cover_image_credit: string | null
  published_at: string | null
  is_published: boolean
  created_at: string
  updated_at: string
  author: User
  tags: Tag[]
}

export type ArticleWithContent = Article & {
  content: string
}

// Blog API
export const blog = {
  list: (params?: { page?: number; per_page?: number; by_tag?: string; search?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString())
    if (params?.by_tag) searchParams.set('by_tag', params.by_tag)
    if (params?.search) searchParams.set('search', params.search)
    const query = searchParams.toString()
    return request<{ articles: Article[]; pagination: Pagination }>(`/blog${query ? `?${query}` : ''}`)
  },

  get: (slug: string) =>
    request<{ article: ArticleWithContent }>(`/blog/${slug}`),

  tags: () =>
    request<{ tags: Tag[] }>('/blog/tags'),
}

// Admin API
export const admin = {
  songs: {
    list: (token: string, params?: { page?: number; per_page?: number }) => {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set('page', params.page.toString())
      if (params?.per_page) searchParams.set('per_page', params.per_page.toString())
      const query = searchParams.toString()
      return request<{ songs: Song[]; pagination: Pagination }>(
        `/admin/songs${query ? `?${query}` : ''}`,
        { token }
      )
    },

    get: (token: string, id: number) =>
      request<{ song: SongWithCovers }>(`/admin/songs/${id}`, { token }),

    create: (token: string, data: Omit<Song, 'id' | 'slug' | 'covers_count' | 'created_at'>) =>
      request<{ song: Song }>('/admin/songs', { method: 'POST', body: data, token }),

    update: (token: string, id: number, data: Partial<Omit<Song, 'id' | 'slug' | 'covers_count' | 'created_at'>>) =>
      request<{ song: Song }>(`/admin/songs/${id}`, { method: 'PATCH', body: data, token }),

    delete: (token: string, id: number) =>
      request<void>(`/admin/songs/${id}`, { method: 'DELETE', token }),
  },

  covers: {
    list: (token: string, params?: { page?: number; per_page?: number; song_id?: number }) => {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set('page', params.page.toString())
      if (params?.per_page) searchParams.set('per_page', params.per_page.toString())
      if (params?.song_id) searchParams.set('song_id', params.song_id.toString())
      const query = searchParams.toString()
      return request<{ covers: AdminCover[]; pagination: Pagination }>(
        `/admin/covers${query ? `?${query}` : ''}`,
        { token }
      )
    },

    get: (token: string, id: number) =>
      request<{ cover: AdminCover }>(`/admin/covers/${id}`, { token }),

    create: (token: string, data: { song_id: number; artist: string; year?: number; youtube_url: string; description?: string }) =>
      request<{ cover: Cover }>('/admin/covers', { method: 'POST', body: data, token }),

    update: (token: string, id: number, data: Partial<{ artist: string; year: number; youtube_url: string; description: string }>) =>
      request<{ cover: Cover }>(`/admin/covers/${id}`, { method: 'PATCH', body: data, token }),

    delete: (token: string, id: number) =>
      request<void>(`/admin/covers/${id}`, { method: 'DELETE', token }),

    setOriginal: (token: string, id: number) =>
      request<{ cover: Cover }>(`/admin/covers/${id}/set_original`, { method: 'POST', token }),
  },

  users: {
    list: (token: string, params?: { page?: number; per_page?: number }) => {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set('page', params.page.toString())
      if (params?.per_page) searchParams.set('per_page', params.per_page.toString())
      const query = searchParams.toString()
      return request<{ users: AdminUser[]; pagination: Pagination }>(
        `/admin/users${query ? `?${query}` : ''}`,
        { token }
      )
    },

    get: (token: string, id: number) =>
      request<{ user: User; contributions: UserContributions }>(`/admin/users/${id}`, { token }),
  },

  articles: {
    list: (token: string, params?: { page?: number; per_page?: number; search?: string }) => {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set('page', params.page.toString())
      if (params?.per_page) searchParams.set('per_page', params.per_page.toString())
      if (params?.search) searchParams.set('search', params.search)
      const query = searchParams.toString()
      return request<{ articles: ArticleWithContent[]; pagination: Pagination }>(
        `/admin/articles${query ? `?${query}` : ''}`,
        { token }
      )
    },

    get: (token: string, id: number) =>
      request<{ article: ArticleWithContent }>(`/admin/articles/${id}`, { token }),

    create: (token: string, data: {
      title: string
      content: string
      excerpt?: string
      cover_image_url?: string
      published_at?: string | null
      tag_names?: string[]
    }) =>
      request<{ article: ArticleWithContent }>('/admin/articles', { method: 'POST', body: data, token }),

    update: (token: string, id: number, data: Partial<{
      title: string
      content: string
      excerpt: string
      cover_image_url: string
      published_at: string | null
      tag_names: string[]
    }>) =>
      request<{ article: ArticleWithContent }>(`/admin/articles/${id}`, { method: 'PATCH', body: data, token }),

    delete: (token: string, id: number) =>
      request<void>(`/admin/articles/${id}`, { method: 'DELETE', token }),

    publish: (token: string, id: number) =>
      request<{ article: ArticleWithContent }>(`/admin/articles/${id}/publish`, { method: 'POST', token }),
  },

  tags: {
    list: (token: string) =>
      request<{ tags: Tag[] }>('/admin/tags', { token }),

    delete: (token: string, id: number) =>
      request<void>(`/admin/tags/${id}`, { method: 'DELETE', token }),
  },

  feedbacks: {
    list: (token: string, params?: { page?: number; per_page?: number; status?: string }) => {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set('page', params.page.toString())
      if (params?.per_page) searchParams.set('per_page', params.per_page.toString())
      if (params?.status) searchParams.set('status', params.status)
      const query = searchParams.toString()
      return request<{ feedbacks: Feedback[]; pagination: Pagination }>(
        `/admin/feedbacks${query ? `?${query}` : ''}`,
        { token }
      )
    },

    update: (token: string, id: number, data: { status: string }) =>
      request<{ feedback: Feedback }>(`/admin/feedbacks/${id}`, { method: 'PATCH', body: data, token }),

    delete: (token: string, id: number) =>
      request<void>(`/admin/feedbacks/${id}`, { method: 'DELETE', token }),
  },
}

export type AdminUser = {
  id: number
  username: string
  email: string
  role: 'user' | 'admin'
  avatar_url: string | null
  created_at: string
  covers_count: number
  votes_count: number
}

export type UserContributions = {
  covers_submitted: {
    id: number
    artist: string
    song_title: string
    song_slug: string
    created_at: string
  }[]
  votes_count: number
}

export type AdminCover = Cover & {
  song: {
    id: number
    title: string
    slug: string
  }
}

// Feedback types
export type Feedback = {
  id: number
  category: 'bug' | 'feature' | 'general'
  message: string
  status: 'pending' | 'reviewed' | 'resolved'
  user: User
  created_at: string
  updated_at: string
}

// Feedbacks API
export const feedbacks = {
  create: (data: { category: string; message: string }, token: string) =>
    request<{ feedback: Feedback }>('/feedbacks', { method: 'POST', body: data, token }),
}

// Notification types
export type NotificationType = 'vote_received' | 'new_cover_on_song'

export type NotificationData = {
  vote_value?: 1 | -1
  cover_artist?: string
  song_title?: string
  song_slug?: string
}

export type Notification = {
  id: number
  type: NotificationType
  read: boolean
  created_at: string
  data: NotificationData
}

export type NotificationsResponse = {
  notifications: Notification[]
  unread_count: number
}

// Notifications API
export const notifications = {
  list: (token: string) =>
    request<NotificationsResponse>('/notifications', { token }),

  markAsRead: (id: number, token: string) =>
    request<{ notification: Notification }>(`/notifications/${id}/read`, { method: 'POST', token }),

  markAllAsRead: (token: string) =>
    request<{ message: string }>('/notifications/read_all', { method: 'POST', token }),
}

export { ApiError }
