/* Hero network visualization — mirrors the Masumi pitch deck "network agents
   transact on" graphic: two verified agents settling a payment on-chain,
   surrounded by the wider agent network. */
export default function AgentNetworkGraph() {
  return (
    <div className="agent-netviz">
      <svg
        className="netviz"
        viewBox="0 0 1000 460"
        role="img"
        aria-label="A network of agents transacting and verifying payments on-chain"
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

        {/* amount pill */}
        <rect className="nv-pill-bg" x="423" y="185" width="154" height="32" rx="16" />
        <image href="/images/network/usdc.png" x="445" y="192" width="18" height="18" />
        <text className="nv-pill-t" x="471" y="205" textAnchor="start">
          Pays 12 USDC
        </text>

        {/* verified badges */}
        <circle className="nv-badge" cx="330" cy="222" r="11" stroke="#fff" strokeWidth="2.5" />
        <path className="nv-check" d="M323 222 L328 227 L337 217" />
        <circle className="nv-badge" cx="730" cy="222" r="11" stroke="#fff" strokeWidth="2.5" />
        <path className="nv-check" d="M723 222 L728 227 L737 217" />

        {/* labels */}
        <text className="nv-sub" x="500" y="296" textAnchor="middle">
          VERIFIED IDENTITIES · SETTLED ON-CHAIN
        </text>
        <text className="nv-lbl" x="300" y="322" textAnchor="middle">
          Marketing Agent
        </text>
        <text className="nv-sub" x="300" y="341" textAnchor="middle">
          SERVICEPLAN
        </text>
        <text className="nv-lbl" x="700" y="322" textAnchor="middle">
          Data Agent
        </text>
        <text className="nv-sub" x="700" y="341" textAnchor="middle">
          STATISTA
        </text>
      </svg>

      <div className="netcap">
        35,000+ transactions · open source · live on the Masumi Explorer
      </div>

      <div className="x402-badge">
        <span className="vch">
          <svg viewBox="0 0 24 24">
            <path d="M5 12.5l4.5 4.5L19 7" />
          </svg>
        </span>
        <span>
          Officially merged &amp; recognized as the <strong>x402 Standard</strong> by the
          x402 Foundation, founded by{" "}
          <img src="/images/network/coinbase.svg" alt="Coinbase" />
          <img src="/images/network/cloudflare.svg" alt="Cloudflare" />
        </span>
      </div>
    </div>
  );
}
