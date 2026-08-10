import type {
  Alcohol,
  Gender,
  InterestedIn,
  Kids,
  Pets,
  Smoking,
  Workouts,
} from '@squinder/shared'

export type Persona = {
  id: string
  seedKey: string | null
  name: string
  bio: string
  birthDate: string
  gender: Gender
  interestedIn: InterestedIn
  smoking: Smoking
  alcohol: Alcohol
  workouts: Workouts
  pets: Pets
  kids: Kids
  country: string
  city: string
  photoUrls: string[]
  createdAt: string
  updatedAt: string
  interests: string[]
}

export type PersonaInput = {
  name: string
  bio: string
  birthDate: string
  gender: Gender
  interestedIn: InterestedIn
  smoking: Smoking
  alcohol: Alcohol
  workouts: Workouts
  pets: Pets
  kids: Kids
  country: string
  city: string
  photoUrls: string[]
  interests: string[]
}

export const API_URL = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:7131'
).replace(/\/$/, '')

// Local S3 (MinIO) public bucket.
export const MEDIA_URL = (
  import.meta.env.VITE_MEDIA_URL ?? 'http://localhost:7133/squinder'
).replace(/\/$/, '')

export const resolvePhotoUrl = (path: string): string =>
  /^https?:\/\//.test(path) ? path : `${MEDIA_URL}/${path.replace(/^\//, '')}`

const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    let message = `HTTP ${response.status}`
    try {
      const body = (await response.json()) as { message?: string }
      if (body.message) message = body.message
    } catch {
      // keep the generic message
    }
    throw new Error(message)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export const listPersonas = async (): Promise<Persona[]> => {
  const data = await request<{ personas: Persona[] }>('/personas')
  return data.personas
}

export const createPersona = async (
  input: PersonaInput,
): Promise<Persona> => {
  const data = await request<{ persona: Persona }>('/personas', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return data.persona
}

export const updatePersona = async (
  id: string,
  input: PersonaInput,
): Promise<Persona> => {
  const data = await request<{ persona: Persona }>(`/personas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
  return data.persona
}

export const deletePersona = (id: string): Promise<void> =>
  request(`/personas/${id}`, { method: 'DELETE' })
