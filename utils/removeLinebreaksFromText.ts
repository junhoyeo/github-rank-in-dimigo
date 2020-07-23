import getTrimmedLinesFromText from './getTrimmedLinesFromText';

export default function removeLinebreaksFromText(text: string): string {
  return getTrimmedLinesFromText(text).join(' ');
};
