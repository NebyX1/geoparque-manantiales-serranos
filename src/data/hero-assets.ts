import arequita from '../assets/images/hero/mobile/arequita-rio.webp';
import aguas from '../assets/images/hero/mobile/aguas.webp';
import salus from '../assets/images/hero/mobile/salus.webp';
import parque from '../assets/images/hero/mobile/parque.webp';

export const mobileHeroAssets = {
  'arequita-rio': arequita,
  aguas,
  salus,
  parque,
};
export type HeroAssetKey = keyof typeof mobileHeroAssets;
