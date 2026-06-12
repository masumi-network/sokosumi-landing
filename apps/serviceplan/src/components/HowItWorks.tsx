import { Locale, t } from "@/lib/translations";

export default function HowItWorks({ locale = "en" }: { locale?: Locale }) {
  const tt = t(locale).howItWorks;

  return (
    <div className="section_howit-works">
      <div className="padding-global">
        <div className="padding-section-large">
          <div className="container-large">
            <div className="hiw-header">
              <div className="header-wrapper">
                <h2>{tt.heading}</h2>
                <div className="sub-text-heading">
                  {tt.subheading}
                </div>
              </div>
            </div>
            <div>
              <div className="how-it-works-wrap">
                <div className="steps-grid">
                  {/* Step 1 */}
                  <div className="step-contetn">
                    <div className="step-img-wrap">
                      <div className="step-1-wrapper">
                        <img
                          src="/images/step-1.webp"
                          loading="lazy"
                          width={252.5}
                          sizes="(max-width: 479px) 100vw, 253px"
                          alt=""
                          className="image-7"
                        />
                        <div className="step-text-wrapper">
                          <div className="step-1-text">
                            <div className="text-size-tiny text-weight-medium">
                              {tt.questionBubble1}
                            </div>
                          </div>
                          <div className="step-1-text _2">
                            <div className="text-size-tiny text-weight-medium">
                              {tt.questionBubble2}
                            </div>
                          </div>
                          <div className="step-1-text _3">
                            <div className="text-size-tiny text-weight-medium">
                              {tt.questionBubble3}
                            </div>
                          </div>
                          <div className="bottom-gradinet-below"></div>
                        </div>
                      </div>
                    </div>
                    <div className="line-step"></div>
                    <div className="steps-wrapper">
                      <div className="step-heading">
                        <div className="step">Step 1</div>
                        <div className="heading-style-h5">
                          {tt.step1Heading}{" "}
                        </div>
                      </div>
                      <div className="explanation">
                        {tt.step1Description}{" "}
                      </div>
                      <div className="arrow w-embed">
                        <svg
                          width="33"
                          height="23"
                          viewBox="0 0 33 23"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M32.0283 10.6963L32.5869 11.2178L32.0303 11.7422L20.5615 22.5498L19.5791 21.5068L29.6396 12.0254H7.0957C6.76376 13.6615 5.318 14.8926 3.58398 14.8926C1.6046 14.8926 0 13.288 0 11.3086C0.00024998 9.32943 1.60476 7.72461 3.58398 7.72461C5.31769 7.72461 6.76342 8.95617 7.0957 10.5918H29.8125L19.5811 1.04883L20.5596 0L32.0283 10.6963ZM3.58398 9.1582C2.39651 9.1582 1.43384 10.1212 1.43359 11.3086C1.43359 12.4962 2.39636 13.459 3.58398 13.459C4.77161 13.459 5.73438 12.4962 5.73438 11.3086C5.73413 10.1212 4.77146 9.1582 3.58398 9.1582Z"
                            fill="#FF4B4F"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="step-contetn">
                    <div className="step-img-wrap">
                      <div className="agents-work-wrap second">
                        {/* Floating brand logos */}
                        <div className="step2-floating-logos">
                          <div className="step2-logo step2-logo-gwi">
                            <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '20px', letterSpacing: '-0.02em' }}>GWI.</span>
                          </div>
                          <div className="step2-logo step2-logo-statista">
                            <svg width="80" height="16" viewBox="0 0 119 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M118.862 7.60373L118.925 7.5978C119.023 7.7488 118.974 10.3835 118.975 10.803L118.979 18.1607C118.979 19.4869 119.019 21.0768 118.951 22.3839C118.834 22.5627 118.675 22.7969 118.471 22.8843C118.158 23.0187 98.5895 23.0284 96.622 22.9524C96.3929 22.9435 96.1958 22.9152 95.9806 22.8382C95.4622 22.2747 95.6228 21.2712 95.6197 20.4614C100.85 20.5564 105.033 18.8282 108.132 14.5994C109.506 12.7255 110.58 10.8285 112.397 9.31167C114.24 7.77269 116.544 7.69503 118.862 7.60373Z" fill="white"/>
                              <path d="M96.1891 0.0516388C97.4719 -0.0420085 99.6453 0.0202791 100.985 0.020526L109.993 0.0228715L115.5 0.0155261C116.4 0.0142298 117.398 -0.0154027 118.291 0.0613918C118.612 0.0889859 118.774 0.353075 118.95 0.594879C118.998 1.19609 118.969 1.92422 119 2.55246C114.995 2.57308 111.801 3.09928 108.768 5.8161C106.395 7.91165 105.704 9.46365 103.865 11.8701C102.193 14.0587 100.385 15.0867 97.6275 15.2525C97.052 15.2871 96.1834 15.3383 95.6274 15.4114L95.633 5.09112C95.6318 3.63357 95.5646 2.06083 95.687 0.603893C95.7083 0.35141 95.9801 0.172757 96.1891 0.0516388Z" fill="white"/>
                              <path d="M28.0143 4.57521C29.5146 4.40662 31.5057 4.58595 32.7633 5.49841C34.8339 7.00053 34.4475 9.75081 34.4455 12.0028L34.441 17.3037C34.4397 19.3442 34.3886 20.6083 34.6762 22.6296C33.4707 22.6181 32.2562 22.6281 31.0499 22.6309C31.0206 22.2596 30.8861 21.649 30.8112 21.2629C29.0718 22.6727 26.8293 23.5444 24.5717 22.5477C23.689 22.1579 23.1694 21.4019 22.8646 20.5147C21.6697 14.7497 25.9904 12.7086 30.6485 10.8459C30.6397 9.98267 30.7005 8.92749 30.1648 8.17899C29.615 7.4108 28.1836 7.4395 27.4768 7.96225C26.8513 8.42493 26.7728 9.35825 26.6787 10.0804L22.8646 10.0872C23.165 6.99861 24.7203 4.86615 28.0143 4.57521ZM26.9097 19.5338C27.3956 19.8405 27.9858 19.9438 28.5494 19.8209C29.4411 19.6347 30.1214 18.9079 30.6267 18.1994C30.6328 17.5793 30.7157 13.9775 30.5941 13.6472C28.8891 14.6629 25.4693 16.6414 26.6597 19.2159C26.6946 19.2915 26.8499 19.4668 26.9097 19.5338Z" fill="white"/>
                              <path d="M82.1182 4.56481C83.5423 4.32689 85.582 4.69741 86.7776 5.55011C88.8104 6.99989 88.3956 9.7827 88.3937 12.0102L88.3886 17.2163C88.3868 19.2856 88.3265 20.5734 88.6466 22.6264L85.0203 22.6255C84.9444 22.1817 84.8728 21.744 84.773 21.3044C82.3448 23.2985 78.1279 24.0755 76.8137 20.4264C75.5227 14.8148 80.2367 12.5939 84.6607 10.8408C84.6193 9.9619 84.7184 8.85548 84.1253 8.13995C83.5065 7.39429 82.1277 7.38503 81.4216 8.00976C80.8128 8.54793 80.752 9.33273 80.7156 10.0811C79.417 10.0861 78.1185 10.0839 76.8206 10.0746C76.8884 9.81931 76.933 9.48373 76.9731 9.21952C77.3911 6.48035 79.294 4.75673 82.1182 4.56481ZM80.8781 19.525C82.4182 20.5045 83.681 19.3514 84.6324 18.2327C84.6343 17.8183 84.6914 13.8006 84.5678 13.6777C83.0735 14.5023 81.0582 15.7011 80.5222 17.4301C80.2894 18.18 80.3779 18.9046 80.8781 19.525Z" fill="white"/>
                              <path d="M4.91209 4.56716C8.0375 4.06269 10.5035 6.42733 11.0511 9.32317C10.1255 9.40472 8.76207 9.66825 7.82261 9.82499C7.63251 9.18668 7.50943 8.69308 7.0435 8.17675C6.41853 7.48412 5.18252 7.3293 4.48525 8.0102C4.22185 8.26867 4.07706 8.62165 4.0844 8.98754C4.107 10.7684 7.71723 12.4206 9.00138 13.7472C10.2797 14.9619 11.1059 16.2849 11.1177 18.1008C11.1396 21.4855 8.71393 22.9417 5.64369 22.9599C2.16186 22.8746 0.807985 20.9753 0 17.9392C1.12881 17.6441 2.25506 17.3396 3.3786 17.0256C3.53299 17.8648 3.73207 18.7388 4.39463 19.3386C5.0769 19.9789 6.43861 20.1237 7.09584 19.3798C7.71221 18.6822 7.51439 17.6196 6.95758 16.9602C5.82977 15.6365 4.2039 14.7567 2.86735 13.6471C1.22613 12.3158 0.20576 10.6956 0.519092 8.52473C0.841543 6.29072 2.62892 4.74983 4.91209 4.56716Z" fill="white"/>
                              <path d="M58.8411 4.56207C59.9626 4.37323 61.4883 4.69874 62.4391 5.321C63.9674 6.3213 64.6351 7.60607 65.018 9.31925C64.027 9.41321 62.7944 9.65556 61.7927 9.82922C61.5887 9.16091 61.4551 8.64285 60.953 8.11468C60.3191 7.44809 59.0884 7.34192 58.4206 8.0243C58.1532 8.2987 58.0131 8.66983 58.034 9.04948C58.1087 10.7461 61.7557 12.4806 62.9971 13.7568C64.2128 14.9148 65.0255 16.2521 65.0563 17.975C65.1171 21.3811 62.8747 22.8962 59.6978 22.9603C56.3155 22.8208 54.6382 21.1024 53.9874 17.9194C55.0901 17.6531 56.2317 17.328 57.3303 17.031C57.4707 17.8591 57.7047 18.7703 58.3679 19.3506C58.8072 19.7327 59.3852 19.9241 59.9701 19.8813C60.3637 19.8548 60.8111 19.6922 61.0572 19.3654C62.2778 17.7222 60.3812 16.2691 59.158 15.3795C57.2091 13.9619 54.6518 12.3615 54.4279 9.74014C54.3216 8.49624 54.6442 7.24012 55.4674 6.28068C56.3101 5.28328 57.5269 4.66343 58.8411 4.56207Z" fill="white"/>
                              <path d="M14.5864 0.0392481L18.4269 0.0293727L18.4205 4.84421L20.9191 4.83205C20.891 5.82451 20.9177 6.92871 20.9206 7.92951L18.4231 7.94285C18.4237 11.2346 18.4139 14.5268 18.4195 17.8184C18.4227 19.7617 19.3736 19.5696 20.9182 19.5183C20.8874 20.5024 20.914 21.6253 20.9136 22.6206L20.8945 22.6965C20.6364 22.944 19.453 22.9534 19.06 22.9547C13.9463 22.9715 14.5904 19.2059 14.5915 15.766L14.5933 7.94285L12.4977 7.93963C12.5138 6.9063 12.5139 5.87279 12.4981 4.83946L14.5994 4.83767C14.5478 3.33024 14.5957 1.57211 14.5864 0.0392481Z" fill="white"/>
                              <path d="M68.5592 0.0372559L72.3952 0.0244774L72.387 4.84419L74.8817 4.83475C74.8403 5.82425 74.8692 6.93215 74.8767 7.93159L72.3883 7.93628L72.3845 14.7491C72.3839 15.898 72.3744 17.0393 72.4071 18.1879C72.4523 19.7966 73.6566 19.5547 74.8824 19.5177C74.8202 20.1451 74.8679 21.6868 74.8704 22.3815C74.8598 22.4898 74.8648 22.6739 74.7863 22.7237C74.3633 22.9737 73.7847 22.9387 73.3196 22.9578C71.3427 23.04 69.0099 22.3236 68.6741 20.1018C68.4714 18.7625 68.5611 17.153 68.5611 15.7761V7.94289C67.8852 7.91937 67.154 7.93511 66.4737 7.93746C66.5277 6.95536 66.4975 5.82937 66.4869 4.84321C67.1703 4.83123 67.8827 4.83851 68.568 4.83679C68.5184 3.33726 68.5617 1.5587 68.5592 0.0372559Z" fill="white"/>
                              <path d="M38.7973 0.0374424L42.593 0.0244774C42.6599 1.50851 42.6009 3.31843 42.6168 4.84092L45.0917 4.82963L45.1007 7.93869C44.2668 7.93412 43.433 7.93443 42.5991 7.93962C42.7101 11.0333 42.5313 14.2416 42.5993 17.3478C42.6496 19.6463 42.9701 19.5744 45.0891 19.5234L45.0892 22.4524C45.0812 22.5527 45.0943 22.6818 45.0301 22.7266C44.5979 22.9659 43.9657 22.9458 43.4802 22.9539C38.1621 23.0429 38.7934 19.4456 38.7953 15.7981L38.8032 7.93653L36.6822 7.93153C36.6972 6.89938 36.6982 5.86715 36.6856 4.83506L38.8069 4.84222C38.756 3.33615 38.7986 1.56376 38.7973 0.0374424Z" fill="white"/>
                              <path d="M47.5219 4.83675L51.3573 4.83712C51.3021 6.76297 51.3511 8.93439 51.3509 10.876L51.356 22.6078C50.1944 22.5765 48.6796 22.5818 47.5231 22.6153L47.5219 4.83675Z" fill="white"/>
                              <path d="M47.4945 0.0371523C48.7524 0.00190339 50.0968 0.0199284 51.3613 0.0152368C51.3325 1.13481 51.3538 2.30876 51.3585 3.43271C50.0803 3.4245 48.802 3.42771 47.5238 3.44234C47.5289 2.59754 47.5835 0.825962 47.4945 0.0371523Z" fill="white"/>
                            </svg>
                          </div>
                          <div className="step2-logo step2-logo-elena">
                            <img
                              src="/images/elena.png"
                              loading="lazy"
                              width={30}
                              height={30}
                              alt=""
                              className="step2-elena-avatar"
                            />
                          </div>
                          <div className="step2-logo step2-logo-alex">
                            <img
                              src="/images/alex-2.png"
                              loading="lazy"
                              width={40}
                              height={40}
                              alt=""
                              className="step2-alex-avatar"
                            />
                          </div>
                        </div>

                        {/* Portrait */}
                        <img
                          src="/images/hannah-transp.webp"
                          loading="lazy"
                          alt=""
                          className="step2-portrait"
                        />

                        {/* Task list card */}
                        <div className="step2-task-card">
                          <div className="step2-task-item">
                            <span className="step2-task-number">1.</span>
                            <span>{tt.step2Task1}</span>
                          </div>
                          <div className="step2-task-item">
                            <span className="step2-task-number">2.</span>
                            <span>{tt.step2Task2}</span>
                          </div>
                          <div className="step2-task-item">
                            <span className="step2-task-number">3.</span>
                            <span>{tt.step2Task3}</span>
                          </div>
                        </div>

                        {/* Gradient blobs */}
                        <div className="green-bg w-embed">
                          <svg
                            width="583"
                            height="552"
                            viewBox="0 0 583 552"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g filter="url(#filter0_f_5217_17987)">
                              <rect
                                x="161.693"
                                y="161.693"
                                width="259"
                                height="228"
                                rx="114"
                                fill="url(#paint0_linear_5217_17987)"
                              />
                            </g>
                            <defs>
                              <filter
                                id="filter0_f_5217_17987"
                                x="-4.57764e-05"
                                y="-4.57764e-05"
                                width="582.387"
                                height="551.387"
                                filterUnits="userSpaceOnUse"
                                colorInterpolationFilters="sRGB"
                              >
                                <feFlood
                                  floodOpacity="0"
                                  result="BackgroundImageFix"
                                />
                                <feBlend
                                  mode="normal"
                                  in="SourceGraphic"
                                  in2="BackgroundImageFix"
                                  result="shape"
                                />
                                <feGaussianBlur
                                  stdDeviation="80.8467"
                                  result="effect1_foregroundBlur_5217_17987"
                                />
                              </filter>
                              <linearGradient
                                id="paint0_linear_5217_17987"
                                x1="291.193"
                                y1="161.693"
                                x2="291.193"
                                y2="389.693"
                                gradientUnits="userSpaceOnUse"
                              >
                                <stop stopColor="#8FC49F" />
                                <stop offset="1" stopColor="#5C8F6C" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                        <div className="red-bg w-embed">
                          <svg
                            width="552"
                            height="552"
                            viewBox="0 0 552 552"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g filter="url(#filter0_f_5217_17986)">
                              <rect
                                x="161.693"
                                y="161.693"
                                width="228"
                                height="228"
                                rx="114"
                                fill="#FF9194"
                              />
                            </g>
                            <defs>
                              <filter
                                id="filter0_f_5217_17986"
                                x="-4.57764e-05"
                                y="-4.57764e-05"
                                width="551.387"
                                height="551.387"
                                filterUnits="userSpaceOnUse"
                                colorInterpolationFilters="sRGB"
                              >
                                <feFlood
                                  floodOpacity="0"
                                  result="BackgroundImageFix"
                                />
                                <feBlend
                                  mode="normal"
                                  in="SourceGraphic"
                                  in2="BackgroundImageFix"
                                  result="shape"
                                />
                                <feGaussianBlur
                                  stdDeviation="80.8467"
                                  result="effect1_foregroundBlur_5217_17986"
                                />
                              </filter>
                            </defs>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="steps-wrapper">
                      <div className="step-heading">
                        <div className="step">Step 2</div>
                        <div className="heading-style-h5">
                          {tt.step2Heading}{" "}
                        </div>
                      </div>
                      <div className="arrow w-embed">
                        <svg
                          width="33"
                          height="23"
                          viewBox="0 0 33 23"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M32.0283 10.6963L32.5869 11.2178L32.0303 11.7422L20.5615 22.5498L19.5791 21.5068L29.6396 12.0254H7.0957C6.76376 13.6615 5.318 14.8926 3.58398 14.8926C1.6046 14.8926 0 13.288 0 11.3086C0.00024998 9.32943 1.60476 7.72461 3.58398 7.72461C5.31769 7.72461 6.76342 8.95617 7.0957 10.5918H29.8125L19.5811 1.04883L20.5596 0L32.0283 10.6963ZM3.58398 9.1582C2.39651 9.1582 1.43384 10.1212 1.43359 11.3086C1.43359 12.4962 2.39636 13.459 3.58398 13.459C4.77161 13.459 5.73438 12.4962 5.73438 11.3086C5.73413 10.1212 4.77146 9.1582 3.58398 9.1582Z"
                            fill="#FF4B4F"
                          />
                        </svg>
                      </div>
                      <div className="explanation">
                        {tt.step2Description}
                        <br />
                      </div>
                    </div>
                    <div className="line-step"></div>
                  </div>

                  {/* Step 3 */}
                  <div className="step-contetn">
                    <div className="step-img-wrap">
                      <div className="step-3-wrapper">
                        <img
                          src="/images/step-3.webp"
                          loading="lazy"
                          width={253}
                          sizes="(max-width: 479px) 100vw, 253px"
                          alt=""
                        />
                      </div>
                    </div>
                    <div className="steps-wrapper">
                      <div className="step-heading">
                        <div className="step">Step 3</div>
                        <div className="heading-style-h5">
                          {tt.step3Heading}
                          <br />
                        </div>
                      </div>
                      <div className="explanation">
                        {tt.step3Description}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
