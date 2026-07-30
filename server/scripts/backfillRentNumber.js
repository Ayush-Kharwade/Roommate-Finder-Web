import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(
  readFileSync(new URL('./serviceAccountKey.json', import.meta.url))
);
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function backfill() {
  const snap = await db.collection('properties').get();
  let updated = 0, skipped = 0;

  for (const d of snap.docs) {
    const rent = d.data().rent;
    if (typeof rent === 'number') { skipped++; continue; }
    const asNumber = Number(rent);
    if (Number.isNaN(asNumber)) {
      console.warn(`  ⚠ ${d.id} has unparseable rent: ${rent}`);
      skipped++;
      continue;
    }
    await d.ref.update({ rent: asNumber });
    updated++;
    console.log(`  ✓ ${d.id}: "${rent}" → ${asNumber}`);
  }
  console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}.`);
}

backfill().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });