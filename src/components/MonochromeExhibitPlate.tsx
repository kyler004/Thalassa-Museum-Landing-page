import React, { useEffect, useRef, useState } from 'react';
import { ExhibitData } from '../data/exhibits';

interface MonochromeExhibitPlateProps {
  exhibit: ExhibitData;
  className?: string;
}

/**
 * Renders either the generated high-contrast monochrome photograph (with zero-broken-image fallback)
 * or a high-DPI procedural fine-art monochrome silver-gelatin plate for each exhibit.
 */
export const MonochromeExhibitPlate: React.FC<MonochromeExhibitPlateProps> = ({
  exhibit,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgError, setImgError] = useState(false);

  const showGeneratedPhoto = Boolean(exhibit.imageUrl) && !imgError;

  useEffect(() => {
    if (showGeneratedPhoto) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 800;
    const h = 600;
    canvas.width = w;
    canvas.height = h;

    // Background gallery wall with dramatic Mediterranean window light gradient
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#1B1B19');
    bgGrad.addColorStop(0.55, '#121211');
    bgGrad.addColorStop(1, '#0A0A09');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Diagonal shaft of Mediterranean sunlight on background limestone wall
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(w * 0.18, 0);
    ctx.lineTo(w * 0.68, 0);
    ctx.lineTo(w * 0.92, h);
    ctx.lineTo(w * 0.42, h);
    ctx.closePath();
    const beamGrad = ctx.createLinearGradient(w * 0.2, 0, w * 0.8, h);
    beamGrad.addColorStop(0, 'rgba(250, 249, 245, 0.16)');
    beamGrad.addColorStop(0.6, 'rgba(250, 249, 245, 0.06)');
    beamGrad.addColorStop(1, 'rgba(250, 249, 245, 0.01)');
    ctx.fillStyle = beamGrad;
    ctx.fill();
    ctx.restore();

    // Travertine Plinth at bottom center
    const plinthX = w * 0.28;
    const plinthY = h * 0.73;
    const plinthW = w * 0.44;
    const plinthH = h * 0.27;

    const plinthGrad = ctx.createLinearGradient(plinthX, plinthY, plinthX + plinthW, plinthY);
    plinthGrad.addColorStop(0, '#EAE7E0');
    plinthGrad.addColorStop(0.62, '#D8D4CC');
    plinthGrad.addColorStop(0.63, '#2B2B28');
    plinthGrad.addColorStop(1, '#1A1A18');
    ctx.fillStyle = plinthGrad;
    ctx.fillRect(plinthX, plinthY, plinthW, plinthH);

    // Draw exhibit-specific monochrome sculptural study
    ctx.save();
    if (exhibit.plateType === 'cycladic') {
      // Cycladic Sculpted Marble Head & Neck on Plinth
      // Neck
      const neckGrad = ctx.createLinearGradient(w * 0.44, 0, w * 0.56, 0);
      neckGrad.addColorStop(0, '#F5F3EE');
      neckGrad.addColorStop(0.6, '#DBD7CE');
      neckGrad.addColorStop(1, '#4A4945');
      ctx.fillStyle = neckGrad;
      ctx.fillRect(w * 0.45, h * 0.55, w * 0.1, h * 0.18);

      // Lyre-shaped head
      ctx.beginPath();
      ctx.ellipse(w * 0.5, h * 0.37, w * 0.115, h * 0.21, -0.06, 0, Math.PI * 2);
      const headGrad = ctx.createRadialGradient(
        w * 0.46,
        h * 0.31,
        10,
        w * 0.52,
        h * 0.38,
        w * 0.15
      );
      headGrad.addColorStop(0, '#FFFFFF');
      headGrad.addColorStop(0.55, '#EAE6DF');
      headGrad.addColorStop(0.85, '#8E8B83');
      headGrad.addColorStop(1, '#2E2D2A');
      ctx.fillStyle = headGrad;
      ctx.fill();

      // Long vertical nasal prism & shadow
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(w * 0.492, h * 0.27, 11, h * 0.16);
      ctx.fillStyle = 'rgba(20, 20, 19, 0.55)';
      ctx.beginPath();
      ctx.moveTo(w * 0.506, h * 0.27);
      ctx.lineTo(w * 0.54, h * 0.42);
      ctx.lineTo(w * 0.506, h * 0.43);
      ctx.closePath();
      ctx.fill();
    } else if (exhibit.plateType === 'amphora') {
      // Monumental Dipylon Geometric Amphora
      ctx.translate(w * 0.5, h * 0.73);
      // Vessel silhouette
      ctx.beginPath();
      ctx.moveTo(-55, 0);
      ctx.lineTo(-42, -24);
      ctx.bezierCurveTo(-135, -90, -145, -220, -75, -275);
      ctx.lineTo(-44, -295);
      ctx.lineTo(-44, -385);
      ctx.lineTo(-64, -405);
      ctx.lineTo(64, -405);
      ctx.lineTo(44, -385);
      ctx.lineTo(44, -295);
      ctx.lineTo(75, -275);
      ctx.bezierCurveTo(145, -220, 135, -90, 42, -24);
      ctx.lineTo(55, 0);
      ctx.closePath();

      const ampGrad = ctx.createLinearGradient(-120, -200, 120, -200);
      ampGrad.addColorStop(0, '#F0EDE6');
      ampGrad.addColorStop(0.55, '#CCC8BE');
      ampGrad.addColorStop(1, '#282725');
      ctx.fillStyle = ampGrad;
      ctx.fill();

      // Handles
      ctx.strokeStyle = '#D8D4CC';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(-78, -245);
      ctx.bezierCurveTo(-138, -265, -125, -355, -45, -350);
      ctx.stroke();

      ctx.strokeStyle = '#3A3936';
      ctx.beginPath();
      ctx.moveTo(78, -245);
      ctx.bezierCurveTo(138, -265, 125, -355, 45, -350);
      ctx.stroke();

      // Horizontal black-glaze geometric bands
      ctx.fillStyle = '#141413';
      [-340, -315, -240, -210, -145, -120, -70].forEach((by) => {
        ctx.fillRect(-92, by, 184, 9);
      });
    } else if (exhibit.plateType === 'astrolabe') {
      // Celestial Astrolabe of Rhodes
      const cx = w * 0.5;
      const cy = h * 0.42;
      ctx.strokeStyle = '#F5F3EE';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.arc(cx, cy, 135, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#A8A49C';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 118, 52, 0.42, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(cx, cy, 52, 118, -0.35, 0, Math.PI * 2);
      ctx.stroke();

      // Sighting Alidade rule
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cx - 115, cy - 65);
      ctx.lineTo(cx + 115, cy + 65);
      ctx.stroke();

      // Pedestal stem
      ctx.fillStyle = '#D8D4CC';
      ctx.fillRect(cx - 10, cy + 135, 20, h * 0.73 - (cy + 135));
    } else {
      // Monolith of the Aegean Horizon
      const cx = w * 0.5;
      const base = h * 0.73;

      // White Carrara Arch
      ctx.fillStyle = '#FAF8F4';
      ctx.beginPath();
      ctx.arc(cx - 24, base - 190, 96, Math.PI, 0, false);
      ctx.lineTo(cx + 72, base);
      ctx.lineTo(cx + 24, base);
      ctx.lineTo(cx + 24, base - 190);
      ctx.arc(cx - 24, base - 190, 48, 0, Math.PI, true);
      ctx.lineTo(cx - 72, base);
      ctx.lineTo(cx - 120, base);
      ctx.closePath();
      ctx.fill();

      // Interlocking Basalt Void Ring
      ctx.strokeStyle = '#141413';
      ctx.lineWidth = 26;
      ctx.beginPath();
      ctx.arc(cx + 38, base - 175, 76, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#EAE6DF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx + 38, base - 175, 89, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // Fine film grain overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let i = 0; i < 900; i++) {
      const gx = (i * 193) % w;
      const gy = (i * 317) % h;
      ctx.fillRect(gx, gy, 1.5, 1.5);
    }
  }, [exhibit, showGeneratedPhoto]);

  return (
    <div className={`relative overflow-hidden bg-[#141413] ${className}`}>
      {showGeneratedPhoto ? (
        <img
          src={exhibit.imageUrl}
          alt={`${exhibit.title} — ${exhibit.subtitle}`}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover grayscale contrast-125 transition-transform duration-700 group-hover:scale-[1.03]"
        />
      ) : (
        <canvas
          ref={canvasRef}
          aria-label={`${exhibit.title} archival monochrome plate`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
      )}

      {/* Subtle archival plate index overlay */}
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono tracking-widest text-[#FAF9F6]/80 pointer-events-none">
        <span>PLATE {exhibit.index}</span>
        <span>{exhibit.accessionNumber}</span>
      </div>
    </div>
  );
};
