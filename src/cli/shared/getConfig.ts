import { read } from 'libnpmconfig';

export function getConfig() {
  const npmconfig = read();
  return npmconfig.toJSON();
}
