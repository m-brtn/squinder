import { useCallback, useEffect, useMemo, useState } from 'react'

import { INTEREST_LABEL_BY_SLUG } from '@squinder/shared'

import {
  createPersona,
  deletePersona,
  listPersonas,
  resolvePhotoUrl,
  updatePersona,
  type Persona,
  type PersonaInput,
} from './api'
import { PersonaForm } from './components/PersonaForm'

const ageFrom = (birthDate: string): number | null => {
  const date = new Date(`${birthDate}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) return null

  const now = new Date()
  let age = now.getUTCFullYear() - date.getUTCFullYear()
  const monthDiff = now.getUTCMonth() - date.getUTCMonth()
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && now.getUTCDate() < date.getUTCDate())
  ) {
    age -= 1
  }
  return age
}

export default function App() {
  const [personas, setPersonas] = useState<Persona[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [creating, setCreating] = useState(true)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setPersonas(await listPersonas())
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Failed to load personas',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const selected = useMemo(
    () => personas.find((persona) => persona.id === selectedId) ?? null,
    [personas, selectedId],
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (query === '') return personas
    return personas.filter((persona) =>
      [persona.name, persona.city, persona.country]
        .join(' ')
        .toLowerCase()
        .includes(query),
    )
  }, [personas, search])

  const openNew = () => {
    setSelectedId(null)
    setCreating(true)
  }

  const openPersona = (id: string) => {
    setSelectedId(id)
    setCreating(false)
  }

  const handleSave = async (input: PersonaInput) => {
    setSaving(true)
    setError(null)
    try {
      if (creating || selected == null) {
        const persona = await createPersona(input)
        setPersonas((current) => [persona, ...current])
        openPersona(persona.id)
      } else {
        const persona = await updatePersona(selected.id, input)
        setPersonas((current) =>
          current.map((item) => (item.id === persona.id ? persona : item)),
        )
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (selected == null) return
    if (!window.confirm(`Delete ${selected.name}?`)) return

    setSaving(true)
    setError(null)
    try {
      await deletePersona(selected.id)
      setPersonas((current) =>
        current.filter((item) => item.id !== selected.id),
      )
      openNew()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to delete')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <header className="sidebar__header">
          <h1 className="sidebar__brand">Squinder CRM</h1>
          <button
            className="button button--primary"
            onClick={openNew}
            type="button"
          >
            New persona
          </button>
        </header>

        <input
          className="input sidebar__search"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or city…"
          type="search"
          value={search}
        />

        <div className="sidebar__list">
          {loading && <p className="sidebar__note">Loading…</p>}
          {!loading && filtered.length === 0 && (
            <p className="sidebar__note">
              {personas.length === 0
                ? 'No personas yet. Create the first one or run the seed script.'
                : 'Nothing matches your search.'}
            </p>
          )}
          {filtered.map((persona) => {
            const age = ageFrom(persona.birthDate)
            const location = [persona.city, persona.country]
              .filter(Boolean)
              .join(', ')
            return (
              <button
                className={`persona-item${
                  persona.id === selectedId ? ' persona-item--active' : ''
                }`}
                key={persona.id}
                onClick={() => openPersona(persona.id)}
                type="button"
              >
                {persona.photoUrls[0] ? (
                  <img
                    alt=""
                    className="persona-item__photo"
                    src={resolvePhotoUrl(persona.photoUrls[0])}
                  />
                ) : (
                  <span className="persona-item__photo persona-item__photo--empty">
                    {persona.name.slice(0, 1)}
                  </span>
                )}
                <span className="persona-item__body">
                  <span className="persona-item__name">
                    {persona.name}
                    {age != null && `, ${age}`}
                  </span>
                  <span className="persona-item__meta">
                    {location || '—'}
                  </span>
                  <span className="persona-item__meta">
                    {persona.interests
                      .slice(0, 3)
                      .map(
                        (slug) => INTEREST_LABEL_BY_SLUG.get(slug) ?? slug,
                      )
                      .join(' · ')}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </aside>

      <main className="content">
        <header className="content__header">
          <h2>
            {creating || selected == null
              ? 'New persona'
              : `Edit ${selected.name}`}
          </h2>
          {selected?.seedKey && (
            <span className="content__seed-key">
              seed key: {selected.seedKey}
            </span>
          )}
        </header>

        {error && <p className="error-banner">{error}</p>}

        <PersonaForm
          key={creating ? 'new' : (selected?.id ?? 'new')}
          onDelete={creating || selected == null ? undefined : handleDelete}
          onSave={(input) => void handleSave(input)}
          persona={creating ? null : selected}
          saving={saving}
        />
      </main>
    </div>
  )
}
