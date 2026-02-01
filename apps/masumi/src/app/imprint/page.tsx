import type { Metadata } from "next";
import { Header, Footer } from "@summation/shared";

export const metadata: Metadata = {
  title: "Imprint",
  description: "Legal imprint and company information for Masumi.",
};

export default function ImprintPage() {
  return (
    <>
      <Header product="masumi" />
      <main className="pt-[140px] pb-24">
        <div className="max-w-[720px] mx-auto px-4 md:px-8">
          <h1 className="text-[32px] md:text-[40px] font-normal tracking-[-0.4px] leading-[1.2] text-black mb-16">
            Imprint
          </h1>

          <div className="flex flex-col gap-12 text-[16px] text-[#333] leading-[1.7]">
            <section>
              <h2 className="text-[20px] font-medium text-black mb-4">Plan.Net Group</h2>
              <p>
                Plan.Net Germany GmbH &amp; Co KG
                <br />
                House of Communication
                <br />
                Friedenstr. 24
                <br />
                81671 Munich
                <br />
                Germany
              </p>
              <div className="mt-6 flex flex-col gap-1">
                <p>Phone: +49 89 2050 30</p>
                <p>Fax: +49 89 2050 3611</p>
                <p>
                  E-mail:{" "}
                  <a
                    href="mailto:plan-net@house-of-communication.com"
                    className="text-[#FA008C] underline underline-offset-2 hover:text-[#460A23]"
                  >
                    plan-net@house-of-communication.com
                  </a>
                </p>
              </div>
              <div className="mt-6 flex flex-col gap-1">
                <p>VAT ID number: DE222163784</p>
                <p>Munich Local Court (Amtsgericht München): HRA 79530</p>
              </div>
            </section>

            <section>
              <h2 className="text-[20px] font-medium text-black mb-4">
                Managing directors authorized to represent the company
              </h2>
              <p>Florian Haller, Wolf Ingomar Faecks, Marcus Ambrus</p>
              <p className="mt-4">
                Responsible for the content according to § 55 (2) RStV:
                <br />
                Florian Haller, Friedenstr. 24, 81671 Munich, Germany
              </p>
            </section>

            <section>
              <h2 className="text-[20px] font-medium text-black mb-4">Other agencies</h2>
              <p>
                Insofar as you access the areas of our agencies outside of Germany, the
                responsible body is the respective agency named.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer product="masumi" />
    </>
  );
}
