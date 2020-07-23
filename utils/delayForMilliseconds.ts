export default function delayForMilliseconds(delay: number): Promise<void> {
  return new Promise((resolve, _) => {
    setTimeout(() => {
      resolve();
    }, delay);
  });
}
