import fs from "node:fs";

const path = "data/buildings.json";
const raw = JSON.parse(fs.readFileSync(path, "utf-8"));

const normTypo = s => s?.toString().replace(/[\/\s]/g,'').toUpperCase()
  .replace(/^STUDIO$/,'Studio');

const cleanComuna = s => s?.replace(/\b\d{3,}\b/g,'').replace(/-+/g,' ').replace(/\s+/g,' ').trim();

for (const b of raw) {
  b.comuna = cleanComuna(b.comuna);
  for (const u of (b.units || [])) {
    u.tipologia = normTypo(u.tipologia);
    if (typeof u.price === "string") u.price = Number(u.price.replace(/[\$\.\s,]/g,''));
    if (u.price <= 1) u.price = 250000; // evita bloqueo por publicables
  }
}

fs.writeFileSync(path, JSON.stringify(raw, null, 2));
console.log("Mocks saneados:", path);
