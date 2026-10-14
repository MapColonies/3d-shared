import { ILayer3DMetadata } from '../core/metadata';

export interface Record3D extends ILayer3DMetadata {
  links: string;
}

export type IFindRecordsPayload = Partial<ILayer3DMetadata>;
