/* /tools/schema-generator — client-only. Nothing leaves the browser: the
 * JSON-LD is assembled here from the visible form fields.
 */
(function () {
  "use strict";
  var form = document.getElementById("smgForm");
  if (!form) return;

  var typeSelect = document.getElementById("smgType");
  var result = document.getElementById("smgResult");
  var output = document.getElementById("smgOutput");
  var copyBtn = document.getElementById("smgCopy");
  var fieldGroups = document.querySelectorAll("[data-fields]");

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  function showFieldsFor(type) {
    fieldGroups.forEach(function (group) {
      group.hidden = group.getAttribute("data-fields") !== type;
    });
  }

  function linesOf(id) {
    return val(id)
      .split("\n")
      .map(function (l) { return l.trim(); })
      .filter(Boolean);
  }

  var BUILDERS = {
    Article: function () {
      return {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: val("art-headline"),
        author: { "@type": "Person", name: val("art-author") },
        datePublished: val("art-date"),
        image: val("art-image"),
      };
    },
    Product: function () {
      return {
        "@context": "https://schema.org",
        "@type": "Product",
        name: val("prod-name"),
        description: val("prod-desc"),
        offers: {
          "@type": "Offer",
          price: val("prod-price"),
          priceCurrency: val("prod-currency") || "USD",
          availability: "https://schema.org/" + (val("prod-availability") || "InStock"),
        },
      };
    },
    FAQPage: function () {
      var raw = val("faq-pairs");
      var pairs = raw.split(/\n\s*\n/).map(function (block) {
        var q = /Q:\s*(.+)/i.exec(block);
        var a = /A:\s*([\s\S]+)/i.exec(block);
        return q && a ? { "@type": "Question", name: q[1].trim(), acceptedAnswer: { "@type": "Answer", text: a[1].trim() } } : null;
      }).filter(Boolean);
      return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: pairs };
    },
    Organization: function () {
      return {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: val("org-name"),
        url: val("org-url"),
        logo: val("org-logo"),
        sameAs: linesOf("org-sameas"),
      };
    },
    LocalBusiness: function () {
      return {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: val("lb-name"),
        address: val("lb-address"),
        telephone: val("lb-phone"),
        priceRange: val("lb-pricerange"),
      };
    },
    HowTo: function () {
      return {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: val("how-name"),
        step: linesOf("how-steps").map(function (s, i) { return { "@type": "HowToStep", position: i + 1, text: s }; }),
      };
    },
    Review: function () {
      return {
        "@context": "https://schema.org",
        "@type": "Review",
        itemReviewed: { "@type": "Thing", name: val("rev-item") },
        author: { "@type": "Person", name: val("rev-author") },
        reviewRating: { "@type": "Rating", ratingValue: val("rev-rating") || "5", bestRating: "5" },
        reviewBody: val("rev-body"),
      };
    },
  };

  typeSelect.addEventListener("change", function () {
    showFieldsFor(typeSelect.value);
  });
  showFieldsFor(typeSelect.value);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var builder = BUILDERS[typeSelect.value];
    if (!builder) return;
    var data = builder();
    output.textContent = "<script type=\"application/ld+json\">\n" + JSON.stringify(data, null, 2) + "\n</script>";
    result.hidden = false;
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  copyBtn.addEventListener("click", function () {
    var text = output.textContent;
    if (!text) return;
    navigator.clipboard.writeText(text).then(
      function () {
        copyBtn.textContent = "Copied";
        setTimeout(function () {
          copyBtn.textContent = "Copy JSON-LD";
        }, 1600);
      },
      function () {},
    );
  });
})();
