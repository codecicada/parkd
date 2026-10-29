// Writes parkd-<version>.zip from dist/, the archive the Chrome Web Store takes.
// Paths are sorted and every entry carries the same timestamp, so one commit gives one zip.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { crc32, deflateRawSync } from "node:zlib";

const root = resolve(import.meta.dirname, "..");
const dist = join(root, "dist");
const { version } = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as { version: string };
const out = join(root, `parkd-${version}.zip`);

// MS-DOS date for 1980-01-01, the earliest a zip can record; time 00:00.
const DOS_DATE = (1 << 5) | 1;
const DOS_TIME = 0;

function listFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

const names = listFiles(dist)
  .map((path) => relative(dist, path).split(sep).join("/"))
  .sort();

const refused = names.filter((name) => name.endsWith(".map") || name.split("/").some((part) => part.startsWith(".")));
if (refused.length > 0) {
  console.error(`dist/ holds files that must not ship: ${refused.join(", ")}`);
  process.exit(1);
}
if (!names.includes("manifest.json")) {
  console.error("dist/manifest.json is missing; run npm run build first.");
  process.exit(1);
}

const locals: Buffer[] = [];
const centrals: Buffer[] = [];
let offset = 0;

for (const name of names) {
  const data = readFileSync(join(dist, name));
  const packed = deflateRawSync(data, { level: 9 });
  // Store a file as is when deflate would make it bigger, as with PNGs.
  const [method, body] = packed.length < data.length ? [8, packed] : [0, data];
  const nameBytes = Buffer.from(name, "utf8");
  const crc = crc32(data);

  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4); // version needed
  local.writeUInt16LE(0x0800, 6); // UTF-8 names
  local.writeUInt16LE(method, 8);
  local.writeUInt16LE(DOS_TIME, 10);
  local.writeUInt16LE(DOS_DATE, 12);
  local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(body.length, 18);
  local.writeUInt32LE(data.length, 22);
  local.writeUInt16LE(nameBytes.length, 26);
  local.writeUInt16LE(0, 28); // extra field length

  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(20, 4); // version made by
  central.writeUInt16LE(20, 6); // version needed
  central.writeUInt16LE(0x0800, 8);
  central.writeUInt16LE(method, 10);
  central.writeUInt16LE(DOS_TIME, 12);
  central.writeUInt16LE(DOS_DATE, 14);
  central.writeUInt32LE(crc, 16);
  central.writeUInt32LE(body.length, 20);
  central.writeUInt32LE(data.length, 24);
  central.writeUInt16LE(nameBytes.length, 28);
  // Extra, comment, disk, attributes: all zero.
  central.writeUInt32LE(offset, 42);

  locals.push(local, nameBytes, body);
  centrals.push(central, nameBytes);
  offset += local.length + nameBytes.length + body.length;
}

const directory = Buffer.concat(centrals);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(names.length, 8);
end.writeUInt16LE(names.length, 10);
end.writeUInt32LE(directory.length, 12);
end.writeUInt32LE(offset, 16);

writeFileSync(out, Buffer.concat([...locals, directory, end]));
console.log(`${relative(root, out)}: ${names.length} files`);
