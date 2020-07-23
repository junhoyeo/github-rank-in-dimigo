export default function getTrimmedLinesFromText(text: string): string[] {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(isNotEmpty => isNotEmpty);
}
