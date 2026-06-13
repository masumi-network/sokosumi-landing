/* Hero network visualization — two verified agents settling a payment
   on-chain, surrounded by the wider agent network. The SVG carries only
   geometry (scales freely); all text is HTML so it stays legible at every
   viewport. On mobile the SVG slice-crops its sides and the labels reflow
   below the graphic. */
export default function AgentNetworkGraph() {
  return (
    <div className="agent-netviz">
      <div className="nv-stage">
        <svg
          className="netviz"
          viewBox="0 60 1000 390"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          {/* network edges */}
          <line className="nv-edge" x1="300" y1="250" x2="160" y2="120" />
          <line className="nv-edge" x1="300" y1="250" x2="160" y2="390" />
          <line className="nv-edge" x1="300" y1="250" x2="500" y2="95" />
          <line className="nv-edge" x1="300" y1="250" x2="500" y2="420" />
          <line className="nv-edge" x1="700" y1="250" x2="840" y2="120" />
          <line className="nv-edge" x1="700" y1="250" x2="840" y2="390" />
          <line className="nv-edge" x1="700" y1="250" x2="500" y2="95" />
          <line className="nv-edge" x1="700" y1="250" x2="500" y2="420" />
          <line className="nv-edge" x1="500" y1="95" x2="160" y2="120" />
          <line className="nv-edge" x1="500" y1="95" x2="840" y2="120" />
          <line className="nv-edge" x1="500" y1="420" x2="160" y2="390" />
          <line className="nv-edge" x1="500" y1="420" x2="840" y2="390" />

          {/* satellite agents */}
          <circle className="nv-node amb" cx="160" cy="120" r="18" />
          <circle className="nv-node amb" cx="500" cy="95" r="24" />
          <circle className="nv-node amb" cx="840" cy="120" r="18" />
          <circle className="nv-node amb" cx="160" cy="390" r="16" />
          <circle className="nv-node amb" cx="500" cy="420" r="20" />
          <circle className="nv-node amb" cx="840" cy="390" r="16" />

          {/* payment flow */}
          <path className="nv-tx draw" d="M345 250 L650 250" />
          <polygon className="nv-arrow" points="648,242 648,258 666,250" />

          {/* the two transacting agents */}
          <clipPath id="nvAgentA">
            <circle cx="300" cy="250" r="40" />
          </clipPath>
          <clipPath id="nvAgentB">
            <circle cx="700" cy="250" r="40" />
          </clipPath>
          <image
            href="/images/network/serviceplan-icon.png"
            x="260"
            y="210"
            width="80"
            height="80"
            clipPath="url(#nvAgentA)"
          />
          <circle className="nv-ring" cx="300" cy="250" r="40" />
          <image
            href="/images/network/statista.png"
            x="660"
            y="210"
            width="80"
            height="80"
            clipPath="url(#nvAgentB)"
          />
          <circle className="nv-ring" cx="700" cy="250" r="40" />

          {/* verified badges */}
          <circle className="nv-badge" cx="330" cy="222" r="11" stroke="#fff" strokeWidth="2.5" />
          <path className="nv-check" d="M323 222 L328 227 L337 217" />
          <circle className="nv-badge" cx="730" cy="222" r="11" stroke="#fff" strokeWidth="2.5" />
          <path className="nv-check" d="M723 222 L728 227 L737 217" />
        </svg>

        {/* HTML overlays — fixed type sizes, legible at every viewport */}
        <div className="nv-pill">
          <img src="/images/network/usdc.png" alt="" width={17} height={17} />
          Pays 12 USDC
        </div>
        <div className="nv-tag">Verified identities · Settled on-chain</div>
        <div className="nv-agents">
          <div className="nv-agent nv-agent-a">
            <span className="nv-name">Marketing Agent</span>
            <span className="nv-org">SERVICEPLAN</span>
          </div>
          <div className="nv-agent nv-agent-b">
            <span className="nv-name">Data Agent</span>
            <span className="nv-org">STATISTA</span>
          </div>
        </div>
      </div>

      <div className="netcap">
        35,000+ transactions · open source ·{" "}
        <a href="/explorer">live on the Masumi Explorer</a>
      </div>
    </div>
  );
}
