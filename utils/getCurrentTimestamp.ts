export default function getCurrentTimestamp(): number {
  return ~~(Date.now() / 1000);
};
