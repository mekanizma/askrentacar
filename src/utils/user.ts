export function stripPassword<T extends { password?: string }>(user: T) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...safe } = user;
  return safe;
}
