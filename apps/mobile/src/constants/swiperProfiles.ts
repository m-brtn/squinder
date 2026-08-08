import { Image } from 'react-native';

export type SwiperProfile = {
  readonly id: string;
  readonly nameMessageId: string;
  readonly age: number;
  readonly distance: number;
  readonly bioMessageId: string;
  readonly imageUrl: string;
};

export const swiperProfiles: readonly SwiperProfile[] = [
  {
    id: 'maya',
    nameMessageId: 'swiper.profiles.maya.name',
    age: 26,
    distance: 2,
    bioMessageId: 'swiper.profiles.maya.bio',
    imageUrl:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'emma',
    nameMessageId: 'swiper.profiles.emma.name',
    age: 27,
    distance: 5,
    bioMessageId: 'swiper.profiles.emma.bio',
    imageUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'sofia',
    nameMessageId: 'swiper.profiles.sofia.name',
    age: 25,
    distance: 8,
    bioMessageId: 'swiper.profiles.sofia.bio',
    imageUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'lina',
    nameMessageId: 'swiper.profiles.lina.name',
    age: 24,
    distance: 11,
    bioMessageId: 'swiper.profiles.lina.bio',
    imageUrl:
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=1200&q=85',
  },
];

const preloadedImageUrls = new Set<string>();
let preloadQueue = Promise.resolve();

export function preloadSwiperImages() {
  preloadQueue = preloadQueue.then(async () => {
    for (const { imageUrl } of swiperProfiles) {
      if (preloadedImageUrls.has(imageUrl)) continue;

      try {
        if (await Image.prefetch(imageUrl)) {
          preloadedImageUrls.add(imageUrl);
        }
      } catch {
        // A later preparation pass can retry failed images.
      }
    }
  });

  return preloadQueue;
}
