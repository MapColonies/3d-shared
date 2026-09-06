import { Domain, ProductType } from '@map-colonies/types';
import { pickEnum } from '../../utils/typeUtils';

export const THREED_DOMAIN = Domain._3D;

export const Layer3DProductTypes = pickEnum(ProductType, [
  'PHOTO_REALISTIC',
  'PHOTO_REALISTIC_BEST',
  'SEMANTIC',
  'SEMANTIC_MESH',
  'QUANTIZED_MESH_DTM_BEST',
  'QUANTIZED_MESH_DSM_BEST',
  'POINT_CLOUD',
] as const);

export type Layer3DProductTypes = (typeof Layer3DProductTypes)[keyof typeof Layer3DProductTypes];

export const LAYER_3D_PRODUCT_TYPE_LIST = Object.values(Layer3DProductTypes) as Layer3DProductTypes[];

export const CORE_VALIDATIONS = {
  resolutionMeter: {
    min: 0.01,
    max: 8000,
    description: 'Resolution in meters',
  },
  accuracy: {
    min: 0,
    max: 999,
    description: 'Accuracy in meters (CEP90/LEP90/SEP90)',
  },
} as const;
