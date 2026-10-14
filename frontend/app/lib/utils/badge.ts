enum SourceType {
  REDDIT = "reddit",
  GOOGLE_NEWS = "google",
  WEBSITE = "website",
}

export function getBadgeColor(source: string): string {
  switch (source) {
    case SourceType.REDDIT:
      return "bg-red-900";

    case SourceType.GOOGLE_NEWS:
      return "bg-green-900";

    case SourceType.WEBSITE:
      return "bg-blue-900";

    default:
      return "bg-gray-900";
  }
}
