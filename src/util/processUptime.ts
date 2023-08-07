export const processStartedAt = Date.now();
export function getProcessUptime(): number {
  return Date.now() - processStartedAt;
}
