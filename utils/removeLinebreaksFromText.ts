export default function removeLinebreaksFromText(text: string): string {
  return text
    .split('\n')
    .filter(isNotEmpty => isNotEmpty)
    .join(' ');
};
