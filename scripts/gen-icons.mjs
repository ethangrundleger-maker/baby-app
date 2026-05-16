#!/usr/bin/env node
/**
 * Generate solid-background PWA icons (192 and 512) with a centered "J" glyph.
 * Pure Node, no native deps. Uses zlib for the PNG IDAT.
 *
 * Output: public/icons/icon-192.png, public/icons/icon-512.png, apple-touch-icon-180.png
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "icons");
mkdirSync(outDir, { recursive: true });

// --- Tiny 5x7 pixel font for "J" only (we just need a single glyph) ---
// Each row is 5 bits (left-to-right). 1 = ink.
const GLYPH_J = [
  0b00111,
  0b00001,
  0b00001,
  0b00001,
  0b00001,
  0b10001,
  0b01110,
];

function makeIcon(size, bg, fg) {
  // Glyph: scale to ~55% of icon size, centered.
  const glyphH = 7, glyphW = 5;
  const scale = Math.floor((size * 0.55) / glyphH);
  const pxW = glyphW * scale;
  const pxH = glyphH * scale;
  const offX = Math.floor((size - pxW) / 2);
  const offY = Math.floor((size - pxH) / 2);

  // RGBA buffer
  const stride = size * 4;
  const buf = Buffer.alloc(size * stride);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = y * stride + x * 4;
      // Rounded corner mask for an iOS-feel maskable look
      const r = Math.floor(size * 0.16);
      const inCorner =
        (x < r && y < r && (r - x) * (r - x) + (r - y) * (r - y) > r * r) ||
        (x >= size - r && y < r && (x - (size - r)) * (x - (size - r)) + (r - y) * (r - y) > r * r) ||
        (x < r && y >= size - r && (r - x) * (r - x) + (y - (size - r)) * (y - (size - r)) > r * r) ||
        (x >= size - r && y >= size - r && (x - (size - r)) * (x - (size - r)) + (y - (size - r)) * (y - (size - r)) > r * r);
      if (inCorner) { buf[i] = 0; buf[i+1] = 0; buf[i+2] = 0; buf[i+3] = 0; continue; }
      buf[i] = bg[0]; buf[i+1] = bg[1]; buf[i+2] = bg[2]; buf[i+3] = 255;
    }
  }

  // Stamp the J in fg
  for (let gy = 0; gy < glyphH; gy++) {
    const row = GLYPH_J[gy];
    for (let gx = 0; gx < glyphW; gx++) {
      const bit = (row >> (glyphW - 1 - gx)) & 1;
      if (!bit) continue;
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
          const x = offX + gx * scale + dx;
          const y = offY + gy * scale + dy;
          if (x < 0 || y < 0 || x >= size || y >= size) continue;
          const i = y * stride + x * 4;
          buf[i] = fg[0]; buf[i+1] = fg[1]; buf[i+2] = fg[2]; buf[i+3] = 255;
        }
      }
    }
  }

  return encodePng(size, size, buf);
}

// Minimal PNG encoder for 8-bit RGBA images.
function encodePng(width, height, pixels) {
  const sig = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;      // bit depth
  ihdr[9] = 6;      // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  // Add filter byte 0 per scanline
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idatData = deflateSync(raw);

  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idatData), chunk("IEND", Buffer.alloc(0))]);
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])) >>> 0, 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

// CRC32 (PNG spec)
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// Brand palette
const BG = [0x7a, 0xa2, 0xff]; // accent
const FG = [0x0b, 0x10, 0x20]; // ink-on-accent

writeFileSync(join(outDir, "icon-192.png"), makeIcon(192, BG, FG));
writeFileSync(join(outDir, "icon-512.png"), makeIcon(512, BG, FG));
writeFileSync(join(outDir, "apple-touch-icon-180.png"), makeIcon(180, BG, FG));
console.log("Wrote icon-192.png, icon-512.png, apple-touch-icon-180.png");
