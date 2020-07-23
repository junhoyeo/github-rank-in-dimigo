export default function getSumOfNumberArray(arrayOfNumbers: number[]): number {
  return arrayOfNumbers.reduce((a, b) => a + b, 0);
}
