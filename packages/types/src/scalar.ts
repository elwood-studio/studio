export type JsonScalar = string | number | boolean | null | undefined | any;
export type JsonObject = Record<string, JsonScalar>;
export type Json = JsonScalar | JsonObject | JsonScalar[] | JsonObject[];

// JSON Schema -- https://github.com/tdegrunt/jsonschema/blob/master/lib/index.d.ts
export interface JsonSchema {
  $id?: string;
  id?: string;
  $schema?: string;
  $ref?: string;
  title?: string;
  description?: string;
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: number | boolean;
  minimum?: number;
  exclusiveMinimum?: number | boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string | RegExp;
  additionalItems?: boolean | JsonSchema;
  items?: JsonSchema | JsonSchema[];
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  maxProperties?: number;
  minProperties?: number;
  required?: string[] | boolean;
  propertyNames?: boolean | JsonSchema;
  additionalProperties?: boolean | JsonSchema;
  definitions?: {
    [name: string]: JsonSchema;
  };
  properties?: {
    [name: string]: JsonSchema;
  };
  patternProperties?: {
    [name: string]: JsonSchema;
  };
  dependencies?: {
    [name: string]: JsonSchema | string[];
  };
  const?: any;
  enum?: any[];
  type?: string | string[];
  format?: string;
  allOf?: JsonSchema[];
  anyOf?: JsonSchema[];
  oneOf?: JsonSchema[];
  not?: JsonSchema;
  if?: JsonSchema;
  then?: JsonSchema;
  else?: JsonSchema;
  default?: any;
}
