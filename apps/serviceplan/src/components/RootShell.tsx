import "@/app/globals.css";
import JsonLd, { organizationSchema, websiteSchema } from "@/components/JsonLd";
import { Locale } from "@/lib/routes";

const GTM_ID = "GTM-WFRT3NVF";

/**
 * The shared <html>/<body> shell. Rendered by one root layout per locale so
 * that /de can declare lang="de" without making the tree dynamic.
 */
export default function RootShell({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <html
      lang={locale}
      data-wf-domain="www.serviceplan-agents.com"
      data-wf-page="6990b008d2c582acd039bfe7"
      data-wf-site="6990b006d2c582acd039bf7e"
      className="w-mod-js w-mod-ix w-mod-ix3"
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="/styles/webflow.css" rel="stylesheet" type="text/css" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
          }}
        />
        <JsonLd data={[organizationSchema(locale), websiteSchema(locale)]} />
      </head>
      <body>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
