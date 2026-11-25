import { EPSGDATA, type EpsgCode } from '@map-colonies/types';

export const isEpsgCode = (code: string): code is EpsgCode => Object.prototype.hasOwnProperty.call(EPSGDATA, code);
