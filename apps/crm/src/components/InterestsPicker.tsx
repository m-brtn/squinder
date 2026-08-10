import { useMemo, useState } from 'react'

import { INTEREST_CATEGORIES, MAX_PROFILE_INTERESTS } from '@squinder/shared'

type Props = {
  selected: string[]
  onChange: (next: string[]) => void
}

export function InterestsPicker({ selected, onChange }: Props) {
  const [query, setQuery] = useState('')

  const selectedSet = useMemo(() => new Set(selected), [selected])
  const limitReached = selected.length >= MAX_PROFILE_INTERESTS
  const normalizedQuery = query.trim().toLowerCase()

  const categories = useMemo(() => {
    if (normalizedQuery === '') return INTEREST_CATEGORIES

    return INTEREST_CATEGORIES.map((category) => ({
      ...category,
      interests: category.interests.filter((item) =>
        item.label.toLowerCase().includes(normalizedQuery),
      ),
    })).filter((category) => category.interests.length > 0)
  }, [normalizedQuery])

  const toggle = (slug: string) => {
    if (selectedSet.has(slug)) {
      onChange(selected.filter((item) => item !== slug))
      return
    }
    if (limitReached) return
    onChange([...selected, slug])
  }

  return (
    <div className="interests-picker">
      <div className="interests-picker__header">
        <input
          className="input interests-picker__search"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search interests…"
          type="search"
          value={query}
        />
        <span
          className={`interests-picker__counter${
            limitReached ? ' interests-picker__counter--full' : ''
          }`}
        >
          {selected.length} of {MAX_PROFILE_INTERESTS}
        </span>
      </div>

      {categories.length === 0 && (
        <p className="interests-picker__empty">
          Nothing matches “{query.trim()}”.
        </p>
      )}

      {categories.map((category) => (
        <section className="interests-picker__category" key={category.slug}>
          <h4>{category.label}</h4>
          <div className="chip-row">
            {category.interests.map((item) => {
              const isSelected = selectedSet.has(item.slug)
              return (
                <button
                  className={`chip${isSelected ? ' chip--selected' : ''}`}
                  disabled={!isSelected && limitReached}
                  key={item.slug}
                  onClick={() => toggle(item.slug)}
                  type="button"
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
