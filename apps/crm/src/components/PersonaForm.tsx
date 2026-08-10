import { useState } from 'react'

import {
  ALCOHOL,
  ALCOHOL_LABELS,
  GENDERS,
  GENDER_LABELS,
  INTERESTED_IN,
  INTERESTED_IN_LABELS,
  KIDS,
  KIDS_LABELS,
  PETS,
  PETS_LABELS,
  SMOKING,
  SMOKING_LABELS,
  WORKOUTS,
  WORKOUTS_LABELS,
} from '@squinder/shared'

import { resolvePhotoUrl, type Persona, type PersonaInput } from '../api'
import { InterestsPicker } from './InterestsPicker'

type Props = {
  persona: Persona | null
  saving: boolean
  onSave: (input: PersonaInput) => void
  onDelete?: () => void
}

type EnumFieldProps<T extends string> = {
  label: string
  options: readonly T[]
  labels: Record<T, string>
  value: T
  onChange: (value: T) => void
}

function EnumField<T extends string>({
  label,
  options,
  labels,
  value,
  onChange,
}: EnumFieldProps<T>) {
  return (
    <div className="field">
      <span className="field__label">{label}</span>
      <div className="chip-row">
        {options.map((option) => (
          <button
            className={`chip${option === value ? ' chip--selected' : ''}`}
            key={option}
            onClick={() => onChange(option)}
            type="button"
          >
            {labels[option]}
          </button>
        ))}
      </div>
    </div>
  )
}

const toDraft = (persona: Persona | null): PersonaInput => ({
  name: persona?.name ?? '',
  bio: persona?.bio ?? '',
  birthDate: persona?.birthDate ?? '',
  gender: persona?.gender ?? 'female',
  interestedIn: persona?.interestedIn ?? 'everyone',
  smoking: persona?.smoking ?? 'no',
  alcohol: persona?.alcohol ?? 'no',
  workouts: persona?.workouts ?? 'no',
  pets: persona?.pets ?? 'no',
  kids: persona?.kids ?? 'no',
  country: persona?.country ?? '',
  city: persona?.city ?? '',
  photoUrls: persona?.photoUrls ?? [],
  interests: persona?.interests ?? [],
})

export function PersonaForm({ persona, saving, onSave, onDelete }: Props) {
  const [draft, setDraft] = useState<PersonaInput>(() => toDraft(persona))
  const [photosText, setPhotosText] = useState(() =>
    (persona?.photoUrls ?? []).join('\n'),
  )

  const patch = (changes: Partial<PersonaInput>) =>
    setDraft((current) => ({ ...current, ...changes }))

  const photoUrls = photosText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  const canSave =
    draft.name.trim().length >= 2 &&
    /^\d{4}-\d{2}-\d{2}$/.test(draft.birthDate)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!canSave || saving) return
    onSave({ ...draft, photoUrls })
  }

  return (
    <form className="persona-form" onSubmit={handleSubmit}>
      <div className="persona-form__grid">
        <label className="field">
          <span className="field__label">Name</span>
          <input
            className="input"
            maxLength={80}
            onChange={(event) => patch({ name: event.target.value })}
            placeholder="Maya"
            value={draft.name}
          />
        </label>

        <label className="field">
          <span className="field__label">Birth date</span>
          <input
            className="input"
            onChange={(event) => patch({ birthDate: event.target.value })}
            type="date"
            value={draft.birthDate}
          />
        </label>

        <label className="field">
          <span className="field__label">Country</span>
          <input
            className="input"
            maxLength={80}
            onChange={(event) => patch({ country: event.target.value })}
            placeholder="Spain"
            value={draft.country}
          />
        </label>

        <label className="field">
          <span className="field__label">City</span>
          <input
            className="input"
            maxLength={80}
            onChange={(event) => patch({ city: event.target.value })}
            placeholder="Barcelona"
            value={draft.city}
          />
        </label>
      </div>

      <label className="field">
        <span className="field__label">Bio</span>
        <textarea
          className="input persona-form__bio"
          maxLength={2000}
          onChange={(event) => patch({ bio: event.target.value })}
          placeholder="Ceramics, city walks, and finding the best ramen in town."
          rows={3}
          value={draft.bio}
        />
      </label>

      <EnumField
        label="Gender"
        labels={GENDER_LABELS}
        onChange={(gender) => patch({ gender })}
        options={GENDERS}
        value={draft.gender}
      />
      <EnumField
        label="Interested in"
        labels={INTERESTED_IN_LABELS}
        onChange={(interestedIn) => patch({ interestedIn })}
        options={INTERESTED_IN}
        value={draft.interestedIn}
      />

      <div className="persona-form__grid">
        <EnumField
          label="Smoking"
          labels={SMOKING_LABELS}
          onChange={(smoking) => patch({ smoking })}
          options={SMOKING}
          value={draft.smoking}
        />
        <EnumField
          label="Alcohol"
          labels={ALCOHOL_LABELS}
          onChange={(alcohol) => patch({ alcohol })}
          options={ALCOHOL}
          value={draft.alcohol}
        />
        <EnumField
          label="Workouts"
          labels={WORKOUTS_LABELS}
          onChange={(workouts) => patch({ workouts })}
          options={WORKOUTS}
          value={draft.workouts}
        />
        <EnumField
          label="Pets"
          labels={PETS_LABELS}
          onChange={(pets) => patch({ pets })}
          options={PETS}
          value={draft.pets}
        />
        <EnumField
          label="Kids"
          labels={KIDS_LABELS}
          onChange={(kids) => patch({ kids })}
          options={KIDS}
          value={draft.kids}
        />
      </div>

      <label className="field">
        <span className="field__label">
          Photos (one URL or profiles/… path per line)
        </span>
        <textarea
          className="input"
          onChange={(event) => setPhotosText(event.target.value)}
          placeholder={'profiles/women/1/1.png\nhttps://…'}
          rows={3}
          value={photosText}
        />
      </label>

      {photoUrls.length > 0 && (
        <div className="persona-form__photos">
          {photoUrls.map((url) => (
            <img
              alt=""
              className="persona-form__photo"
              key={url}
              src={resolvePhotoUrl(url)}
            />
          ))}
        </div>
      )}

      <div className="field">
        <span className="field__label">Interests</span>
        <InterestsPicker
          onChange={(interests) => patch({ interests })}
          selected={draft.interests}
        />
      </div>

      <div className="persona-form__actions">
        {onDelete && (
          <button
            className="button button--danger"
            disabled={saving}
            onClick={onDelete}
            type="button"
          >
            Delete
          </button>
        )}
        <button
          className="button button--primary"
          disabled={!canSave || saving}
          type="submit"
        >
          {saving
            ? 'Saving…'
            : persona
              ? 'Save changes'
              : 'Create persona'}
        </button>
      </div>
    </form>
  )
}
