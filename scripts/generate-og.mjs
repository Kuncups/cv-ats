import zlib from "node:zlib";
import fs from "node:fs";

// Basic 5x7 bitmap font for ASCII 32..126
const FONT_5X7 = {
  ' ': [0, 0, 0, 0, 0],
  '!': [0, 0, 0x5f, 0, 0],
  '"': [0, 0x07, 0, 0x07, 0],
  '#': [0x14, 0x7f, 0x14, 0x7f, 0x14],
  '$': [0x24, 0x2a, 0x7f, 0x2a, 0x12],
  '%': [0x23, 0x13, 0x08, 0x64, 0x62],
  '&': [0x36, 0x49, 0x55, 0x22, 0x50],
  '\'': [0, 0x05, 0x03, 0, 0],
  '(': [0, 0x1c, 0x22, 0x41, 0],
  ')': [0, 0x41, 0x22, 0x1c, 0],
  '*': [0x14, 0x08, 0x3e, 0x08, 0x14],
  '+': [0x08, 0x08, 0x3e, 0x08, 0x08],
  ',': [0, 0x50, 0x30, 0, 0],
  '-': [0x08, 0x08, 0x08, 0x08, 0x08],
  '.': [0, 0x60, 0x60, 0, 0],
  '/': [0x20, 0x10, 0x08, 0x04, 0x02],
  '0': [0x3e, 0x51, 0x49, 0x45, 0x3e],
  '1': [0, 0x42, 0x7f, 0x40, 0],
  '2': [0x42, 0x61, 0x51, 0x49, 0x46],
  '3': [0x21, 0x41, 0x45, 0x4b, 0x31],
  '4': [0x18, 0x14, 0x12, 0x7f, 0x10],
  '5': [0x27, 0x45, 0x45, 0x45, 0x39],
  '6': [0x3c, 0x4a, 0x49, 0x49, 0x30],
  '7': [0x01, 0x71, 0x09, 0x05, 0x03],
  '8': [0x36, 0x49, 0x49, 0x49, 0x36],
  '9': [0x06, 0x49, 0x49, 0x29, 0x1e],
  ':': [0, 0x36, 0x36, 0, 0],
  ';': [0, 0x56, 0x36, 0, 0],
  '<': [0x08, 0x14, 0x22, 0x41, 0],
  '=': [0x14, 0x14, 0x14, 0x14, 0x14],
  '>': [0x41, 0x22, 0x14, 0x08, 0],
  '?': [0x02, 0x01, 0x51, 0x09, 0x06],
  '@': [0x32, 0x49, 0x79, 0x41, 0x3e],
  'A': [0x7e, 0x11, 0x11, 0x11, 0x7e],
  'B': [0x7f, 0x49, 0x49, 0x49, 0x36],
  'C': [0x3e, 0x41, 0x41, 0x41, 0x22],
  'D': [0x7f, 0x41, 0x41, 0x22, 0x1c],
  'E': [0x7f, 0x49, 0x49, 0x49, 0x41],
  'F': [0x7f, 0x09, 0x09, 0x09, 0x01],
  'G': [0x3e, 0x41, 0x49, 0x49, 0x7a],
  'H': [0x7f, 0x08, 0x08, 0x08, 0x7f],
  'I': [0, 0x41, 0x7f, 0x41, 0],
  'J': [0x20, 0x40, 0x41, 0x3f, 0x01],
  'K': [0x7f, 0x08, 0x14, 0x22, 0x41],
  'L': [0x7f, 0x40, 0x40, 0x40, 0x40],
  'M': [0x7f, 0x02, 0x0c, 0x02, 0x7f],
  'N': [0x7f, 0x04, 0x08, 0x10, 0x7f],
  'O': [0x3e, 0x41, 0x41, 0x41, 0x3e],
  'P': [0x7f, 0x09, 0x09, 0x09, 0x06],
  'Q': [0x3e, 0x41, 0x51, 0x21, 0x5e],
  'R': [0x7f, 0x09, 0x19, 0x29, 0x46],
  'S': [0x46, 0x49, 0x49, 0x49, 0x31],
  'T': [0x01, 0x01, 0x7f, 0x01, 0x01],
  'U': [0x3f, 0x40, 0x40, 0x40, 0x3f],
  'V': [0x1f, 0x20, 0x40, 0x20, 0x1f],
  'W': [0x7f, 0x20, 0x18, 0x20, 0x7f],
  'X': [0x63, 0x14, 0x08, 0x14, 0x63],
  'Y': [0x07, 0x08, 0x70, 0x08, 0x07],
  'Z': [0x61, 0x51, 0x49, 0x45, 0x43],
  '[': [0, 0x7f, 0x41, 0x41, 0],
  '\\': [0x02, 0x04, 0x08, 0x10, 0x20],
  ']': [0, 0x41, 0x41, 0x7f, 0],
  '^': [0x04, 0x02, 0x01, 0x02, 0x04],
  '_': [0x40, 0x40, 0x40, 0x40, 0x40],
  '|': [0, 0, 0x7f, 0, 0],
};

// Canvas helper
class Canvas {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.buffer = Buffer.alloc(w * h * 4);
    // Fill default off-white #F8F9FA
    for (let i = 0; i < w * h; i++) {
      this.buffer[i * 4] = 248;
      this.buffer[i * 4 + 1] = 249;
      this.buffer[i * 4 + 2] = 250;
      this.buffer[i * 4 + 3] = 255;
    }
  }

  setPixel(x, y, r, g, b, a = 255) {
    if (x < 0 || x >= this.w || y < 0 || y >= this.h) return;
    const idx = (y * this.w + x) * 4;
    this.buffer[idx] = r;
    this.buffer[idx + 1] = g;
    this.buffer[idx + 2] = b;
    this.buffer[idx + 3] = a;
  }

  fillRect(x, y, w, h, [r, g, b, a = 255]) {
    for (let py = Math.max(0, y); py < Math.min(this.h, y + h); py++) {
      for (let px = Math.max(0, x); px < Math.min(this.w, x + w); px++) {
        this.setPixel(px, py, r, g, b, a);
      }
    }
  }

  strokeRect(x, y, w, h, thickness, color) {
    this.fillRect(x, y, w, thickness, color);
    this.fillRect(x, y + h - thickness, w, thickness, color);
    this.fillRect(x, y, thickness, h, color);
    this.fillRect(x + w - thickness, y, thickness, h, color);
  }

  drawText(text, startX, startY, scale, color) {
    let curX = startX;
    const upper = text.toUpperCase();
    for (let i = 0; i < upper.length; i++) {
      const ch = upper[i];
      if (ch === '\n') {
        startY += (7 + 3) * scale;
        curX = startX;
        continue;
      }
      const bitmap = FONT_5X7[ch] || FONT_5X7['?'];
      for (let col = 0; col < 5; col++) {
        const colBits = bitmap[col] || 0;
        for (let row = 0; row < 7; row++) {
          if ((colBits & (1 << row)) !== 0) {
            this.fillRect(curX + col * scale, startY + row * scale, scale, scale, color);
          }
        }
      }
      curX += (5 + 1.5) * scale;
    }
  }

  toPng() {
    const rowSize = this.w * 4 + 1;
    const rawData = Buffer.alloc(rowSize * this.h);

    for (let y = 0; y < this.h; y++) {
      const rawOffset = y * rowSize;
      rawData[rawOffset] = 0; // Filter: None
      const bufOffset = y * this.w * 4;
      this.buffer.copy(rawData, rawOffset + 1, bufOffset, bufOffset + this.w * 4);
    }

    const deflated = zlib.deflateSync(rawData, { level: 9 });

    // CRC Table
    const crcTable = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      crcTable[n] = c;
    }
    const crc32 = (buf) => {
      let c = 0xffffffff;
      for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
      return (c ^ 0xffffffff) >>> 0;
    };

    const makeChunk = (type, data) => {
      const len = Buffer.alloc(4);
      len.writeUInt32BE(data.length, 0);
      const typeBuf = Buffer.from(type, "ascii");
      const crcBuf = Buffer.alloc(4);
      crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
      return Buffer.concat([len, typeBuf, data, crcBuf]);
    };

    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    const ihdrData = Buffer.alloc(13);
    ihdrData.writeUInt32BE(this.w, 0);
    ihdrData.writeUInt32BE(this.h, 4);
    ihdrData[8] = 8;
    ihdrData[9] = 6;
    ihdrData[10] = 0;
    ihdrData[11] = 0;
    ihdrData[12] = 0;

    return Buffer.concat([
      signature,
      makeChunk("IHDR", ihdrData),
      makeChunk("IDAT", deflated),
      makeChunk("IEND", Buffer.alloc(0)),
    ]);
  }
}

const W = 1200;
const H = 630;
const cv = new Canvas(W, H);

const BLACK = [0, 0, 0, 255];
const WHITE = [255, 255, 255, 255];
const BLUE = [29, 78, 216, 255];
const YELLOW = [253, 224, 71, 255];
const GREEN = [34, 197, 94, 255];
const GRID = [228, 228, 231, 255];

// Subtle 40px grid
for (let y = 0; y < H; y += 40) {
  cv.fillRect(0, y, W, 1, GRID);
}
for (let x = 0; x < W; x += 40) {
  cv.fillRect(x, 0, 1, H, GRID);
}

// Solid 16px border
cv.fillRect(0, 0, W, 16, BLACK);
cv.fillRect(0, H - 16, W, 16, BLACK);
cv.fillRect(0, 0, 16, H, BLACK);
cv.fillRect(W - 16, 0, 16, H, BLACK);

// Top Navbar banner
cv.fillRect(16, 16, W - 32, 64, BLACK);
cv.drawText("DRAFT CV // ATS RESUME PLATFORM", 48, 38, 3, WHITE);
cv.fillRect(920, 28, 230, 40, BLUE);
cv.strokeRect(920, 28, 230, 40, 2, WHITE);
cv.drawText("100% GRATIS", 965, 40, 2.5, WHITE);

// Yellow Brutalist Pill
cv.fillRect(68, 128, 340, 44, BLACK); // shadow
cv.fillRect(60, 120, 340, 44, YELLOW);
cv.strokeRect(60, 120, 340, 44, 3, BLACK);
cv.drawText("* STANDAR ATS RESMI HRD", 82, 134, 2.8, BLACK);

// Big Title: DRAFT CV
cv.drawText("DRAFT CV", 60, 190, 12, BLACK);

// Subtitle: Platform Pembuat & Penguji CV ATS
cv.drawText("CEK SKOR, KATA KUNCI & BUAT CV ATS RESMI", 60, 290, 4, BLUE);
cv.drawText("OPTIMAL LOLOS TAHAP SCREENING REKRUTER", 60, 330, 3.2, [80, 80, 80, 255]);

// 3 Feature Badges
const badges = [
  "✓ FORMAT 1-KOLOM BERSIH",
  "✓ ANALISIS KATA KUNCI REAL-TIME",
  "✓ PDF STANDAR VEKTOR ATS",
];
badges.forEach((b, idx) => {
  const by = 385 + idx * 42;
  cv.fillRect(64, by + 4, 390, 34, BLACK);
  cv.fillRect(60, by, 390, 34, WHITE);
  cv.strokeRect(60, by, 390, 34, 2, BLACK);
  cv.drawText(b, 75, by + 9, 2.2, BLACK);
});

// Primary CTA Button
cv.fillRect(68, 528, 420, 56, BLACK);
cv.fillRect(60, 520, 420, 56, BLUE);
cv.strokeRect(60, 520, 420, 56, 3, BLACK);
cv.drawText("DRAFTCV.MY.ID -> BUAT SEKARANG", 85, 538, 3.2, WHITE);

// Right side: Mockup A4 Resume Card preview
const rx = 760;
const ry = 120;
const rw = 380;
const rh = 460;

// Card shadow
cv.fillRect(rx + 12, ry + 12, rw, rh, BLACK);
// Card body
cv.fillRect(rx, ry, rw, rh, WHITE);
cv.strokeRect(rx, ry, rw, rh, 4, BLACK);

// Card Header
cv.fillRect(rx, ry, rw, 50, BLACK);
cv.drawText("PRATINJAU DOKUMEN ATS", rx + 24, ry + 18, 2.5, WHITE);

// Mock resume contents
cv.drawText("NAMA LENGKAP KANDIDAT", rx + 28, ry + 75, 3, BLACK);
cv.drawText("SENIOR SOFTWARE ENGINEER", rx + 28, ry + 105, 2.2, BLUE);
cv.drawText("email@domain.com | +62 812-xxxx | LinkedIn", rx + 28, ry + 128, 1.8, [100, 100, 100, 255]);

// Divider line
cv.fillRect(rx + 28, ry + 148, rw - 56, 2, BLACK);
cv.drawText("PENGALAMAN KERJA", rx + 28, ry + 160, 2.4, BLACK);
cv.fillRect(rx + 28, ry + 180, rw - 56, 1.5, BLACK);

// Bullets
cv.drawText("PT TEKNOLOGI BANGSA (2021 - SEKARANG)", rx + 28, ry + 192, 1.8, BLACK);
cv.drawText("- Memimpin migrasi arsitektur frontend web", rx + 32, ry + 212, 1.6, [60, 60, 60, 255]);
cv.drawText("- Meningkatkan skor performa sebesar 42%", rx + 32, ry + 228, 1.6, [60, 60, 60, 255]);
cv.drawText("- Mengoptimasi sistem CI/CD dan tes otomatis", rx + 32, ry + 244, 1.6, [60, 60, 60, 255]);

// ATS Score Scorebox
cv.fillRect(rx + 28, ry + 290, rw - 56, 135, [240, 253, 244, 255]);
cv.strokeRect(rx + 28, ry + 290, rw - 56, 135, 3, BLACK);
cv.fillRect(rx + 36, ry + 298, 140, 28, GREEN);
cv.drawText("SKOR ATS: 95%", rx + 44, ry + 304, 2.2, WHITE);
cv.drawText("STATUS: SANGAT SIAP SCREENING", rx + 36, ry + 338, 2, BLACK);
cv.drawText("• KATA KUNCI COCOK: 14/15", rx + 36, ry + 362, 1.8, [22, 101, 52, 255]);
cv.drawText("• FORMAT 1-KOLOM: VALID", rx + 36, ry + 382, 1.8, [22, 101, 52, 255]);
cv.drawText("• STANDAR VEKTOR A4: LOLOS", rx + 36, ry + 402, 1.8, [22, 101, 52, 255]);

const outBuf = cv.toPng();
fs.writeFileSync("public/og-image.png", outBuf);
console.log("Successfully rendered public/og-image.png:", outBuf.length, "bytes");
