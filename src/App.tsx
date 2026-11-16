/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowDown,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Compass,
  Layers,
  RotateCcw,
  Sun,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { EXHIBITS, LIGHTING_PRESETS, ExhibitData } from './data/exhibits';
import { MuseumGalleryScene } from './three/MuseumGalleryScene';
import { MonochromeExhibitPlate } from './components/MonochromeExhibitPlate';
import { TicketReservationModal } from './components/TicketReservationModal';
import { museumAudio } from './utils/museumAudio';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  // 3D Virtual Tour State
  const [activeExhibitIndex, setActiveExhibitIndex] = useState<number>(0);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isFreeInspectMode, setIsFreeInspectMode] = useState<boolean>(false);
  const [inspectRotationY, setInspectRotationY] = useState<number>(0);
  const [inspectZoomOffset, setInspectZoomOffset] = useState<number>(0);
  const [explodedFactor, setExplodedFactor] = useState<number>(0);
  const [lightingPresetIndex, setLightingPresetIndex] = useState<number>(0);
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);

  // Interactive Modal & Selected Catalogue Exhibit State
  const [isReservationOpen, setIsReservationOpen] = useState<boolean>(false);
  const [reservationExhibitTitle, setReservationExhibitTitle] = useState<string | undefined>(
    undefined
  );
  const [expandedCatalogueId, setExpandedCatalogueId] = useState<string>(EXHIBITS[0].id);
  const [activeArchStudyIndex, setActiveArchStudyIndex] = useState<number>(0);

  // Refs for GSAP ScrollTrigger & Touch Gestures
  const tourSectionRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubRef = useRef<HTMLDivElement>(null);
  const pointerDragRef = useRef<{ isDown: boolean; startX: number; baseRot: number }>({
    isDown: false,
    startX: 0,
    baseRot: 0,
  });

  const activeExhibit: ExhibitData = EXHIBITS[activeExhibitIndex] || EXHIBITS[0];
  const activeLightingPreset = LIGHTING_PRESETS[lightingPresetIndex] || LIGHTING_PRESETS[0];

  // Keyboard shortcut 'H' to collapse/expand bottom 3D HUD dock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key.toLowerCase() === 'h') {
        setIsDockCollapsed((prev) => !prev);
      } else if (e.key === 'ArrowRight') {
        handleStepExhibit(Math.min(EXHIBITS.length - 1, activeExhibitIndex + 1));
      } else if (e.key === 'ArrowLeft') {
        handleStepExhibit(Math.max(0, activeExhibitIndex - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Hero entrance animation & GSAP ScrollTrigger for the 3D Virtual Tour
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      if (heroTitleRef.current && heroSubRef.current) {
        gsap.fromTo(
          heroTitleRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }
        );
        gsap.fromTo(
          heroSubRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.9, delay: 0.15, ease: 'power3.out' }
        );
      }

      if (tourSectionRef.current) {
        ScrollTrigger.create({
          trigger: tourSectionRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
          onUpdate: (self) => {
            const p = self.progress;
            setScrollProgress(p);
            const idx = Math.min(
              EXHIBITS.length - 1,
              Math.max(0, Math.round(p * (EXHIBITS.length - 1)))
            );
            setActiveExhibitIndex((prev) => {
              if (prev !== idx) {
                museumAudio.playChime(idx);
                return idx;
              }
              return prev;
            });
          },
        });
      }
    });

    return () => ctx.revert();
  }, []);

  // Jump to a specific exhibit in the 3D Virtual Tour
  const handleStepExhibit = useCallback((targetIdx: number) => {
    const clamped = Math.max(0, Math.min(EXHIBITS.length - 1, targetIdx));
    setActiveExhibitIndex(clamped);
    setScrollProgress(clamped / (EXHIBITS.length - 1));
    setInspectRotationY(0);
    museumAudio.playChime(clamped);

    // Also scroll the tour container smoothly if user clicked from outside or inside
    if (tourSectionRef.current) {
      const rect = tourSectionRef.current.getBoundingClientRect();
      const sectionTop = window.scrollY + rect.top;
      const scrollableDistance = tourSectionRef.current.offsetHeight - window.innerHeight;
      if (scrollableDistance > 0) {
        const targetScrollY =
          sectionTop + (clamped / (EXHIBITS.length - 1)) * scrollableDistance;
        window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
      }
    }
  }, []);

  // Focus an exhibit in the 3D tour directly from the Catalogue section
  const handleJumpTo3DTourFromCatalogue = (index: number) => {
    setIsFreeInspectMode(true);
    handleStepExhibit(index);
  };

  // Immediate Touch & Pointer Gesture Handlers on the 3D Viewport Wrapper
  const handleViewportPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Ignore clicks on buttons/inputs inside the HUD
    if ((e.target as HTMLElement).closest('[data-hud-control="true"]')) return;
    pointerDragRef.current = {
      isDown: true,
      startX: e.clientX,
      baseRot: inspectRotationY,
    };
  };

  const handleViewportPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerDragRef.current.isDown) return;
    const deltaX = e.clientX - pointerDragRef.current.startX;
    setInspectRotationY(pointerDragRef.current.baseRot + deltaX * 0.012);
  };

  const handleViewportPointerUp = () => {
    pointerDragRef.current.isDown = false;
  };

  const handleToggleAudio = () => {
    const playing = museumAudio.toggleAmbient();
    setIsAudioPlaying(playing);
  };

  const ARCHITECTURAL_STUDIES = [
    {
      index: 'I',
      title: 'The Cycladic Peristyle & Limestone Arches',
      angle: 'Azimuth 112° · Morning Equinox',
      ratio: 'Golden Section 1 : 1.618',
      body: 'Five monolithic whitewashed limestone arches curve along a 19.5-meter radius, echoing the natural amphitheater of the Syros cliffside. Each arch is cut without mortar from Naxian stone blocks, framing slices of the Aegean sky and casting crisp geometric shadows across the honed travertine floor.',
    },
    {
      index: 'II',
      title: 'Solar Oculus & Brise-Soleil Rhythm',
      angle: 'Zenith 68° · Summer Solstice',
      ratio: '22 Coffered Beams · 1.65m Pitch',
      body: 'Overhead, twenty-two structural stone louvres filter the intense Mediterranean midday glare into measured bands of light and shade. As the sun traverses the meridian, the beams act as an architectural sundial, illuminating different sculptural facets every hour.',
    },
    {
      index: 'III',
      title: 'The Obsidian Reflecting Basin',
      angle: 'Horizon 0° · Acoustic Stillness',
      ratio: '18.0m × 5.5m × 0.14m Depth',
      body: 'At the threshold of the gallery lies a shallow rectangular court lined with honed black volcanic basalt. Filled with still rainwater, the basin doubles the vertical height of the colonnade through mirror reflection while cooling the rising sea breeze.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111111] flex flex-col">
      {/* ===================================================================
          TOP BAR CONTRACT: Strictly 1 row, 3 zones separated by gap-8
          Zone 1: Brand Wordmark | Zone 2: 4 Nav Links | Zone 3: 1 Primary CTA
      =================================================================== */}
      <header className="sticky top-0 z-40 h-16 bg-[#FAF9F6]/95 border-b border-[#E5E4DE] px-6 lg:px-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#"
          className="font-display text-lg font-medium tracking-tight text-[#111111] whitespace-nowrap shrink-0"
        >
          Thalassa Museum
        </a>

        {/* Zone 2: 4 concise single-line navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-8 text-sm text-[#52524E]"
        >
          <a
            href="#virtual-tour"
            className="hover:text-[#111111] underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0"
          >
            Virtual Tour
          </a>
          <a
            href="#catalogue"
            className="hover:text-[#111111] underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0"
          >
            Exhibits
          </a>
          <a
            href="#architecture"
            className="hover:text-[#111111] underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0"
          >
            Architecture
          </a>
          <a
            href="#visit"
            className="hover:text-[#111111] underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0"
          >
            Visit
          </a>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => {
              setReservationExhibitTitle(undefined);
              setIsReservationOpen(true);
            }}
            className="px-4 py-2 text-xs font-mono uppercase tracking-widest bg-[#111111] text-[#FAF9F6] hover:bg-[#2B2B28] transition-colors whitespace-nowrap shrink-0"
          >
            Reserve Entry
          </button>
        </div>
      </header>

      <main className="flex-1">
        {/* ===================================================================
            HERO SECTION: Generous Mediterranean Whitespace & Editorial Contrast
        =================================================================== */}
        <section className="max-w-[1360px] mx-auto px-6 lg:px-16 pt-16 pb-20 lg:pt-28 lg:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">
            {/* Left 7 Columns: Editorial Typography */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 text-xs font-mono tracking-widest text-[#666662] mb-8">
                  <span>INAUGURAL MONOGRAPH</span>
                  <span aria-hidden="true">·</span>
                  <span>AUTUMN — WINTER 2026</span>
                  <span aria-hidden="true">·</span>
                  <span>SYROS & ATHENS</span>
                </div>

                <h1
                  ref={heroTitleRef}
                  className="font-display text-4xl sm:text-5xl lg:text-[3.65rem] font-normal tracking-tight leading-[1.08] text-[#111111] text-balance"
                >
                  Light Carved in{' '}
                  <span className="font-cursive italic font-normal text-[1.08em]">
                    White Marble
                  </span>{' '}
                  &amp; Obsidian Shadow.
                </h1>

                <div ref={heroSubRef} className="mt-10 max-w-[60ch] space-y-6">
                  <p className="text-base sm:text-lg text-[#3A3A37] leading-relaxed font-normal">
                    Set on a sunlit limestone promontory overlooking the Aegean, the
                    Thalassa Museum unites Early Cycladic abstraction, Geometric ceramic
                    vessels, and Hellenistic instruments within a minimalist monochrome
                    peristyle.
                  </p>

                  <div className="pt-4 flex flex-wrap items-center gap-4">
                    <a
                      href="#virtual-tour"
                      className="px-6 py-3.5 bg-[#111111] text-[#FAF9F6] text-xs font-mono uppercase tracking-widest hover:bg-[#2B2B28] transition-colors inline-flex items-center gap-3 whitespace-nowrap shrink-0"
                    >
                      <span>Enter 3D Virtual Tour</span>
                      <ArrowDown className="w-3.5 h-3.5" />
                    </a>

                    <a
                      href="#catalogue"
                      className="px-6 py-3.5 border border-[#111111] text-[#111111] text-xs font-mono uppercase tracking-widest hover:bg-[#111111] hover:text-[#FAF9F6] transition-colors whitespace-nowrap shrink-0"
                    >
                      Explore Archival Catalogue
                    </a>
                  </div>
                </div>
              </div>

              {/* Curatorial Epigraph at bottom of left column */}
              <div className="mt-16 pt-8 border-t border-[#E5E4DE] flex items-baseline justify-between gap-6">
                <p className="font-cursive italic text-xl text-[#454541] max-w-md">
                  “Where stone surrenders weight to become a pure vessel for
                  Mediterranean sunlight.”
                </p>
                <span className="text-xs font-mono text-[#73736E] whitespace-nowrap shrink-0">
                  37.4447° N, 24.9429° E
                </span>
              </div>
            </div>

            {/* Right 5 Columns: Featured Monochrome Archival Plate */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="relative flex-1 min-h-[380px] lg:min-h-[520px] border border-[#111111] bg-[#141413] overflow-hidden group">
                <MonochromeExhibitPlate
                  exhibit={EXHIBITS[2]}
                  className="w-full h-full"
                />
              </div>
              <p className="mt-3 text-xs font-cursive italic text-[#52524E] flex items-center justify-between">
                <span>
                  Fig. 1 — Peristyle Colonnade &amp; Carved Limestone Portico, Island of
                  Delos Study
                </span>
                <span className="font-mono not-italic text-[11px] text-[#73736E]">
                  ACC. 2026.03.11
                </span>
              </p>
            </div>
          </div>

          {/* Full-width Operational Utility Strip below the hero split */}
          <div className="mt-16 pt-8 border-t border-b border-[#111111] py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            <div>
              <div className="font-mono uppercase tracking-wider text-[#73736E] mb-1">
                OPENING HOURS
              </div>
              <div className="font-medium text-[#111111]">
                Tuesday – Sunday · 10:00 – 19:00 EET
              </div>
            </div>
            <div>
              <div className="font-mono uppercase tracking-wider text-[#73736E] mb-1">
                CURATORIAL PAVILION
              </div>
              <div className="font-medium text-[#111111]">
                Ermoupoli Cliffside &amp; North Peristyle
              </div>
            </div>
            <div>
              <div className="font-mono uppercase tracking-wider text-[#73736E] mb-1">
                3D DIGITAL ARCHIVE
              </div>
              <div className="font-medium text-[#111111]">
                5 Interactive Sculptural Bays · WebGL 2.0
              </div>
            </div>
            <div className="sm:text-right flex sm:justify-end items-center">
              <button
                type="button"
                onClick={() => handleStepExhibit(0)}
                className="font-mono uppercase tracking-widest text-[#111111] underline underline-offset-4 hover:text-[#52524E] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <span>Begin Scroll-Triggered Tour</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* ===================================================================
            SCROLL-TRIGGERED 3D VIRTUAL TOUR SECTION (React Three Fiber + GSAP)
            Height = 460vh so scrolling smoothly traverses all 5 exhibits
        =================================================================== */}
        <section
          id="virtual-tour"
          ref={tourSectionRef}
          aria-label="3D Virtual Museum Tour"
          className="relative w-full h-[460vh] border-t border-b border-[#111111]"
        >
          {/* Sticky Full-Viewport 3D Stage */}
          <div
            onPointerDown={handleViewportPointerDown}
            onPointerMove={handleViewportPointerMove}
            onPointerUp={handleViewportPointerUp}
            onPointerCancel={handleViewportPointerUp}
            className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-[#F7F6F2] cursor-grab active:cursor-grabbing"
          >
            {/* 100% Unobstructed Center 3D Scene */}
            <MuseumGalleryScene
              activeExhibitIndex={activeExhibitIndex}
              scrollProgress={scrollProgress}
              isFreeInspectMode={isFreeInspectMode}
              inspectRotationY={inspectRotationY}
              inspectZoomOffset={inspectZoomOffset}
              explodedFactor={explodedFactor}
              lightingPreset={activeLightingPreset}
              onSelectExhibit={(idx) => handleStepExhibit(idx)}
            />

            {/* Top-Left Minimal Curatorial Spec Header (Unobtrusive DOM Overlay) */}
            <div
              data-hud-control="true"
              className="absolute top-20 left-6 lg:left-12 z-20 max-w-md bg-[#FAF9F6] border border-[#111111] p-5 sm:p-6 shadow-sm pointer-events-auto"
            >
              <div className="flex items-center justify-between gap-4 text-[11px] font-mono tracking-widest text-[#666662] mb-2">
                <span>
                  EXHIBIT {activeExhibit.index} / 0{EXHIBITS.length}
                </span>
                <span>·</span>
                <span>{activeExhibit.accessionNumber}</span>
              </div>

              <h2 className="font-display text-xl sm:text-2xl font-normal tracking-tight text-[#111111]">
                {activeExhibit.title}
              </h2>
              <p className="font-cursive italic text-base text-[#52524E] mt-0.5">
                {activeExhibit.subtitle}
              </p>

              <p className="mt-3 text-xs sm:text-sm text-[#3A3A37] leading-relaxed">
                {activeExhibit.curatorNote}
              </p>

              <div className="mt-4 pt-3 border-t border-[#E5E4DE] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#52524E]">
                <span>{activeExhibit.period}</span>
                <span>·</span>
                <span>{activeExhibit.galleryWing}</span>
              </div>

              {/* Progress bar across the 5 exhibits */}
              <div className="mt-3 w-full h-[2px] bg-[#E5E4DE] overflow-hidden">
                <div
                  className="h-full bg-[#111111] transition-transform duration-150 origin-left"
                  style={{
                    transform: `scaleX(${Math.max(0.08, (activeExhibitIndex + 1) / EXHIBITS.length)})`,
                  }}
                />
              </div>
            </div>

            {/* Top-Right Touch & Gesture Helper Pill-Free Note */}
            <div
              data-hud-control="true"
              className="hidden xl:flex absolute top-20 right-12 z-20 bg-[#FAF9F6] border border-[#D6D3CB] px-4 py-2.5 items-center gap-3 text-xs font-mono text-[#52524E]"
            >
              <Compass className="w-3.5 h-3.5 text-[#111111]" />
              <span>SCROLL TO TRAVERSE BAYS · DRAG OR SWIPE TO ROTATE 360°</span>
            </div>

            {/* ===============================================================
                UNIFIED COLLAPSIBLE BOTTOM CONTROL DOCK
                Pinned to bottom-center (Zero left/right flank occlusion, no backdrop-filter)
            =============================================================== */}
            <div
              data-hud-control="true"
              className="
                absolute bottom-5 left-1/2 -translate-x-1/2 z-20
                w-[94vw] max-w-[920px] pointer-events-auto
              "
            >
              {/* Collapse / Expand Drawer Tab */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setIsDockCollapsed((prev) => !prev)}
                  className="px-4 py-1.5 bg-[#111111] text-[#FAF9F6] text-[11px] font-mono tracking-widest uppercase flex items-center gap-2 border border-b-0 border-[#111111] whitespace-nowrap shrink-0"
                >
                  {isDockCollapsed ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span>Show Tour Controls (H)</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      <span>Hide Controls · Zen View (H)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Collapsible Dock Body (Solid surface, no backdrop-filter over WebGL) */}
              {!isDockCollapsed && (
                <div className="bg-[#FAF9F6] border border-[#111111] p-3 sm:p-4 shadow-lg">
                  <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                    {/* 1. Exhibit Waypoint Selector (01 - 05) + Prev/Next */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
                      <button
                        type="button"
                        onClick={() =>
                          handleStepExhibit(Math.max(0, activeExhibitIndex - 1))
                        }
                        disabled={activeExhibitIndex === 0}
                        aria-label="Previous exhibit"
                        className="w-10 h-10 flex items-center justify-center border border-[#D6D3CB] hover:border-[#111111] disabled:opacity-35 transition-colors shrink-0"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {EXHIBITS.map((ex, idx) => {
                        const active = idx === activeExhibitIndex;
                        return (
                          <button
                            type="button"
                            key={ex.id}
                            onClick={() => handleStepExhibit(idx)}
                            className={`h-10 px-3 text-xs font-mono transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 border ${
                              active
                                ? 'bg-[#111111] text-[#FAF9F6] border-[#111111]'
                                : 'bg-white text-[#111111] border-[#D6D3CB] hover:border-[#111111]'
                            }`}
                          >
                            <span>{ex.index}</span>
                            <span className="hidden sm:inline text-[11px]">
                              {ex.title.split(' ')[0]}
                            </span>
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() =>
                          handleStepExhibit(
                            Math.min(EXHIBITS.length - 1, activeExhibitIndex + 1)
                          )
                        }
                        disabled={activeExhibitIndex === EXHIBITS.length - 1}
                        aria-label="Next exhibit"
                        className="w-10 h-10 flex items-center justify-center border border-[#D6D3CB] hover:border-[#111111] disabled:opacity-35 transition-colors shrink-0"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* 2. Interactive 3D Inspection & Exploded View Controls */}
                    <div className="flex flex-wrap items-center gap-2 border-t lg:border-t-0 pt-2 lg:pt-0 border-[#E5E4DE]">
                      {/* Close-up Inspect Mode Toggle */}
                      <button
                        type="button"
                        onClick={() => setIsFreeInspectMode((prev) => !prev)}
                        className={`h-10 px-3 text-xs font-mono border transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                          isFreeInspectMode
                            ? 'bg-[#111111] text-[#FAF9F6] border-[#111111]'
                            : 'bg-white text-[#111111] border-[#D6D3CB] hover:border-[#111111]'
                        }`}
                      >
                        {isFreeInspectMode ? (
                          <ZoomOut className="w-3.5 h-3.5" />
                        ) : (
                          <ZoomIn className="w-3.5 h-3.5" />
                        )}
                        <span>{isFreeInspectMode ? 'Exit Close-Up' : 'Close-Up View'}</span>
                      </button>

                      {/* Exploded Structural Separation Slider */}
                      <div className="h-10 px-3 bg-white border border-[#D6D3CB] flex items-center gap-2 shrink-0">
                        <Layers className="w-3.5 h-3.5 text-[#52524E]" />
                        <label
                          htmlFor="exploded-slider"
                          className="text-[11px] font-mono text-[#52524E] whitespace-nowrap"
                        >
                          ANATOMY
                        </label>
                        <input
                          id="exploded-slider"
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          value={explodedFactor}
                          onChange={(e) => setExplodedFactor(parseFloat(e.target.value))}
                          className="w-20 accent-[#111111] cursor-pointer"
                        />
                      </div>

                      {/* Solar Lighting Preset Switcher */}
                      <button
                        type="button"
                        onClick={() =>
                          setLightingPresetIndex(
                            (prev) => (prev + 1) % LIGHTING_PRESETS.length
                          )
                        }
                        className="h-10 px-3 bg-white border border-[#D6D3CB] hover:border-[#111111] text-xs font-mono flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                        title="Cycle Mediterranean Solar Lighting"
                      >
                        <Sun className="w-3.5 h-3.5" />
                        <span>{activeLightingPreset.label}</span>
                      </button>

                      {/* Reset Rotation Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setInspectRotationY(0);
                          setInspectZoomOffset(0);
                          setExplodedFactor(0);
                        }}
                        aria-label="Reset 3D orientation"
                        title="Reset Sculpture Orientation"
                        className="w-10 h-10 bg-white border border-[#D6D3CB] hover:border-[#111111] flex items-center justify-center transition-colors shrink-0"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      {/* Acoustic Court Audio Toggle */}
                      <button
                        type="button"
                        onClick={handleToggleAudio}
                        aria-label={
                          isAudioPlaying ? 'Mute acoustic court' : 'Play acoustic court'
                        }
                        title="Toggle Peristyle Acoustic Resonance"
                        className={`w-10 h-10 border flex items-center justify-center transition-colors shrink-0 ${
                          isAudioPlaying
                            ? 'bg-[#111111] text-[#FAF9F6] border-[#111111]'
                            : 'bg-white text-[#111111] border-[#D6D3CB] hover:border-[#111111]'
                        }`}
                      >
                        {isAudioPlaying ? (
                          <Volume2 className="w-3.5 h-3.5" />
                        ) : (
                          <VolumeX className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ===================================================================
            CURATORIAL EXHIBITION CATALOGUE (#catalogue)
            Generous margins, unboxed metadata, full accession records
        =================================================================== */}
        <section
          id="catalogue"
          className="max-w-[1360px] mx-auto px-6 lg:px-16 py-24 lg:py-36"
        >
          {/* Section Header */}
          <div className="max-w-3xl mb-20 lg:mb-28">
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#666662] mb-4">
              <span>CURATORIAL ARCHIVE</span>
              <span aria-hidden="true">·</span>
              <span>PERMANENT COLLECTION MONOGRAPH</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#111111] text-balance">
              Five Studies in{' '}
              <span className="font-cursive italic font-normal">
                Mediterranean Tectonics
              </span>
            </h2>
            <p className="mt-6 text-base sm:text-lg text-[#454541] leading-relaxed max-w-[65ch]">
              Each work in the inaugural installation was selected for its rigorous
              reduction of form. Separated by up to four millennia, these five artifacts
              converse through shared proportions, monochrome mineral surfaces, and active
              play with direct sunlight.
            </p>
          </div>

          {/* Alternating Spacious Exhibit Monographs */}
          <div className="space-y-24 lg:space-y-36">
            {EXHIBITS.map((exhibit, idx) => {
              const isEven = idx % 2 === 0;
              const isExpanded = expandedCatalogueId === exhibit.id;

              return (
                <article
                  key={exhibit.id}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start pt-12 border-t border-[#D6D3CB]"
                >
                  {/* Visual Plate Column (5 cols) */}
                  <div
                    className={`lg:col-span-5 ${
                      isEven ? 'lg:order-1' : 'lg:order-2'
                    }`}
                  >
                    <div className="border border-[#111111] bg-[#141413] aspect-[4/3] overflow-hidden group">
                      <MonochromeExhibitPlate
                        exhibit={exhibit}
                        className="w-full h-full"
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs font-cursive italic text-[#52524E]">
                      <span>
                        Plate {exhibit.index} — {exhibit.title} ({exhibit.origin})
                      </span>
                      <span className="font-mono not-italic text-[11px] text-[#73736E]">
                        {exhibit.dimensions}
                      </span>
                    </div>
                  </div>

                  {/* Editorial & Accession Metadata Column (7 cols) */}
                  <div
                    className={`lg:col-span-7 ${
                      isEven ? 'lg:order-2' : 'lg:order-1'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#666662] mb-3">
                      <span>{exhibit.index}</span>
                      <span aria-hidden="true">/</span>
                      <span>{exhibit.accessionNumber}</span>
                      <span aria-hidden="true">·</span>
                      <span>{exhibit.galleryWing}</span>
                    </div>

                    <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-[#111111]">
                      {exhibit.title}
                    </h3>
                    <p className="font-cursive italic text-xl text-[#52524E] mt-1">
                      {exhibit.subtitle}
                    </p>

                    <p className="mt-6 text-base text-[#292927] leading-relaxed max-w-[65ch] first-letter:font-cursive first-letter:text-4xl first-letter:float-left first-letter:mr-3 first-letter:leading-none first-letter:text-[#111111]">
                      {exhibit.extendedEssay}
                    </p>

                    {/* Structured Museum Accession Definition List (dl) */}
                    <dl className="mt-8 border-t border-b border-[#D6D3CB] divide-y divide-[#E5E4DE] text-xs">
                      <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <dt className="font-mono uppercase tracking-wider text-[#666662]">
                          Chronology &amp; Origin
                        </dt>
                        <dd className="sm:col-span-2 text-[#111111] font-medium">
                          {exhibit.period} · {exhibit.origin}
                        </dd>
                      </div>
                      <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <dt className="font-mono uppercase tracking-wider text-[#666662]">
                          Medium &amp; Finish
                        </dt>
                        <dd className="sm:col-span-2 text-[#111111]">
                          {exhibit.medium}
                        </dd>
                      </div>
                      <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <dt className="font-mono uppercase tracking-wider text-[#666662]">
                          Dimensions
                        </dt>
                        <dd className="sm:col-span-2 font-mono text-[#111111]">
                          {exhibit.dimensions}
                        </dd>
                      </div>
                    </dl>

                    {/* Expandable Structural Components & Provenance Drawer */}
                    {isExpanded && (
                      <div className="mt-6 p-6 bg-white border border-[#D6D3CB] space-y-5">
                        <div>
                          <div className="text-xs font-mono uppercase tracking-wider text-[#52524E] mb-3">
                            3D Structural Components &amp; Material Study
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {exhibit.structuralComponents.map((comp, cIdx) => (
                              <div
                                key={cIdx}
                                className="border-t border-[#111111] pt-2.5"
                              >
                                <div className="font-display text-xs font-medium text-[#111111]">
                                  0{cIdx + 1}. {comp.partName}
                                </div>
                                <div className="text-xs text-[#666662] mt-1 leading-relaxed">
                                  {comp.materialNote}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-[#E5E4DE]">
                          <div className="text-xs font-mono uppercase tracking-wider text-[#52524E] mb-2">
                            Archival Provenance
                          </div>
                          <ul className="space-y-1 text-xs text-[#3A3A37]">
                            {exhibit.provenance.map((line, pIdx) => (
                              <li key={pIdx}>
                                <span className="font-mono text-[#73736E] mr-2">
                                  [{pIdx + 1}]
                                </span>
                                {line}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Action Row */}
                    <div className="mt-8 flex flex-wrap items-center gap-4">
                      <button
                        type="button"
                        onClick={() => handleJumpTo3DTourFromCatalogue(idx)}
                        className="px-5 py-3 bg-[#111111] text-[#FAF9F6] text-xs font-mono uppercase tracking-widest hover:bg-[#2B2B28] transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
                      >
                        <span>Inspect in 3D Virtual Tour</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedCatalogueId(isExpanded ? '' : exhibit.id)
                        }
                        className="px-5 py-3 border border-[#D6D3CB] hover:border-[#111111] text-xs font-mono uppercase tracking-widest text-[#111111] transition-colors whitespace-nowrap shrink-0"
                      >
                        {isExpanded
                          ? 'Hide Provenance & Anatomy'
                          : 'Read Provenance & Anatomy'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setReservationExhibitTitle(exhibit.title);
                          setIsReservationOpen(true);
                        }}
                        className="text-xs font-mono uppercase tracking-widest text-[#52524E] hover:text-[#111111] underline underline-offset-4 px-2 py-2 whitespace-nowrap shrink-0"
                      >
                        Book Scholar Viewing
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ===================================================================
            MEDITERRANEAN ARCHITECTURAL MONOGRAPH SECTION (#architecture)
            Clean black-and-white contrast, generous margins, interactive study
        =================================================================== */}
        <section
          id="architecture"
          className="bg-[#111111] text-[#FAF9F6] py-24 lg:py-36 border-t border-[#111111]"
        >
          <div className="max-w-[1360px] mx-auto px-6 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
              {/* Left 6 Columns: Narrative & Interactive Tectonic Tabs */}
              <div className="lg:col-span-6 space-y-8">
                <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#A3A19A]">
                  <span>ARCHITECTURAL MONOGRAPH</span>
                  <span aria-hidden="true">·</span>
                  <span>ATELIER KOUROS &amp; VALLETTA</span>
                </div>

                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#FAF9F6] text-balance">
                  Built from{' '}
                  <span className="font-cursive italic font-normal">
                    Lime, Shadow
                  </span>{' '}
                  &amp; Sea Horizon.
                </h2>

                <p className="text-base text-[#D6D3CB] leading-relaxed max-w-[60ch] tracking-[0.01em]">
                  Designed as an open-air monastic peristyle, the museum uses no artificial
                  daytime gallery spotlights. Instead, thick Cycladic masonry walls and
                  calibrated roof apertures shape the Mediterranean sun into a slow-moving
                  curatorial instrument.
                </p>

                {/* Interactive Architectural Chapter Selector */}
                <div className="pt-4 space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#2E2E2B] pb-4">
                    {ARCHITECTURAL_STUDIES.map((study, sIdx) => {
                      const active = sIdx === activeArchStudyIndex;
                      return (
                        <button
                          type="button"
                          key={study.index}
                          onClick={() => setActiveArchStudyIndex(sIdx)}
                          className={`px-4 py-2 text-xs font-mono uppercase tracking-widest transition-colors whitespace-nowrap shrink-0 border ${
                            active
                              ? 'bg-[#FAF9F6] text-[#111111] border-[#FAF9F6]'
                              : 'bg-transparent text-[#A3A19A] border-[#3A3A36] hover:border-[#FAF9F6] hover:text-[#FAF9F6]'
                          }`}
                        >
                          Study {study.index}
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Study Details */}
                  <div className="p-6 sm:p-8 border border-[#2E2E2B] bg-[#181816] space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#A3A19A]">
                      <span>{ARCHITECTURAL_STUDIES[activeArchStudyIndex].angle}</span>
                      <span>·</span>
                      <span>{ARCHITECTURAL_STUDIES[activeArchStudyIndex].ratio}</span>
                    </div>
                    <h3 className="font-display text-xl sm:text-2xl font-normal text-[#FAF9F6]">
                      {ARCHITECTURAL_STUDIES[activeArchStudyIndex].title}
                    </h3>
                    <p className="text-sm sm:text-base text-[#D6D3CB] leading-relaxed">
                      {ARCHITECTURAL_STUDIES[activeArchStudyIndex].body}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right 6 Columns: Interactive Architectural Plan & Solar Section SVG Diagram */}
              <div className="lg:col-span-6">
                <div className="border border-[#3A3A36] bg-[#161614] p-6 sm:p-10">
                  <div className="flex items-center justify-between text-xs font-mono text-[#A3A19A] mb-6">
                    <span>PERISTYLE PLAN &amp; SOLAR VECTOR DIAGRAM</span>
                    <span>SCALE 1 : 100</span>
                  </div>

                  {/* Architectural SVG Plan showing the 5 Exhibits & Curved Arched Colonnade */}
                  <svg
                    viewBox="0 0 600 420"
                    className="w-full h-auto border border-[#2E2E2B] bg-[#111110]"
                    role="img"
                    aria-label="Architectural floorplan of the 5 museum exhibit bays"
                  >
                    {/* Subtle Architectural Grid */}
                    <g stroke="#222220" strokeWidth="1">
                      <line x1="0" y1="105" x2="600" y2="105" />
                      <line x1="0" y1="210" x2="600" y2="210" />
                      <line x1="0" y1="315" x2="600" y2="315" />
                      <line x1="150" y1="0" x2="150" y2="420" />
                      <line x1="300" y1="0" x2="300" y2="420" />
                      <line x1="450" y1="0" x2="450" y2="420" />
                    </g>

                    {/* Outer Curved Peristyle Colonnade Arc */}
                    <path
                      d="M 60 280 A 260 220 0 0 1 540 280"
                      fill="none"
                      stroke="#52524E"
                      strokeWidth="1.5"
                      strokeDasharray="6 6"
                    />

                    {/* Central Reflecting Water Basin */}
                    <rect
                      x="170"
                      y="285"
                      width="260"
                      height="75"
                      fill="#1B1B19"
                      stroke="#FAF9F6"
                      strokeWidth="1.2"
                    />
                    <text
                      x="300"
                      y="327"
                      textAnchor="middle"
                      fill="#A3A19A"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      OBSIDIAN REFLECTING BASIN (18.0m × 5.5m)
                    </text>

                    {/* Solar Incidence Rays from active study */}
                    { [110, 200, 300, 400, 490].map((xPos, idx) => {
                      const isSelectedBay = idx === activeExhibitIndex;
                      const yPos = [210, 145, 115, 145, 210][idx];
                      return (
                        <g
                          key={idx}
                          onClick={() => handleStepExhibit(idx)}
                          className="cursor-pointer"
                        >
                          {/* Sun Ray Vector */}
                          <line
                            x1={xPos + (activeArchStudyIndex - 1) * 45}
                            y1={20}
                            x2={xPos}
                            y2={yPos}
                            stroke={isSelectedBay ? '#FAF9F6' : '#3A3A36'}
                            strokeWidth={isSelectedBay ? '1.5' : '1'}
                            strokeDasharray="3 3"
                          />

                          {/* Bay Arch Wall */}
                          <path
                            d={`M ${xPos - 26} ${yPos - 22} A 26 20 0 0 1 ${
                              xPos + 26
                            } ${yPos - 22}`}
                            fill="none"
                            stroke="#FAF9F6"
                            strokeWidth="2"
                          />

                          {/* Interactive Plinth Node */}
                          <circle
                            cx={xPos}
                            cy={yPos}
                            r={isSelectedBay ? 16 : 12}
                            fill={isSelectedBay ? '#FAF9F6' : '#181816'}
                            stroke="#FAF9F6"
                            strokeWidth="1.5"
                          />
                          <text
                            x={xPos}
                            y={yPos + 4}
                            textAnchor="middle"
                            fill={isSelectedBay ? '#111111' : '#FAF9F6'}
                            fontSize="10"
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            0{idx + 1}
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-4 text-xs text-[#A3A19A]">
                    <span>
                      Click any numbered bay (01–05) on the architectural plan to move the
                      3D camera directly to that plinth.
                    </span>
                    <span className="font-mono text-[#FAF9F6]">
                      ACTIVE BAY: 0{activeExhibitIndex + 1} ({activeExhibit.title})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            VISITOR INFORMATION & ADMISSION SECTION (#visit)
            Generous margins, editorial precision
        =================================================================== */}
        <section
          id="visit"
          className="max-w-[1360px] mx-auto px-6 lg:px-16 py-24 lg:py-36"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
            <div className="lg:col-span-5">
              <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#666662] mb-4">
                <span>VISITOR GUIDELINES</span>
                <span aria-hidden="true">·</span>
                <span>PHYSICAL &amp; DIGITAL ACCESS</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-normal tracking-tight text-[#111111] text-balance">
                Plan Your Visit to the{' '}
                <span className="font-cursive italic font-normal">
                  Syros Peristyle
                </span>
              </h2>
              <p className="mt-6 text-base text-[#454541] leading-relaxed">
                To preserve the acoustic stillness and unhurried contemplation of the five
                galleries, admission is paced by timed solar entry slots.
              </p>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setReservationExhibitTitle(undefined);
                    setIsReservationOpen(true);
                  }}
                  className="px-6 py-4 bg-[#111111] text-[#FAF9F6] text-xs font-mono uppercase tracking-widest hover:bg-[#2B2B28] transition-colors inline-flex items-center gap-3 whitespace-nowrap shrink-0"
                >
                  <span>Reserve Timed Admission Pass</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-10 pt-2 border-t border-[#111111]">
              <div>
                <h3 className="font-mono text-xs uppercase tracking-widest text-[#666662] mb-3">
                  01. Hours &amp; Solar Schedule
                </h3>
                <p className="text-sm text-[#111111] leading-relaxed">
                  Tuesday through Sunday: 10:00 – 19:00 EET
                  <br />
                  Twilight Chiaroscuro Study: Fridays until 21:00
                  <br />
                  Closed Mondays for conservation &amp; archival photography.
                </p>
              </div>

              <div>
                <h3 className="font-mono text-xs uppercase tracking-widest text-[#666662] mb-3">
                  02. Location &amp; Ferry Approach
                </h3>
                <p className="text-sm text-[#111111] leading-relaxed">
                  Akti Poseidonos Promontory, 84100 Ermoupoli
                  <br />
                  Island of Syros, Cyclades, Greece
                  <br />
                  12 minutes on foot via the marble harbor steps.
                </p>
              </div>

              <div>
                <h3 className="font-mono text-xs uppercase tracking-widest text-[#666662] mb-3">
                  03. Accessibility
                </h3>
                <p className="text-sm text-[#111111] leading-relaxed">
                  Step-free travertine ramps connect all five peristyle bays and the
                  central reflecting court. Tactile marble scale reliefs and audio
                  descriptions accompany every plinth.
                </p>
              </div>

              <div>
                <h3 className="font-mono text-xs uppercase tracking-widest text-[#666662] mb-3">
                  04. Research &amp; Scholars
                </h3>
                <p className="text-sm text-[#111111] leading-relaxed">
                  High-resolution 3D laser scans and provenance dossiers are open to
                  researchers by appointment in the North Study Room.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ===================================================================
          MINIMALIST INSTITUTIONAL FOOTER (Quiet copyright & real navigation)
      =================================================================== */}
      <footer className="border-t border-[#D6D3CB] bg-[#FAF9F6] px-6 lg:px-16 py-12">
        <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-xs text-[#52524E]">
          <div>
            <span className="font-display font-medium text-[#111111]">
              Thalassa — Museum of Mediterranean Form
            </span>
            <span className="mx-2">·</span>
            <span>Foundation for Cycladic &amp; Classical Architecture</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a href="#virtual-tour" className="hover:text-[#111111] transition-colors">
              3D Tour
            </a>
            <a href="#catalogue" className="hover:text-[#111111] transition-colors">
              Archival Catalogue
            </a>
            <a href="#architecture" className="hover:text-[#111111] transition-colors">
              Monograph
            </a>
            <button
              type="button"
              onClick={() => {
                setReservationExhibitTitle(undefined);
                setIsReservationOpen(true);
              }}
              className="hover:text-[#111111] underline underline-offset-4 transition-colors"
            >
              Timed Entry Pass
            </button>
          </div>
        </div>
      </footer>

      {/* Timed-Entry Reservation Modal */}
      <TicketReservationModal
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
        initialSelectedExhibitTitle={reservationExhibitTitle}
      />
    </div>
  );
}
