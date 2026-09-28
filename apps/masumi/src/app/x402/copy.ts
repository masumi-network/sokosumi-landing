import type { Locale } from "@/lib/i18n";

// Bilingual copy for /x402 and /de/x402 — the Cardano page. Protocol and
// product identifiers stay English in both locales (x402, escrow, facilitator,
// exact scheme, asset transfer method, Masumi Smart Contract, Cardanoscan) as
// do the HTTP artifacts the demo prints. VM* keys are the vending-machine
// demo. Some VM strings are deliberate sentence fragments joined to a code
// chip in the JSX; they are translated as fragments.
type Entry = { en: string; de: string };

const COPY = {
  TITLE: { en: "x402 on Cardano: the masumi asset transfer method — Masumi", de: "x402 auf Cardano: die asset transfer method masumi — Masumi" },
  DESCRIPTION: { en: "The Cardano exact scheme defines three asset transfer methods: default, masumi and script. The masumi method adds refund mechanics and decentralised decision logging. Try a live mainnet payment against our vending machine.", de: "Das exact scheme auf Cardano definiert drei Varianten der asset transfer method: default, masumi und script. Die Methode masumi ergänzt Erstattungsmechanik und dezentrales Decision Logging. Führen Sie an unserem Verkaufsautomaten eine echte Zahlung im Cardano mainnet aus." },
  TWITTER_DESC: { en: "Try x402 on Cardano with a real vending machine and a real mainnet payment.", de: "Testen Sie x402 auf Cardano mit einem echten Verkaufsautomaten und einer echten Zahlung im Cardano mainnet." },
  CMP1_LABEL: { en: "Normal Address Payments", de: "Normale Zahlungen an Adressen" },
  CMP1_NOTE: { en: "A direct payment to a wallet address — the baseline every chain supports.", de: "Eine direkte Zahlung an eine Wallet-Adresse — die von jeder Blockchain unterstützte Grundfunktion." },
  CMP2_LABEL: { en: "Refunds", de: "Erstattungen" },
  CMP2_NOTE: { en: "Nothing delivered? The escrowed payment goes back to the client — automatically.", de: "Nichts geliefert? Die im Escrow hinterlegte Zahlung geht automatisch an den Client zurück." },
  CMP3_LABEL: { en: "Decision Logging", de: "Decision Logging" },
  CMP3_NOTE: { en: "Payment decisions are recorded on-chain, decentralised and auditable.", de: "Zahlungsentscheidungen werden dezentral, on-chain und prüfbar aufgezeichnet." },
  INT1_LABEL: { en: "Discovery", de: "Discovery" },
  INT1_NOTE: { en: "A public registry of every agent — search by what they do, check their track record, and call them through the API.", de: "Ein öffentliches Verzeichnis mit einem Eintrag pro Agent — suchen Sie nach der angebotenen Funktion, prüfen Sie den bisherigen Verlauf und starten Sie den Aufruf über die API." },
  INT2_LABEL: { en: "Identity", de: "Identity" },
  INT2_NOTE: { en: "Every agent gets a decentralized ID and a reputation score, so you can verify who you are working with.", de: "Jeder Agent erhält eine dezentrale ID und einen Reputationswert. So können Sie prüfen, mit wem Sie arbeiten." },
  TXT1: { en: "Payments, built into the internet itself.", de: "Zahlungen als Bestandteil des Internets." },
  TXT2: { en: "The internet was never built to move money — that&apos;s its original sin. x402 fixes it: an open, neutral standard that makes payments possible directly between clients and servers, no middleman required. It creates win-win economies and lets agents pay agents at scale. The goal is a freer, fairer internet.", de: "Das Internet war nie für Geldtransfers ausgelegt — das ist sein grundlegender Konstruktionsfehler. x402 behebt diesen Mangel: Als offener, neutraler Standard ermöglicht es Zahlungen direkt zwischen Clients und Servern, ohne Vermittler. Dadurch entstehen Wirtschaftsbeziehungen, von denen beide Seiten profitieren, und Agent-zu-Agent-Zahlungen lassen sich in großem Umfang abwickeln. Ziel ist ein freieres, gerechteres Internet." },
  TXT3: { en: "Learn about the x402 Foundation", de: "Mehr über die x402 Foundation erfahren" },
  TXT4: { en: "The x402 Foundation is part of the Linux Foundation.", de: "Die x402 Foundation ist Teil der Linux Foundation." },
  TXT5: { en: "Masumi Smart Contract", de: "Masumi Smart Contract" },
  TXT6: { en: "The Masumi Smart Contract is the escrow at the core of Masumi, the payment network for AI agents: funds are locked in the contract, released when the work is delivered, and refunded when it isn&apos;t — with every decision logged on-chain. Plugged into x402, every HTTP payment gets that protection built in.", de: "Der Masumi Smart Contract ist der Escrow im Kern von Masumi, dem Zahlungsnetzwerk für AI Agents: Die Mittel werden darin gesperrt, nach erbrachter Leistung freigegeben und bei ausbleibender Leistung erstattet. Jede Entscheidung wird on-chain protokolliert. Durch die Einbindung in x402 ist jede HTTP-Zahlung auf diese Weise abgesichert." },
  TXT7: { en: "EVM · Solana", de: "EVM · Solana" },
  TXT8: { en: "Cardano", de: "Cardano" },
  TXT9: { en: "Cardano +", de: "Cardano +" },
  TXT10: { en: "Read the exact scheme specs", de: "Spezifikationen für das exact scheme lesen" },
  VM1: { en: "Agent Payments", de: "Agent Payments" },
  VM2: { en: "Try x402 on Cardano with our virtual vending machine.", de: "Testen Sie x402 auf Cardano mit unserem virtuellen Verkaufsautomaten." },
  VM3: { en: "Run it yourself", de: "Selbst ausführen" },
  VM4: { en: "Every step below is a real request. Run them one at a time and watch the machine react.", de: "Jeder der folgenden Schritte ist ein echter Request. Führen Sie die Schritte einzeln aus und beobachten Sie, wie der Automat reagiert." },
  VM5: { en: "Signature request", de: "Signaturanfrage" },
  VM6: { en: "This is a", de: "Diese Zahlung erfolgt wirklich im" },
  VM7: { en: "real Cardano mainnet", de: "Cardano mainnet" },
  VM8: { en: "payment. Your wallet will build and sign the transaction — then the facilitator submits it on-chain.", de: ". Ihre Wallet erstellt und signiert die transaction — anschließend übermittelt der facilitator sie on-chain." },
  VM9: { en: "Cancel", de: "Abbrechen" },
  VM10: { en: "Sign &amp; pay", de: "Signieren &amp; bezahlen" },
  VM11: { en: "start", de: "Beginn" },
  VM12: { en: "Paid", de: "Paid" },
  VM13: { en: "on Cardano mainnet — connect a wallet to build and sign the transaction. (Real funds.)", de: "im Cardano mainnet — verbinden Sie eine Wallet, um die transaction zu erstellen und zu signieren. (Echte Geldmittel.)" },
  VM14: { en: "No Cardano wallet detected — install one (Eternl, Lace, Begin, Vespr…) and reload.", de: "Keine Cardano-Wallet erkannt — installieren Sie eine (Eternl, Lace, Begin, Vespr…) und laden Sie die Seite neu." },
  VM15: { en: "The facilitator decodes your signed transaction and confirms it really pays the right amount to the right address — before anything is broadcast.", de: "Der facilitator dekodiert Ihre signierte transaction und bestätigt, dass sie tatsächlich den richtigen Betrag an die richtige Adresse zahlt — bevor sie übertragen wird." },
  VM16: { en: "waiting for the facilitator", de: "Warten auf den facilitator" },
  VM17: { en: "The client retries the request with the signed payment attached. The facilitator re-verifies, then broadcasts the transaction to Cardano mainnet via Blockfrost.", de: "Der Client wiederholt den Request mit der angehängten signierten Zahlung. Der facilitator prüft sie erneut und überträgt die transaction anschließend über Blockfrost an das Cardano mainnet." },
  VM18: { en: "Cardanoscan ↗", de: "Cardanoscan ↗" },
  VM19: { en: "broadcasting to the network", de: "Übertragung an das network" },
  VM20: { en: "Paid and confirmed on-chain — the machine returns your snack with a", de: "Paid und on-chain bestätigt — der Automat gibt Ihren Snack mit Statuscode" },
  VM21: { en: "Paid and accepted by the network — the machine returns your snack with a", de: "Paid und vom network akzeptiert — der Automat gibt Ihren Snack mit Statuscode" },
  VM22: { en: "status", de: "status" },
  VM23: { en: "success", de: "success" },
  VM24: { en: "network", de: "network" },
  VM25: { en: "transaction", de: "transaction" },
  VM26: { en: "your snack drops into the tray", de: "Ihr Snack fällt in das Ausgabefach" },
  VM27: { en: "current", de: "aktuell" },
  EYEBROW_WHATIS: { en: "what is x402?", de: "was ist x402?" },
  EYEBROW_VS: { en: "cardano vs. other chains", de: "cardano im vergleich" },
  H2_VS: { en: "x402 on Cardano is more powerful than x402 on any other chain.", de: "x402 auf Cardano kann mehr als x402 auf jeder anderen Blockchain." },
  EYEBROW_NATIVE: { en: "native support", de: "native unterst\u00fctzung" },
  NATIVE_LINE: { en: "x402 on Cardano natively supports the", de: "x402 auf Cardano unterst\u00fctzt nativ den" },
  COL_OTHERS: { en: "\u00b7 others", de: "\u00b7 weitere" },
  COL_REGULAR: { en: "Regular", de: "Regular" },
  EYEBROW_INTEROP: { en: "interoperable other Masumi features", de: "weitere Masumi-Funktionen, interoperabel" },
  MASUMI_SC_BODY: { en: "The Masumi Smart Contract is the escrow at the core of Masumi, the payment network for AI agents: funds are locked in the contract, released when the work is delivered, and refunded when it isn\u2019t \u2014 with every decision logged on-chain. Plugged into x402, every HTTP payment gets that protection built in.", de: "Der Masumi Smart Contract ist der Escrow im Kern von Masumi, dem Zahlungsnetzwerk f\u00fcr AI Agents: Die Mittel werden im Contract gesperrt, nach erbrachter Leistung freigegeben und bei ausbleibender Leistung erstattet. Jede Entscheidung wird on-chain protokolliert. Durch die Einbindung in x402 ist jede HTTP-Zahlung auf diese Weise abgesichert." },
  SPEC_LINK: { en: "Read the exact scheme specs", de: "Spezifikation des exact scheme lesen" },
  VM_RUNBTN: { en: "Run request", de: "Request ausf\u00fchren" },
  VM_TRANSITION: { en: "choose how to pay", de: "zahlungsart ausw\u00e4hlen" },
  VM_STEP1_BODY: { en: "Ask the machine for a snack with no payment attached. Run it \u2014 the machine refuses with", de: "Fordern Sie beim Automaten einen Snack an, ohne eine Zahlung anzuh\u00e4ngen. Senden Sie den Request \u2014 der Automat lehnt ihn ab und antwortet mit" },
} satisfies Record<string, Entry>;

export type X402CopyKey = keyof typeof COPY;

export function t(locale: Locale) {
  return (key: X402CopyKey | string): string => {
    const entry = (COPY as Record<string, Entry | undefined>)[key];
    if (!entry) throw new Error(`x402 copy: no such key "${key}"`);
    return entry[locale] || entry.en;
  };
}
