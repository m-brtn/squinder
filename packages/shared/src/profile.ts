export const GENDERS = [
  'male',
  'female',
  'non_binary',
  'prefer_not_to_say'
] as const
export type Gender = (typeof GENDERS)[number]

export const GENDER_LABELS: Record<Gender, string> = {
  male: 'Male',
  female: 'Female',
  non_binary: 'Non-binary',
  prefer_not_to_say: 'Prefer not to say'
}

export const INTERESTED_IN = ['male', 'female', 'everyone'] as const
export type InterestedIn = (typeof INTERESTED_IN)[number]
/** Historical alias used by the mobile onboarding and the users table. */
export type LookingFor = InterestedIn

export const INTERESTED_IN_LABELS: Record<InterestedIn, string> = {
  male: 'Men',
  female: 'Women',
  everyone: 'Everyone'
}

export const SMOKING = ['no', 'sometimes', 'yes'] as const
export type Smoking = (typeof SMOKING)[number]

export const SMOKING_LABELS: Record<Smoking, string> = {
  no: 'No',
  sometimes: 'Sometimes',
  yes: 'Yes'
}

export const ALCOHOL = ['no', 'socially', 'regularly'] as const
export type Alcohol = (typeof ALCOHOL)[number]

export const ALCOHOL_LABELS: Record<Alcohol, string> = {
  no: 'No',
  socially: 'Socially on weekends',
  regularly: 'Regularly'
}

export const WORKOUTS = ['no', 'rarely', 'often'] as const
export type Workouts = (typeof WORKOUTS)[number]

export const WORKOUTS_LABELS: Record<Workouts, string> = {
  no: 'No',
  rarely: 'Rarely',
  often: 'Often'
}

export const PETS = ['have', 'want', 'no', 'dont_want'] as const
export type Pets = (typeof PETS)[number]

export const PETS_LABELS: Record<Pets, string> = {
  have: 'Have pets',
  want: 'Want pets',
  no: 'No pets',
  dont_want: "Don't want pets"
}

export const KIDS = ['have', 'maybe', 'no', 'dont_want'] as const
export type Kids = (typeof KIDS)[number]

export const KIDS_LABELS: Record<Kids, string> = {
  have: 'Have kids',
  maybe: 'Maybe someday',
  no: 'No kids',
  dont_want: "Don't want kids"
}
