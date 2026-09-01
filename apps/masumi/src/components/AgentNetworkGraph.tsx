/* Hero network visualization — two verified agents settling a payment
   on-chain, surrounded by the wider agent network. The SVG carries only
   geometry (scales freely); all text is HTML so it stays legible at every
   viewport. Ambient edges are curved, dotted whisper-lines radiating from
   the two agents (no crossings); the solid pink line is reserved for the
   payment itself. Payment dots flow via SMIL (hidden under
   prefers-reduced-motion). On mobile the SVG slice-crops its sides and
   the labels reflow below the graphic. */

import { type Locale } from "@/lib/i18n";
import { st as siteCopy } from "@/lib/site-copy";

const EDGES = [
  // Marketing Agent spokes
  "M300 250 Q390 150 510 92",
  "M300 250 Q220 170 150 118",
  "M300 250 Q225 330 175 392",
  "M300 250 Q380 350 495 424",
  // Data Agent spokes
  "M700 250 Q620 150 510 92",
  "M700 250 Q780 170 845 115",
  "M700 250 Q770 330 830 395",
  "M700 250 Q620 350 495 424",
  // far-node chains
  "M150 118 Q80 150 42 210",
  "M175 392 Q90 310 42 210",
  "M845 115 Q925 200 958 318",
  "M830 395 Q910 372 958 318",
];

const SATELLITES = [
  { cx: 510, cy: 92, r: 22 },
  { cx: 150, cy: 118, r: 17 },
  { cx: 42, cy: 210, r: 12 },
  { cx: 175, cy: 392, r: 15 },
  { cx: 495, cy: 424, r: 19 },
  { cx: 845, cy: 115, r: 17 },
  { cx: 830, cy: 395, r: 15 },
  { cx: 958, cy: 318, r: 12 },
];

const FLOWS = [
  { path: "M150 118 Q220 170 300 250", dur: "3.2s", begin: "0s", r: 3.5 },
  { path: "M175 392 Q225 330 300 250", dur: "3.6s", begin: "1.7s", r: 3.5 },
  { path: "M345 250 L646 250", dur: "2.4s", begin: "0.9s", r: 4.5 },
  { path: "M700 250 Q780 170 845 115", dur: "3.4s", begin: "2.3s", r: 3.5 },
  { path: "M700 250 Q770 330 830 395", dur: "3s", begin: "3.1s", r: 3.5 },
];

export default function AgentNetworkGraph({ locale = "en" }: { locale?: Locale }) {
  const st = siteCopy(locale);
  return (
    <div className="agent-netviz">
      <div className="nv-stage">
        <svg
          className="netviz"
          viewBox="0 60 1000 390"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          {EDGES.map((d, i) => (
            <path key={i} className="nv-edge" d={d} />
          ))}

          {SATELLITES.map((s, i) => (
            <circle key={i} className="nv-node amb" cx={s.cx} cy={s.cy} r={s.r} />
          ))}

          {/* payment flow */}
          <path className="nv-tx draw" d="M345 250 L646 250" />
          <path className="nv-arrowhead" d="M640 241 L657 250 L640 259" />

          {/* flowing payment dots */}
          {FLOWS.map((f, i) => (
            <circle key={i} className="nv-flow" r={f.r}>
              <animateMotion dur={f.dur} begin={f.begin} repeatCount="indefinite" path={f.path} />
              <animate
                attributeName="opacity"
                values="0;0.9;0.9;0"
                keyTimes="0;0.2;0.8;1"
                dur={f.dur}
                begin={f.begin}
                repeatCount="indefinite"
              />
            </circle>
          ))}

          {/* the two transacting agents */}
          <clipPath id="nvAgentA">
            <circle cx="300" cy="250" r="40" />
          </clipPath>
          <clipPath id="nvAgentB">
            <circle cx="700" cy="250" r="40" />
          </clipPath>
          <g className="nv-anode">
            <image
              href="/images/network/serviceplan-icon.png"
              x="260"
              y="210"
              width="80"
              height="80"
              clipPath="url(#nvAgentA)"
            />
            <circle className="nv-ring" cx="300" cy="250" r="40" />
            <circle className="nv-badge" cx="330" cy="222" r="11" stroke="#fff" strokeWidth="2.5" />
            <path className="nv-check" d="M323 222 L328 227 L337 217" />
          </g>
          <g className="nv-anode">
            <image
              href="/images/network/statista.png"
              x="660"
              y="210"
              width="80"
              height="80"
              clipPath="url(#nvAgentB)"
            />
            <circle className="nv-ring" cx="700" cy="250" r="40" />
            <circle className="nv-badge" cx="730" cy="222" r="11" stroke="#fff" strokeWidth="2.5" />
            <path className="nv-check" d="M723 222 L728 227 L737 217" />
          </g>
        </svg>

        {/* HTML overlays — fixed type sizes, legible at every viewport */}
        <div className="nv-pill">
          <img src="/images/network/usdc.png" alt="" width={18} height={18} />
          {st("GRAPH1")}
        </div>
        <div className="nv-tag">{st("GRAPH2")}</div>
        <div className="nv-agents">
          <div className="nv-agent nv-agent-a">
            <span className="nv-name">{st("GRAPH3")}</span>
            <span className="nv-org">SERVICEPLAN</span>
          </div>
          <div className="nv-agent nv-agent-b">
            <span className="nv-name">{st("GRAPH4")}</span>
            <span className="nv-org">STATISTA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
