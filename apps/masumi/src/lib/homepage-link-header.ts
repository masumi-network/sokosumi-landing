/**
 * RFC 8288 Link header for the homepage (agent discovery).
 * Keep in sync with middleware and any scanners expecting these relations.
 */
export const HOMEPAGE_LINK_HEADER =
  '</.well-known/api-catalog>; rel="api-catalog", </docs/api>; rel="service-doc", </skill.md>; rel="describedby"';
