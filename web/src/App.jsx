import { useState } from 'react';
import { patchKernal, C64_COLORS } from './patchKernal.js';
import DISK_ROM_B64 from './diskRom.js';
import './App.css';

const DEFAULT = {
  bootName:    'KEI-ROM',
  dosVersion:  ' 0.1  ',
  basicLabel:  'ULTIMATE',
  textColor:   1,
  borderColor: 11,
  bgColor:     0,
};

function ColorSelect({ label, value, onChange }) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className="color-select">
        <div className="color-swatch" style={{ background: C64_COLORS[value].hex }} />
        <select value={value} onChange={e => onChange(Number(e.target.value))}>
          {C64_COLORS.map(c => (
            <option key={c.id} value={c.id}>
              {c.id} – {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function BootPreview({ bootName, dosVersion, basicLabel, textColor, borderColor, bgColor }) {
  const fg     = C64_COLORS[textColor].hex;
  const bg     = C64_COLORS[bgColor].hex;
  const border = C64_COLORS[borderColor].hex;
  const name   = bootName.toUpperCase().padStart(10, ' ').slice(-10);
  const ver    = dosVersion.toUpperCase().padEnd(6, ' ').slice(0, 6);
  const basic  = basicLabel.toUpperCase().padEnd(8, ' ').slice(0, 8);

  return (
    <div className="preview-outer" style={{ background: border }}>
      <pre className="preview-screen" style={{ background: bg, color: fg }}>{`    **** COMMODORE 64 ${basic} ****\n\n ${name}${ver}38911 BASIC BYTES FREE\n\nREADY.\n`}<span className="cursor">█</span></pre>
    </div>
  );
}

export default function App() {
  const [cfg, setCfg] = useState(DEFAULT);
  const [downloaded, setDownloaded] = useState(false);
  const [downloadedDisk, setDownloadedDisk] = useState(false);

  function set(key) {
    return val => setCfg(prev => ({ ...prev, [key]: val }));
  }

  function handleText(key, maxLen) {
    return e => {
      const val = e.target.value.slice(0, maxLen).toUpperCase();
      setCfg(prev => ({ ...prev, [key]: val }));
    };
  }

  function buildFileName(type) {
    const name = cfg.bootName.trim().toLowerCase().split(/[\s\-]+/).map(w => w[0]).join('');
    const ver = cfg.dosVersion.trim().toLowerCase().replace(/\./g, '').replace(/\s+/g, '');
    return `${name}-${ver}-${type}.rom`;
  }

  function downloadDiskImage() {
    const binary = atob(DISK_ROM_B64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = buildFileName('1541');
    a.click();
    URL.revokeObjectURL(url);
    setDownloadedDisk(true);
    setTimeout(() => setDownloadedDisk(false), 2000);
  }


  function downloadKernal() {
    const rom = patchKernal(cfg);
    const blob = new Blob([rom], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = buildFileName('kernal');
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>C64 DolphinDOS - ROM Patcher</h1>
        <p>Customize and download a modified rom based on <a href="https://github.com/donnchawp/DolphinDOS2">DolphinDOS 2</a></p>
      </header>

      <div className="layout">
        <section className="panel">
          <h2>Boot Text</h2>

          <div className="field">
            <label>Boot Name <span className="hint">max 10 chars</span></label>
            <input
              type="text"
              maxLength={10}
              value={cfg.bootName}
              onChange={handleText('bootName', 10)}
            />
          </div>

          <div className="field">
            <label>Version String <span className="hint">max 6 chars</span></label>
            <input
              type="text"
              maxLength={6}
              value={cfg.dosVersion}
              onChange={handleText('dosVersion', 6)}
            />
          </div>

          <div className="field">
            <label>BASIC Label <span className="hint">max 8 chars — replaces &quot;BASIC V2&quot;</span></label>
            <input
              type="text"
              maxLength={8}
              value={cfg.basicLabel}
              onChange={handleText('basicLabel', 8)}
            />
          </div>

          <h2>Colors</h2>
          <ColorSelect label="Text Color"       value={cfg.textColor}   onChange={set('textColor')} />
          <ColorSelect label="Border Color"     value={cfg.borderColor} onChange={set('borderColor')} />
          <ColorSelect label="Background Color" value={cfg.bgColor}     onChange={set('bgColor')} />

          <button className="btn-secondary" onClick={() => setCfg(DEFAULT)}>
            Reset to Original
          </button>
        </section>

        <section className="panel">
          <h2>Preview</h2>
          <BootPreview {...cfg} />

          <div className="actions">
            <button className="btn-primary" onClick={downloadKernal}>
              {downloaded ? '✓ Downloaded!' : '⬇ Download Kernal'}
            </button>
            <button className="btn-primary" onClick={downloadDiskImage}>
              {downloadedDisk ? '✓ Downloaded!' : '⬇ Download Disk Image'}
            </button>
          </div>

          <div className="install-instructions">
            <h2>Installation Instructions</h2>
            <ol>
              <li>Download both ROM files above and copy them to your C64 Ultimate storage using the <strong>DISK FILE BROWSER</strong>.</li>
              <li>Select the {buildFileName('kernal')} and "Set as Kernal ROM"</li>
              <li>Select the {buildFileName('1541')} and "Set as 1541 ROM"</li>
              <li>Open the <strong>C64 Ultimate</strong> main menu and go to <strong>MEMORY & ROMS</strong>.</li>
              <li>Confirm that the <strong>Kernal ROM</strong> is set to <code>{buildFileName('kernal')}</code> and the <strong>Drive A - ROM for 1541 mode</strong> is set to <code>{buildFileName('1541')}</code>.</li>
              <li>Go back to the main menu and open <strong>BUILT-IN DRIVE A</strong>.</li>
              <li>Enable the <strong>Extra RAM</strong>.</li>
              <li>Go back to the main menu and open the Secret Menu with <strong>Shift + F1</strong> and open <strong>Machine Tweaks</strong>.</li>
              <li>Enable the <strong>Parallel Cable to Drive A</strong>.</li>
              <li>Go back two times to the main menu and press F1.</li>
              <li>Save the Configurations</li>
              <li>Reboot your C64 Ultimate.</li>
            </ol>
          </div>
        </section>
      </div>
      <footer className="app-footer">
        <p>Created by <a href="https://github.com/catrielmuller" target="_blank" rel="noreferrer">catrielmuller</a></p>
        <a href="https://buymeacoffee.com/catrielmuller" target="_blank" rel="noreferrer" className="bmc-btn">
          ☕ Buy me a coffee
        </a>
      </footer>
    </div>
  );
}
