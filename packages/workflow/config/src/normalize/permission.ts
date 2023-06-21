import {
  WorkflowPermission,
  WorkflowPermissionValue,
  WorkflowRunnerPermission,
  WorkflowRunnerPermissionValue,
} from '@elwood-studio/workflow-types';

export function normalizePermissionItem(
  value: WorkflowPermissionValue | undefined | null,
): WorkflowRunnerPermissionValue {
  if (!value) {
    return false;
  }

  if (typeof value === 'string') {
    return [value];
  }
  return value;
}

export function normalizePermission(
  permission: WorkflowPermission | undefined,
  defaults?: WorkflowRunnerPermission | undefined,
): WorkflowRunnerPermission {
  if (typeof permission === 'string') {
    return normalizePermission(permission === '*' || permission === 'all');
  }

  if (permission === true || permission === false) {
    return normalizePermission({
      run: permission,
      read: permission,
      write: permission,
      net: permission,
      env: permission,
      sys: permission,
      ffi: permission,
      unstable: permission,
    });
  }

  return {
    run: normalizePermissionItem(permission?.run ?? defaults?.run),
    read: normalizePermissionItem(permission?.read ?? defaults?.read),
    write: normalizePermissionItem(permission?.write ?? defaults?.write),
    net: normalizePermissionItem(permission?.net ?? defaults?.net),
    env: normalizePermissionItem(permission?.env ?? defaults?.env),
    sys: normalizePermissionItem(permission?.sys ?? defaults?.sys),
    ffi: normalizePermissionItem(permission?.ffi ?? defaults?.ffi),
    unstable: permission?.unstable ?? defaults?.unstable ?? false,
  };
}
