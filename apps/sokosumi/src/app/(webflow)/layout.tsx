// Webflow pages share a CSS bundle (sokosumi-styles.min.css + style.css).
// Loading them once in the layout means every (webflow) page picks them up
// without re-emitting <link> tags. Per-page extras (Swiper, Font Awesome,
// etc.) are emitted by the individual page from the helper's stylesheet
// list.

export default function WebflowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link
        rel="stylesheet"
        href="/assets/cdn/sokosumi-styles.min.css"
      />
      <link rel="stylesheet" href="/css/style.css" />
      {children}
    </>
  );
}
