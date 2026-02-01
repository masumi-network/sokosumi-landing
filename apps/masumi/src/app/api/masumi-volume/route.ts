import { bfFetch, ADDRESS } from "@/lib/blockfrost";
import { promises as fs } from "fs";
import path from "path";

const USDM_PREFIX =
  "c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402";
const CACHE_PATH = path.join(process.cwd(), "data", "volume-cache.json");
const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

interface VolumeCache {
  totalVolumeUsdm: number;
  processedTxHashes: string[];
  lastUpdated: number;
  processedCount: number;
}

async function readCache(): Promise<VolumeCache> {
  try {
    const raw = await fs.readFile(CACHE_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {
      totalVolumeUsdm: 0,
      processedTxHashes: [],
      lastUpdated: 0,
      processedCount: 0,
    };
  }
}

async function writeCache(cache: VolumeCache) {
  await fs.mkdir(path.dirname(CACHE_PATH), { recursive: true });
  await fs.writeFile(CACHE_PATH, JSON.stringify(cache));
}

async function getAllTxHashes(): Promise<string[]> {
  const allHashes: string[] = [];
  for (let page = 1; page <= 300; page++) {
    const txs = await bfFetch(
      `/addresses/${ADDRESS}/transactions?count=100&page=${page}&order=asc`,
      60
    );
    if (!txs || !Array.isArray(txs) || txs.length === 0) break;
    allHashes.push(...txs.map((t: { tx_hash: string }) => t.tx_hash));
    if (txs.length < 100) break;
  }
  return allHashes;
}

async function processUsdmVolume(hash: string): Promise<number> {
  let volume = 0;
  const utxos = await bfFetch(`/txs/${hash}/utxos`, 86400);
  if (utxos) {
    for (const out of utxos.outputs || []) {
      if (out.address === ADDRESS) {
        for (const a of out.amount) {
          if (a.unit.startsWith(USDM_PREFIX)) {
            volume += parseInt(a.quantity, 10);
          }
        }
      }
    }
  }
  return volume;
}

export async function GET() {
  try {
    const cache = await readCache();

    // If cache was updated less than 5 minutes ago, return cached value
    if (cache.lastUpdated > 0 && Date.now() - cache.lastUpdated < REFRESH_INTERVAL_MS) {
      return Response.json({
        totalVolumeUsdm: cache.totalVolumeUsdm / 1_000_000,
        processedCount: cache.processedCount,
        complete: true,
        cached: true,
      });
    }

    // Fetch all tx hashes
    const allHashes = await getAllTxHashes();
    const processedSet = new Set(cache.processedTxHashes);

    // Find unprocessed txs
    const newHashes = allHashes.filter((h) => !processedSet.has(h));

    if (newHashes.length === 0) {
      // Nothing new — update timestamp so we don't re-check for 5 min
      cache.lastUpdated = Date.now();
      await writeCache(cache);
      return Response.json({
        totalVolumeUsdm: cache.totalVolumeUsdm / 1_000_000,
        processedCount: cache.processedCount,
        complete: true,
      });
    }

    // Process ALL unprocessed txs
    let addedUsdm = 0;
    let processed = 0;

    for (const hash of newHashes) {
      addedUsdm += await processUsdmVolume(hash);
      processedSet.add(hash);
      processed++;

      // Save progress every 100 txs so we don't lose work on crash
      if (processed % 100 === 0) {
        const interim: VolumeCache = {
          totalVolumeUsdm: cache.totalVolumeUsdm + addedUsdm,
          processedTxHashes: Array.from(processedSet),
          lastUpdated: 0, // not done yet
          processedCount: processedSet.size,
        };
        await writeCache(interim);
      }
    }

    const updatedCache: VolumeCache = {
      totalVolumeUsdm: cache.totalVolumeUsdm + addedUsdm,
      processedTxHashes: Array.from(processedSet),
      lastUpdated: Date.now(),
      processedCount: processedSet.size,
    };
    await writeCache(updatedCache);

    return Response.json({
      totalVolumeUsdm: updatedCache.totalVolumeUsdm / 1_000_000,
      processedCount: updatedCache.processedCount,
      newlyProcessed: newHashes.length,
      complete: true,
    });
  } catch (err) {
    console.error("masumi-volume error:", err);
    return Response.json(
      { error: "Failed to calculate volume" },
      { status: 500 }
    );
  }
}
