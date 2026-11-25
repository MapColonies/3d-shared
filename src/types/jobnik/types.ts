import type { z } from 'zod';
import type { JOB_TYPES, STAGE_TYPES } from '../../constants/jobnik';
import type { jobDataSchema } from '../../schemas/jobnik/jobs.schema';
import type {
  deleteFilesTaskSchema,
  extract3tzTaskSchema,
  insertPartsTaskSchema,
  insertRecordTaskSchema,
  modelTaskSchema,
  planUploadTaskSchema,
  recordMetadataSchema,
  uploadFilesTaskSchema,
  validateShapefilesTaskSchema,
} from '../../schemas/jobnik/tasks.schema';

type Metadata = Record<string, unknown>;

interface JobDefinition<Data> {
  userMetadata: Metadata;
  data: Data;
}

interface StageDefinition<TaskData> {
  userMetadata: Metadata;
  data: Metadata;
  task: { userMetadata: Metadata; data: TaskData };
}

export type JobData3D = z.input<typeof jobDataSchema>;
export type ValidateShapefilesTask = z.input<typeof validateShapefilesTaskSchema>;
export type Extract3tzTask = z.input<typeof extract3tzTaskSchema>;
export type PlanUploadTask = z.input<typeof planUploadTaskSchema>;
export type UploadFilesTask = z.input<typeof uploadFilesTaskSchema>;
export type DeleteFilesTask = z.input<typeof deleteFilesTaskSchema>;
export type InsertPartsTask = z.input<typeof insertPartsTaskSchema>;
export type RecordMetadata = z.input<typeof recordMetadataSchema>;
export type InsertRecordTask = z.input<typeof insertRecordTaskSchema>;
export type ModelTask = z.input<typeof modelTaskSchema>;

export interface Jobs3D {
  [JOB_TYPES.ingestion]: JobDefinition<JobData3D>;
  [JOB_TYPES.delete]: JobDefinition<JobData3D>;
}

export interface Stages3D {
  [STAGE_TYPES.validateShapefiles]: StageDefinition<ValidateShapefilesTask>;
  [STAGE_TYPES.extract3tz]: StageDefinition<Extract3tzTask>;
  [STAGE_TYPES.planUpload]: StageDefinition<PlanUploadTask>;
  [STAGE_TYPES.uploadFiles]: StageDefinition<UploadFilesTask>;
  [STAGE_TYPES.deleteTempFiles]: StageDefinition<DeleteFilesTask>;
  [STAGE_TYPES.insertParts]: StageDefinition<InsertPartsTask>;
  [STAGE_TYPES.insertRecord]: StageDefinition<InsertRecordTask>;
  [STAGE_TYPES.deleteModelFiles]: StageDefinition<DeleteFilesTask>;
  [STAGE_TYPES.deleteParts]: StageDefinition<ModelTask>;
  [STAGE_TYPES.deleteRecord]: StageDefinition<ModelTask>;
}
