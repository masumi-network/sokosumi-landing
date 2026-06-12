import { Locale, t } from "@/lib/translations";

export default function HouseOfAI({ locale = "en" }: { locale?: Locale }) {
  const tt = t(locale).houseOfAI;

  return (
    <div className="section-bottom-cta">
      <div className="padding-global">
        <div className="padding-section-medium">
          <div className="container-large">
            <div className="div-block-36">
              <div className="house-of-ai-contetn">
                <h3 className="heading-style-h3">{tt.heading}</h3>
                <div className="text-size-regular is-white">
                  {tt.description}
                </div>
                <a
                  href="https://www.house-of-communication.com/de/en.html"
                  target="_blank"
                  className="link-with-arrow is-white w-inline-block"
                >
                  <div className="icon w-embed">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clipPath="url(#clip0_39_70_house)">
                        <path
                          d="M23.3408 11.0952L23.7314 11.4585L23.3428 11.8247L15.3428 19.3638L14.6572 18.6353L21.6729 12.0229H5.9502C5.71855 13.1641 4.70947 14.0229 3.5 14.0229C2.11931 14.0229 1.00004 12.9036 1 11.5229C1 10.1422 2.11929 9.02295 3.5 9.02295C4.70952 9.02295 5.7186 9.88178 5.9502 11.0229H21.7988L14.6592 4.36475L15.3408 3.63428L23.3408 11.0952ZM3.5 10.0229C2.67157 10.0229 2 10.6945 2 11.5229C2.00004 12.3513 2.67159 13.0229 3.5 13.0229C4.32841 13.0229 4.99996 12.3513 5 11.5229C5 10.6945 4.32843 10.0229 3.5 10.0229Z"
                          fill="#FF4B4F"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_39_70_house">
                          <rect width="24" height="24" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                  <div>{tt.linkText}</div>
                </a>
              </div>
              <img src="/images/cta-image.avif" loading="lazy" sizes="100vw" alt="Call to action section image" className="max-width-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
