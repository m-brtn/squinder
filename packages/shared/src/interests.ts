export interface InterestDefinition {
  readonly slug: string
  readonly label: string
}

export interface InterestCategory {
  readonly slug: string
  readonly label: string
  readonly interests: readonly InterestDefinition[]
}

const interest = (slug: string, label: string): InterestDefinition => ({
  slug,
  label
})

/**
 * The interest matrix, modeled after Tinder's interest picker.
 * Categories and slugs are shared by the CRM, the API, and the
 * mobile onboarding so persona and user interests always match.
 */
export const INTEREST_CATEGORIES: readonly InterestCategory[] = [
  {
    slug: 'creativity',
    label: 'Creativity',
    interests: [
      interest('freelancing', 'Freelancing'),
      interest('photography', 'Photography'),
      interest('language-exchange', 'Language Exchange'),
      interest('cosplay', 'Cosplay'),
      interest('content-creation', 'Content Creation'),
      interest('tattoos', 'Tattoos'),
      interest('painting', 'Painting'),
      interest('entrepreneurship', 'Entrepreneurship'),
      interest('dancing', 'Dancing'),
      interest('singing', 'Singing'),
      interest('investing', 'Investing'),
      interest('choir', 'Choir'),
      interest('vintage-fashion', 'Vintage fashion'),
      interest('poetry', 'Poetry'),
      interest('acapella', 'Acapella'),
      interest('musical-instrument', 'Musical Instrument'),
      interest('musical-writing', 'Musical Writing'),
      interest('writing', 'Writing'),
      interest('literature', 'Literature'),
      interest('nfts', 'NFTs'),
      interest('exchange-program', 'Exchange Program'),
      interest('art', 'Art'),
      interest('real-estate', 'Real Estate'),
      interest('drawing', 'Drawing'),
      interest('fashion', 'Fashion'),
      interest('diy', 'DIY'),
      interest('upcycling', 'Upcycling'),
      interest('blogging', 'Blogging'),
      interest('sneakers', 'Sneakers')
    ]
  },
  {
    slug: 'fan-favorites',
    label: 'Fan favorites',
    interests: [
      interest('cars', 'Cars'),
      interest('motorcycles', 'Motorcycles'),
      interest('dungeons-and-dragons', 'Dungeons & Dragons'),
      interest('disney', 'Disney'),
      interest('harry-potter', 'Harry Potter'),
      interest('marvel', 'Marvel'),
      interest('anime', 'Anime'),
      interest('manga', 'Manga'),
      interest('star-wars', 'Star Wars'),
      interest('lego', 'LEGO'),
      interest('board-games', 'Board Games'),
      interest('collecting', 'Collecting')
    ]
  },
  {
    slug: 'food-and-drink',
    label: 'Food and drink',
    interests: [
      interest('foodie', 'Foodie'),
      interest('food-tours', 'Food tours'),
      interest('street-food', 'Street Food'),
      interest('plant-based', 'Plant-based'),
      interest('boba-tea', 'Boba tea'),
      interest('sweet-treats', 'Sweet treats'),
      interest('coffee', 'Coffee'),
      interest('wine', 'Wine'),
      interest('craft-beer', 'Craft beer'),
      interest('baking', 'Baking'),
      interest('cooking', 'Cooking'),
      interest('sushi', 'Sushi'),
      interest('bbq', 'BBQ'),
      interest('ramen', 'Ramen')
    ]
  },
  {
    slug: 'gaming',
    label: 'Gaming',
    interests: [
      interest('e-sports', 'E-Sports'),
      interest('playstation', 'PlayStation'),
      interest('fortnite', 'Fortnite'),
      interest('among-us', 'Among Us'),
      interest('atari', 'Atari'),
      interest('xbox', 'Xbox'),
      interest('nintendo', 'Nintendo'),
      interest('pc-gaming', 'PC Gaming'),
      interest('league-of-legends', 'League of Legends'),
      interest('roblox', 'Roblox'),
      interest('retro-gaming', 'Retro gaming')
    ]
  },
  {
    slug: 'going-out',
    label: 'Going out',
    interests: [
      interest('escape-rooms', 'Escape Rooms'),
      interest('bars', 'Bars'),
      interest('thrifting', 'Thrifting'),
      interest('museums', 'Museums'),
      interest('raves', 'Raves'),
      interest('drive-in-cinema', 'Drive-in Cinema'),
      interest('musical-theater', 'Musical theater'),
      interest('karaoke', 'Karaoke'),
      interest('nightclubs', 'Nightclubs'),
      interest('festivals', 'Festivals'),
      interest('stand-up-comedy', 'Stand-up Comedy'),
      interest('concerts', 'Concerts'),
      interest('theater', 'Theater')
    ]
  },
  {
    slug: 'music',
    label: 'Music',
    interests: [
      interest('gospel-music', 'Gospel music'),
      interest('music-bands', 'Music bands'),
      interest('rock-music', 'Rock music'),
      interest('soul-music', 'Soul music'),
      interest('pop-music', 'Pop music'),
      interest('k-pop', 'K-Pop'),
      interest('punk-rock', 'Punk rock'),
      interest('hip-hop', 'Hip hop'),
      interest('jazz', 'Jazz'),
      interest('techno', 'Techno'),
      interest('classical-music', 'Classical music'),
      interest('indie-music', 'Indie music'),
      interest('edm', 'EDM'),
      interest('vinyl', 'Vinyl')
    ]
  },
  {
    slug: 'outdoors-and-adventure',
    label: 'Outdoors and adventure',
    interests: [
      interest('diving', 'Diving'),
      interest('jetskiing', 'Jetskiing'),
      interest('nature', 'Nature'),
      interest('walking-tours', 'Walking tours'),
      interest('rowing', 'Rowing'),
      interest('walking-my-dog', 'Walking My Dog'),
      interest('travel', 'Travel'),
      interest('hiking', 'Hiking'),
      interest('camping', 'Camping'),
      interest('fishing', 'Fishing'),
      interest('road-trips', 'Road Trips'),
      interest('surfing', 'Surfing'),
      interest('skiing', 'Skiing'),
      interest('snowboarding', 'Snowboarding'),
      interest('sailing', 'Sailing')
    ]
  },
  {
    slug: 'social-and-content',
    label: 'Social and content',
    interests: [
      interest('instagram', 'Instagram'),
      interest('x', 'X'),
      interest('soundcloud', 'SoundCloud'),
      interest('spotify', 'Spotify'),
      interest('pinterest', 'Pinterest'),
      interest('social-media', 'Social Media'),
      interest('memes', 'Memes'),
      interest('tiktok', 'TikTok'),
      interest('youtube', 'YouTube'),
      interest('podcasts', 'Podcasts'),
      interest('twitch', 'Twitch'),
      interest('vlogging', 'Vlogging')
    ]
  },
  {
    slug: 'sports-and-fitness',
    label: 'Sports and fitness',
    interests: [
      interest('ice-hockey', 'Ice Hockey'),
      interest('sports-shooting', 'Sports Shooting'),
      interest('athletics', 'Athletics'),
      interest('walking', 'Walking'),
      interest('skating', 'Skating'),
      interest('beach-sports', 'Beach sports'),
      interest('gym', 'Gym'),
      interest('yoga', 'Yoga'),
      interest('running', 'Running'),
      interest('football', 'Football'),
      interest('basketball', 'Basketball'),
      interest('tennis', 'Tennis'),
      interest('cycling', 'Cycling'),
      interest('swimming', 'Swimming'),
      interest('boxing', 'Boxing'),
      interest('climbing', 'Climbing'),
      interest('pilates', 'Pilates'),
      interest('martial-arts', 'Martial arts')
    ]
  },
  {
    slug: 'tv-and-movies',
    label: 'TV and movies',
    interests: [
      interest('action-movies', 'Action movies'),
      interest('animated-movies', 'Animated movies'),
      interest('crime-shows', 'Crime shows'),
      interest('fantasy-movies', 'Fantasy movies'),
      interest('comedy-shows', 'Comedy shows'),
      interest('documentaries', 'Documentaries'),
      interest('horror-movies', 'Horror movies'),
      interest('reality-shows', 'Reality shows'),
      interest('romantic-comedies', 'Romantic comedies'),
      interest('sci-fi', 'Sci-fi'),
      interest('thrillers', 'Thrillers'),
      interest('k-dramas', 'K-dramas')
    ]
  },
  {
    slug: 'values-and-causes',
    label: 'Values and causes',
    interests: [
      interest('equality', 'Equality'),
      interest('social-development', 'Social Development'),
      interest('human-rights', 'Human Rights'),
      interest('lgbtqia-rights', 'LGBTQIA+ Rights'),
      interest('feminism', 'Feminism'),
      interest('environmentalism', 'Environmentalism'),
      interest('volunteering', 'Volunteering'),
      interest('mental-health-awareness', 'Mental Health Awareness'),
      interest('animal-welfare', 'Animal welfare'),
      interest('politics', 'Politics')
    ]
  },
  {
    slug: 'wellness-and-lifestyle',
    label: 'Wellness and lifestyle',
    interests: [
      interest('self-love', 'Self Love'),
      interest('trying-new-things', 'Trying New Things'),
      interest('spa', 'Spa'),
      interest('self-care', 'Self Care'),
      interest('meditation', 'Meditation'),
      interest('tarot', 'Tarot'),
      interest('astrology', 'Astrology'),
      interest('mindfulness', 'Mindfulness'),
      interest('journaling', 'Journaling'),
      interest('slow-living', 'Slow living'),
      interest('sauna', 'Sauna'),
      interest('cold-plunging', 'Cold plunging')
    ]
  }
]

export const ALL_INTERESTS: readonly InterestDefinition[] =
  INTEREST_CATEGORIES.flatMap((category) => category.interests)

export const INTEREST_SLUGS: readonly string[] = ALL_INTERESTS.map(
  (item) => item.slug
)

const interestSlugSet = new Set(INTEREST_SLUGS)

export const isInterestSlug = (value: string): boolean =>
  interestSlugSet.has(value)

export const INTEREST_LABEL_BY_SLUG: ReadonlyMap<string, string> = new Map(
  ALL_INTERESTS.map((item) => [item.slug, item.label])
)

export const INTEREST_CATEGORY_BY_SLUG: ReadonlyMap<string, string> =
  new Map(
    INTEREST_CATEGORIES.flatMap((category) =>
      category.interests.map((item) => [item.slug, category.slug] as const)
    )
  )

/** Matches Tinder's "10 of 10" cap in the interest picker. */
export const MAX_PROFILE_INTERESTS = 10
