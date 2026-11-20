import fs from "fs";
import path from "path";
import { getSupabase } from "./supabase";
import Razorpay from "razorpay";

const PREFIX = "AQUA-C/INV-";
// Baseline starts at 3 because AQUA-C/INV-1, 2, 3 have already been issued in Razorpay
const BASELINE_MAX = 3;

interface OrderSequenceState {
  lastIssuedNumber: number;
  lastIssuedId: string;
  updatedAt: string;
}

const SEQUENCE_FILE = path.join(process.cwd(), "data", "order_sequence.json");

/**
 * Reads the latest sequence state from local data/order_sequence.json if present
 */
function readLocalSequenceState(): OrderSequenceState | null {
  try {
    if (fs.existsSync(SEQUENCE_FILE)) {
      const raw = fs.readFileSync(SEQUENCE_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.lastIssuedNumber === "number") {
        return parsed as OrderSequenceState;
      }
    }
  } catch (err) {
    console.warn("[orderSequence] Could not read order_sequence.json:", err);
  }
  return null;
}

/**
 * Persists sequence state to local data/order_sequence.json
 */
function persistLocalSequenceState(state: OrderSequenceState): void {
  try {
    const dataDir = path.dirname(SEQUENCE_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const tempFile = `${SEQUENCE_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(state, null, 2), "utf-8");
    fs.renameSync(tempFile, SEQUENCE_FILE);
  } catch (err) {
    console.error("[orderSequence] Failed to persist order_sequence.json:", err);
  }
}

/**
 * Scans Razorpay invoices, Supabase promec_orders, and local orders.json to discover the highest
 * existing sequential commercial number matching AQUA-C/INV-<N>.
 */
export async function getHighestGigWorkerOrderNumber(): Promise<number> {
  const discoveredNumbers: number[] = [BASELINE_MAX];

  // 1. Check local order_sequence.json cache
  const localState = readLocalSequenceState();
  if (localState && localState.lastIssuedNumber > 0) {
    discoveredNumbers.push(localState.lastIssuedNumber);
  }

  // 2. Query live Razorpay invoices directly as authoritative source
  try {
    const key_id = (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "").trim();
    const key_secret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
    if (key_id && key_secret) {
      const razorpay = new Razorpay({ key_id, key_secret });
      const invoices = await razorpay.invoices.all({ count: 50 });
      if (Array.isArray(invoices?.items)) {
        for (const inv of invoices.items) {
          const num = inv.invoice_number || inv.receipt || "";
          const match = num.match(/^AQUA-C\/INV-(\d+)$/i);
          if (match) {
            const val = parseInt(match[1], 10);
            if (!isNaN(val)) discoveredNumbers.push(val);
          }
        }
      }
    }
  } catch (rzpErr) {
    console.warn("[orderSequence] Razorpay invoice query note:", rzpErr);
  }

  // 3. Query Supabase promec_orders
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("promec_orders")
        .select("id")
        .like("id", `${PREFIX}%`);

      if (!error && Array.isArray(data)) {
        for (const row of data) {
          if (typeof row?.id === "string") {
            const match = row.id.match(/^AQUA-C\/INV-(\d+)$/i);
            if (match) {
              const num = parseInt(match[1], 10);
              if (!isNaN(num)) discoveredNumbers.push(num);
            }
          }
        }
      }
    } catch (sbErr) {
      console.warn("[orderSequence] Supabase order query note:", sbErr);
    }
  }

  // 4. Scan local data/orders.json fallback
  try {
    const ordersFilePath = path.join(process.cwd(), "data", "orders.json");
    if (fs.existsSync(ordersFilePath)) {
      const raw = fs.readFileSync(ordersFilePath, "utf-8");
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        for (const ord of list) {
          if (typeof ord?.id === "string") {
            const match = ord.id.match(/^AQUA-C\/INV-(\d+)$/i);
            if (match) {
              const num = parseInt(match[1], 10);
              if (!isNaN(num)) discoveredNumbers.push(num);
            }
          }
        }
      }
    }
  } catch (fsErr) {
    console.warn("[orderSequence] Local data/orders.json scan note:", fsErr);
  }

  return Math.max(...discoveredNumbers);
}

// In-process concurrency mutex to serialize ID allocations
let sequenceMutex: Promise<any> = Promise.resolve();

/**
 * Computes and reserves the next sequential Commercial Order ID (e.g. AQUA-C/INV-4, AQUA-C/INV-5, etc.)
 * Strictly follows the series AQUA-C/INV-1, 2, 3, 4, 5...
 */
export async function getNextGigWorkerOrderId(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    sequenceMutex = sequenceMutex
      .then(async () => {
        try {
          const highestNum = await getHighestGigWorkerOrderNumber();
          const nextNum = highestNum + 1;
          const nextId = `${PREFIX}${nextNum}`;

          const newState: OrderSequenceState = {
            lastIssuedNumber: nextNum,
            lastIssuedId: nextId,
            updatedAt: new Date().toISOString(),
          };

          persistLocalSequenceState(newState);
          console.log(`[orderSequence] Allocated next commercial order ID: ${nextId}`);
          resolve(nextId);
        } catch (err) {
          console.error("[orderSequence] Error allocating next commercial order ID:", err);
          // Fallback timestamp if allocation fatally fails
          const fallbackId = `${PREFIX}${Date.now().toString().slice(-4)}`;
          resolve(fallbackId);
        }
      })
      .catch((err) => {
        console.error("[orderSequence] Mutex pipeline failure:", err);
        reject(err);
      });
  });
}
