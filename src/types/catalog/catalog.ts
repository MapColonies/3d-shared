import { Layer3DMetadata } from '../core/metadata';

export interface Record3D extends Layer3DMetadata {
  links: string;
}

export type IFindRecordsPayload = Partial<Layer3DMetadata>;
