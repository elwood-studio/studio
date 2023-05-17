import { JsonObject } from '../scalar';

export type ConfigurationPlugin =
  | string
  | [string]
  | [string, JsonObject]
  | JsonObject
  | [JsonObject, JsonObject];
