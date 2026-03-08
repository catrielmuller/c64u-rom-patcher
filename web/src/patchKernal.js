import KERNAL_ROM_B64 from './kernalRom.js';

const C64_COLORS = [
  { id: 0,  name: 'Black',       hex: '#000000' },
  { id: 1,  name: 'White',       hex: '#FFFFFF' },
  { id: 2,  name: 'Red',         hex: '#9F4E44' },
  { id: 3,  name: 'Cyan',        hex: '#6ABFC6' },
  { id: 4,  name: 'Violet',      hex: '#A057A3' },
  { id: 5,  name: 'Green',       hex: '#5CAB5E' },
  { id: 6,  name: 'Blue',        hex: '#50459B' },
  { id: 7,  name: 'Yellow',      hex: '#C9D487' },
  { id: 8,  name: 'Orange',      hex: '#A1683C' },
  { id: 9,  name: 'Brown',       hex: '#6D5412' },
  { id: 10, name: 'Pink',        hex: '#CB7E75' },
  { id: 11, name: 'Dark Grey',   hex: '#626262' },
  { id: 12, name: 'Mid Grey',    hex: '#898989' },
  { id: 13, name: 'Light Green', hex: '#9AE29B' },
  { id: 14, name: 'Light Blue',  hex: '#887ECB' },
  { id: 15, name: 'Light Grey',  hex: '#C9C9C9' },
];

const OFFSETS = {
  BASIC_V2:   0x48B,
  DOLPHINDOS: 0x49B,
  TEXT_COLOR:  0x535,
  BORDER_COLOR: 0xCD9,
  BG_COLOR:    0xCDA,
};

const ORIGINAL = {
  BASIC_V2:    'BASIC V2',
  DOLPHINDOS:  'DOLPHINDOS',
  DOS_VERSION: ' 2.0  ',
};

function b64ToBytes(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function writeAscii(rom, offset, str, length, padStart = false) {
  const padded = padStart ? str.padStart(length, ' ') : str.padEnd(length, ' ');
  for (let i = 0; i < length; i++) {
    rom[offset + i] = padded.charCodeAt(i);
  }
}

export function patchKernal({ bootName, dosVersion, basicLabel, textColor, borderColor, bgColor }) {
  const rom = b64ToBytes(KERNAL_ROM_B64);

  writeAscii(rom, OFFSETS.BASIC_V2,   basicLabel,  8);
  writeAscii(rom, OFFSETS.DOLPHINDOS, bootName,   10, true);
  writeAscii(rom, OFFSETS.DOLPHINDOS + 10, dosVersion, 6);

  rom[OFFSETS.TEXT_COLOR]   = textColor;
  rom[OFFSETS.BORDER_COLOR] = borderColor;
  rom[OFFSETS.BG_COLOR]     = bgColor;

  return rom;
}

export { C64_COLORS, ORIGINAL };
