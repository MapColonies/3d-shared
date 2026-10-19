export interface ShapeMetadataCommon {
  productId: string;
  productName: string;
  srsId: string;
  srsName: string;
  producerName: string;
  productionSystem: string;
  productionSystemVersion: string;
  productionDate: string;
}

export interface ShapeMetadataAggregated {
  imagingTimeBeginUTC: Date;
  imagingTimeEndUTC: Date;
  minResolutionMeter: number;
  maxResolutionMeter: number;
  maxAbsoluteAccuracyCEP90: number;
  maxAbsoluteAccuracyLEP90: number;
  maxAbsoluteAccuracySEP90?: number;
  maxRelativeAccuracyCEP90?: number;
  maxRelativeAccuracyLEP90?: number;
  maxRelativeAccuracySEP90?: number;
  sensors: string[];
}

export interface ShapeMetadataPart {
  id?: number;
  productType?: string;
  description?: string;
  classification?: string;
  countries?: string[];
  cities?: string[];
  inliersAmt?: number;
  accAlg?: string;
  mean?: number;
  std?: number;
}

export interface ShapeMetadataRow {
  common: ShapeMetadataCommon;
  aggregated: ShapeMetadataAggregated;
  part: ShapeMetadataPart;
}

export type ShapeMetadataResult<T> = { success: true; data: T } | { success: false; errors: string[] };
