import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const fixtureUrl = new URL('../supabase/fixtures/google_doc_vendor_catalog.json', import.meta.url);
const migrationUrl = new URL(
  '../supabase/migrations/20260907144534_import_google_doc_vendor_catalog.sql',
  import.meta.url,
);

const fixture = JSON.parse(await readFile(fixtureUrl, 'utf8'));
const migration = await readFile(migrationUrl, 'utf8');
const rows = fixture.rows;

assert.equal(rows.length, fixture.expected.serviceCount);
assert.equal(new Set(rows.map(row => row.serviceId)).size, rows.length);
assert.equal(new Set(rows.map(row => row.vendorId)).size, fixture.expected.vendorCount);

const vendorSlugs = new Map();
for (const row of rows) {
  const priorId = vendorSlugs.get(row.vendorSlug);
  assert.ok(!priorId || priorId === row.vendorId, `Slug collision: ${row.vendorSlug}`);
  vendorSlugs.set(row.vendorSlug, row.vendorId);
  assert.match(row.vendorSlug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.ok(row.serviceName.trim());
  assert.ok(row.vendorName.trim());
  assert.ok(row.priceDisplay.trim());
  assert.ok(row.basePrice === null || row.basePrice >= 0);
  assert.ok(row.maxPrice === null || row.maxPrice >= 0);
  assert.ok(row.maxPrice === null || (row.basePrice !== null && row.maxPrice >= row.basePrice));
  assert.ok(migration.includes(row.serviceId), `Migration is missing ${row.serviceId}`);
}

const actualPerTab = Object.fromEntries(
  Object.keys(fixture.expected.perTab).map(tab => [
    tab,
    rows.filter(row => row.sourceTab === tab).length,
  ]),
);
assert.deepEqual(actualPerTab, fixture.expected.perTab);
assert.equal(rows.filter(row => row.imageUrl === null).length, fixture.expected.missingServiceImageCount);

const categories = new Set(rows.map(row => row.serviceCategory));
assert.deepEqual(
  categories,
  new Set([
    'Studio',
    'Váy Cưới',
    'Vest',
    'Thiệp Cưới',
    'Venue',
    'Make Up',
    'Trang Sức',
    'Planner',
    'Trang Trí',
    'Sức Khỏe',
    'Khác',
  ]),
);

function assertPrice(display, basePrice, maxPrice, priceUnit = null) {
  const row = rows.find(candidate => candidate.priceDisplay === display);
  assert.ok(row, `Missing price example: ${display}`);
  assert.equal(row.basePrice, basePrice, display);
  assert.equal(row.maxPrice, maxPrice, display);
  assert.equal(row.priceUnit, priceUnit, display);
}

assertPrice('5.990.000đ', 5_990_000, null);
assertPrice('≈ 1.000.000đ', 1_000_000, null);
assertPrice('18–25 triệu', 18_000_000, 25_000_000);
assertPrice('Từ 100 triệu', 100_000_000, null);
assertPrice('5.950.000–7.150.000đ/bàn', 5_950_000, 7_150_000, 'bàn');
assertPrice('≈ 7.000đ/thiệp', 7_000, null, 'thiệp');
assertPrice('Theo gói tiệc', null, null);
assertPrice('Bao gồm trong gói 4.700.000đ/bàn', null, null, 'bàn');
assertPrice('Miễn phí trong gói 4.700.000đ/bàn', null, null, 'bàn');

console.log(
  `Vendor catalog valid: ${fixture.expected.vendorCount} vendors, ` +
    `${fixture.expected.serviceCount} services across ${Object.keys(actualPerTab).length} tabs.`,
);
