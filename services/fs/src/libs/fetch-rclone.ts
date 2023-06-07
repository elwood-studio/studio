import { getConfig } from './get-config';

const { rcloneHost } = getConfig();

export async function fetchRclone(
  url: string,
  init: RequestInit = {},
): Promise<Response> {
  const response = await fetch(`http://${rcloneHost}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    ...init,
  });

  return response;
}
