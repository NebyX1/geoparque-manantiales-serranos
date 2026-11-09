import { places } from '../../data/geosites';
import { buildExperienceClusters } from './clusters';
import { locatedExperiencePoints } from './scene-data';

const representativeIds = [1, 4, 54, 39, 23, 29, 33, 58];
const highlightIds = [
  [1, 50, 51],
  [4, 5],
  [9, 10, 11],
  [39, 41, 45],
  [21, 22, 23],
  [27, 28, 29],
  [32, 33, 34],
  [58, 59],
];

/** Editorial information is derived from the canonical collection at build time. */
export const experienceClusters = buildExperienceClusters(locatedExperiencePoints).map(
  (cluster) => {
    const representative = places.find((place) => place.id === representativeIds[cluster.style]);
    const names = (highlightIds[cluster.style] ?? cluster.memberIds.slice(0, 3)).map(
      (id) => places.find((place) => place.id === id)!.name,
    );
    const context = `Esta zona reúne ${names.slice(0, -1).join(', ')} y ${names.at(-1)}${cluster.memberIds.length > names.length ? ', entre otros lugares próximos.' : '.'}`;
    return { ...cluster, description: `${context} ${representative?.intro ?? ''}` };
  },
);
