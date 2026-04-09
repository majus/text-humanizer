const CONTROL_CHARS_REGEX = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function normalizeText(rawText) {
  const input = (rawText || "").toString().normalize("NFKC");
  const withoutSoftHyphen = input.replace(/\u00AD/g, "");
  const dehyphenated = withoutSoftHyphen.replace(/([A-Za-z])-\s*\n\s*([A-Za-z])/g, "$1$2");
  const unixNewlines = dehyphenated.replace(/\r\n?/g, "\n");
  const noControlChars = unixNewlines.replace(CONTROL_CHARS_REGEX, " ");
  const compactedTabs = noControlChars.replace(/\t/g, " ");
  const normalizedSpaces = compactedTabs
    .split("\n")
    .map((line) => line.replace(/[^\S\n]+/g, " ").trimEnd())
    .join("\n");
  const normalizedParagraphBreaks = normalizedSpaces
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return normalizedParagraphBreaks;
}

export function stripHtml(html) {
  return (html || "")
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<\/?(p|div|section|article|h[1-6]|li|ul|ol|br|tr|td|th|table)\b[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'");
}
