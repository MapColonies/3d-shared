/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ellipse, bboxPolygon } from '@turf/turf';
import proj4 from 'proj4';
import type { BBox, Polygon } from 'geojson';
import { PROJECTIONS } from '../constants/core/constants';
import type { BoundingRegion, BoundingSphere, TileSetJson } from '../types/core/tileset';

export const ERROR_BOX_TILESET = 'BoundingVolume of box is not supported yet. Please contact 3D team.';
export const ERROR_BAD_FORMAT_TILESET = 'Bad tileset format. Should be in 3DTiles format';

export const convertSphereFromXYZToWGS84 = (shape: BoundingSphere): Polygon => {
  const coord = proj4(PROJECTIONS.sphere).inverse<number[]>(shape.sphere);
  const radius = coord[3] / 1000;
  return ellipse([coord[0], coord[1]], radius, radius, {}).geometry;
};

export const convertRegionFromRadianToDegrees = (shape: BoundingRegion): Polygon => {
  const radianToDegree = 180 / Math.PI;
  const coord = shape.region.slice(0, 4).map((value) => value * radianToDegree);
  return bboxPolygon(coord as BBox).geometry;
};

export const calculatePolygonFromTileset = (tileSetJson: TileSetJson): Polygon => {
  const shape = tileSetJson.root.boundingVolume;
  if (shape.sphere !== undefined) {
    return convertSphereFromXYZToWGS84(shape as BoundingSphere);
  }
  if (shape.region !== undefined) {
    return convertRegionFromRadianToDegrees(shape as BoundingRegion);
  }
  if (shape.box !== undefined) {
    throw new Error(ERROR_BOX_TILESET);
  }
  throw new Error(ERROR_BAD_FORMAT_TILESET);
};
