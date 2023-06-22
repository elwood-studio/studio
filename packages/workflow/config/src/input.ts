import type { JsonObject } from '@elwood/types';
import type {
  WorkflowRunnerInput,
  WorkflowRunnerKeychain,
  WorkflowRunnerSecrets,
} from '@elwood/workflow-types';

import { WorkflowInputKeyName } from './constants';

export type CreateWorkflowInputOptions = {
  trackingId?: string | null;
  secrets?: WorkflowRunnerSecrets | null;
  keychain?: WorkflowRunnerKeychain | null;
};

export function createWorkflowInput(
  values: JsonObject,
  options: CreateWorkflowInputOptions = {},
): WorkflowRunnerInput {
  return {
    ...values,
    [WorkflowInputKeyName.TrackingId]: options.trackingId ?? undefined,
    [WorkflowInputKeyName.Secrets]: options.secrets ?? undefined,
    [WorkflowInputKeyName.Keychain]: options.keychain ?? undefined,
  };
}

export function normalizeWorkflowInput(
  input: JsonObject = {},
): WorkflowRunnerInput {
  return {
    ...input,
    [WorkflowInputKeyName.Secrets]: undefined,
    [WorkflowInputKeyName.Keychain]: undefined,
    [WorkflowInputKeyName.TrackingId]: undefined,
  };
}

export function getTrackingIdFromInput(input: JsonObject = {}): string | null {
  return input[WorkflowInputKeyName.TrackingId] ?? [];
}

export function getWorkflowSecretsFromInput(
  input: JsonObject = {},
): WorkflowRunnerSecrets {
  return input[WorkflowInputKeyName.Secrets] ?? [];
}
export function getWorkflowKeychainFromInput(
  input: JsonObject = {},
): WorkflowRunnerKeychain {
  return input[WorkflowInputKeyName.Keychain] ?? [];
}
