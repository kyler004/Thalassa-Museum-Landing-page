import * as THREE from 'three';

/**
 * Detect software WebGL (SwiftShader, llvmpipe, WARP) from the GPU renderer string.
 * Used strictly for rendering cost adjustments (pixel ratio, antialiasing, shadow map cost)
 * without altering scene objects, geometry detail, or UI layout.
 */
export const isSoftwareGl: boolean = (() => {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return false;
  }
})();

let cachedMarbleTex: THREE.CanvasTexture | null = null;
let cachedTravertineTex: THREE.CanvasTexture | null = null;
let cachedGeometricTex: THREE.CanvasTexture | null = null;
let cachedAstrolabeTex: THREE.CanvasTexture | null = null;
let cachedShadowTex: THREE.CanvasTexture | null = null;

export function getMarbleTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  if (cachedMarbleTex) return cachedMarbleTex;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#F7F5F0';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle crystalline marble veins
  ctx.strokeStyle = 'rgba(140, 136, 128, 0.14)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 18; i++) {
    ctx.beginPath();
    let x = (i * 37) % 512;
    let y = 0;
    ctx.moveTo(x, y);
    while (y < 512) {
      y += 24;
      x += Math.sin(y * 0.03 + i) * 14;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Fine mineral grain
  for (let i = 0; i < 1200; i++) {
    const gx = (i * 73) % 512;
    const gy = (i * 139) % 512;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.35)' : 'rgba(120,116,110,0.06)';
    ctx.fillRect(gx, gy, 2, 2);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = maxAnisotropy;
  cachedMarbleTex = tex;
  return tex;
}

export function getTravertineTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  if (cachedTravertineTex) return cachedTravertineTex;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#EFECE6';
  ctx.fillRect(0, 0, 512, 512);

  // Horizontal sedimentary limestone strata and pores
  for (let y = 0; y < 512; y += 4) {
    const tone = 232 + Math.floor(Math.sin(y * 0.08) * 8);
    ctx.fillStyle = `rgb(${tone}, ${tone - 2}, ${tone - 6})`;
    ctx.fillRect(0, y, 512, 3);
  }

  ctx.fillStyle = 'rgba(90, 86, 80, 0.12)';
  for (let i = 0; i < 450; i++) {
    const px = (i * 97) % 512;
    const py = (i * 53) % 512;
    const w = 4 + (i % 14);
    ctx.fillRect(px, py, w, 1.5);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = maxAnisotropy;
  cachedTravertineTex = tex;
  return tex;
}

export function getGeometricAmphoraTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  if (cachedGeometricTex) return cachedGeometricTex;
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Base warm pale ceramic slip
  ctx.fillStyle = '#EAE5DC';
  ctx.fillRect(0, 0, 1024, 1024);

  // Dark obsidian iron-glaze upper and lower registers
  ctx.fillStyle = '#141413';
  ctx.fillRect(0, 0, 1024, 190);
  ctx.fillRect(0, 780, 1024, 244);

  // Horizontal tectonic bands
  const bands = [210, 224, 340, 355, 510, 525, 660, 675, 755];
  bands.forEach((y) => {
    ctx.fillRect(0, y, 1024, 8);
  });

  // Greek Key / Meander frieze between y=245 and y=325
  ctx.strokeStyle = '#141413';
  ctx.lineWidth = 6;
  const step = 64;
  for (let x = 0; x < 1024; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 320);
    ctx.lineTo(x, 250);
    ctx.lineTo(x + 48, 250);
    ctx.lineTo(x + 48, 296);
    ctx.lineTo(x + 20, 296);
    ctx.lineTo(x + 20, 272);
    ctx.lineTo(x + 34, 272);
    ctx.stroke();
  }

  // Central Geometric lozenge & chevron frieze (y=380 to y=490)
  for (let x = 0; x < 1024; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x + 32, 385);
    ctx.lineTo(x + 60, 435);
    ctx.lineTo(x + 32, 485);
    ctx.lineTo(x + 4, 435);
    ctx.closePath();
    ctx.stroke();

    // Inner dot
    ctx.beginPath();
    ctx.arc(x + 32, 435, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Lower vertical triglyph / metope rhythm (y=545 to y=645)
  for (let x = 0; x < 1024; x += 32) {
    if ((x / 32) % 2 === 0) {
      ctx.fillRect(x + 4, 545, 6, 100);
      ctx.fillRect(x + 14, 545, 6, 100);
      ctx.fillRect(x + 24, 545, 6, 100);
    }
  }

  // Basal rays (y=690 to y=755)
  for (let x = 0; x < 1024; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 755);
    ctx.lineTo(x + 24, 690);
    ctx.lineTo(x + 48, 755);
    ctx.closePath();
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = maxAnisotropy;
  cachedGeometricTex = tex;
  return tex;
}

export function getAstrolabeDialTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  if (cachedAstrolabeTex) return cachedAstrolabeTex;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#181816';
  ctx.fillRect(0, 0, 512, 512);

  const cx = 256;
  const cy = 256;
  ctx.strokeStyle = '#D6D3CB';
  ctx.lineWidth = 2;

  [240, 210, 165, 115, 65].forEach((r) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Degree graduations
  for (let deg = 0; deg < 360; deg += 5) {
    const rad = (deg * Math.PI) / 180;
    const inner = deg % 30 === 0 ? 165 : deg % 15 === 0 ? 195 : 222;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(rad) * inner, cy + Math.sin(rad) * inner);
    ctx.lineTo(cx + Math.cos(rad) * 240, cy + Math.sin(rad) * 240);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  cachedAstrolabeTex = tex;
  return tex;
}

export function getContactShadowTexture(): THREE.CanvasTexture {
  if (cachedShadowTex) return cachedShadowTex;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 120);
  grad.addColorStop(0, 'rgba(15, 15, 15, 0.42)');
  grad.addColorStop(0.55, 'rgba(15, 15, 15, 0.16)');
  grad.addColorStop(1, 'rgba(15, 15, 15, 0.0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  cachedShadowTex = tex;
  return tex;
}
