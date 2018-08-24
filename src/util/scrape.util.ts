export default function parseForRoutes(page: string): string[] {
  const hrefRegex = /href="\/[\/\w\d\-]*"/g;
  const routeRegex = /\/([\/\w\d\-]*)/;

  const hrefMatches = page.match(hrefRegex);

  if (hrefMatches) {
    const pathMatches = hrefMatches.map((href: string) => href.match(routeRegex));

    if (pathMatches) {
      return pathMatches.map((pathMatch: RegExpMatchArray | null) => {
        if (pathMatch) {
          return pathMatch[1];
        } else {
          return '';
        }
      });
    }
  }

  return [''];
}
