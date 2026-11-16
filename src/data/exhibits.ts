export interface ExhibitData {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  accessionNumber: string;
  period: string;
  origin: string;
  medium: string;
  dimensions: string;
  galleryWing: string;
  curatorNote: string;
  extendedEssay: string;
  provenance: string[];
  structuralComponents: {
    partName: string;
    materialNote: string;
  }[];
  /** 3D position of the plinth center in the Mediterranean gallery */
  plinthPosition: [number, number, number];
  /** Default camera position when scrolled to this exhibit */
  cameraPosition: [number, number, number];
  /** Default lookAt target when scrolled to this exhibit */
  cameraTarget: [number, number, number];
  /** Optional generated photo path */
  imageUrl?: string;
  /** Motif identifier for high-resolution monochrome plate rendering */
  plateType: 'cycladic' | 'amphora' | 'capital' | 'astrolabe' | 'monolith';
}

export interface LightingPreset {
  id: 'morning' | 'zenith' | 'chiaroscuro';
  label: string;
  timeLabel: string;
  sunPosition: [number, number, number];
  keyIntensity: number;
  ambientIntensity: number;
  hemiIntensity: number;
  backgroundHex: string;
  fogHex: string;
  description: string;
}

export const LIGHTING_PRESETS: LightingPreset[] = [
  {
    id: 'morning',
    label: 'Aegean Morning',
    timeLabel: '08:30 EET · Low East Raking Light',
    sunPosition: [14, 11, 8],
    keyIntensity: 2.2,
    ambientIntensity: 0.55,
    hemiIntensity: 0.75,
    backgroundHex: '#F7F6F2',
    fogHex: '#F7F6F2',
    description: 'Crisp eastern sunlight raking across whitewashed limestone arches, casting long oblique floor shadows.'
  },
  {
    id: 'zenith',
    label: 'Solar Zenith',
    timeLabel: '12:45 EET · Vertical Oculus Beam',
    sunPosition: [2, 22, 3],
    keyIntensity: 2.6,
    ambientIntensity: 0.7,
    hemiIntensity: 0.9,
    backgroundHex: '#FAF9F6',
    fogHex: '#FAF9F6',
    description: 'High Mediterranean noon pouring vertically through the coffered ceiling oculus onto Parian marble surfaces.'
  },
  {
    id: 'chiaroscuro',
    label: 'Chiaroscuro Study',
    timeLabel: '18:15 EET · Dramatic Gallery Contrast',
    sunPosition: [-15, 8, -4],
    keyIntensity: 2.8,
    ambientIntensity: 0.28,
    hemiIntensity: 0.4,
    backgroundHex: '#ECEAE4',
    fogHex: '#ECEAE4',
    description: 'High-contrast western gallery light emphasizing carved flutes, incised geometric bands, and negative space.'
  }
];

export const EXHIBITS: ExhibitData[] = [
  {
    id: 'cycladic-idol',
    index: '01',
    title: 'Idol of Keros',
    subtitle: 'Canonical Folded-Arm Marble Figure',
    accessionNumber: 'ACC. 2026.01.04',
    period: 'Early Cycladic II · c. 2600 BCE',
    origin: 'Keros Sanctuary, Cyclades',
    medium: 'Carved Parian Island White Marble',
    dimensions: '64.2 × 18.5 × 9.4 cm',
    galleryWing: 'North Peristyle · Bay I',
    curatorNote:
      'Reduced to pure geometric planes—a tilted lyre-shaped head, elongated trapezoidal torso, and strictly horizontal folded arms—this figure embodies the birth of Mediterranean abstraction.',
    extendedEssay:
      'Carved using emery stone from Naxos and polished with pumice, the Keros figure rejects anatomical realism in favor of harmonic mathematical ratios. Under raking Mediterranean sunlight, the subtle ridge of the nose and the incised horizontal arm fold divide light and shadow with architectural precision.',
    provenance: [
      'Excavated near Kavos, Island of Keros, 1963',
      'Archival loan, Cycladic Ephorate of Antiquities, Syros',
      'Permanent Collection, Thalassa Museum Pavilion (2024)'
    ],
    structuralComponents: [
      { partName: 'Lyre-Crown Cranial Plane', materialNote: 'Crystalline Parian marble, fine pumice polish' },
      { partName: 'Trapezoidal Torso & Folded Arms', materialNote: 'Incised geometric relief with 4:3 harmonic ratio' },
      { partName: 'Conical Columnar Neck & Base', materialNote: 'Pinned to travertine plinth via non-invasive brass armatures' }
    ],
    plinthPosition: [-12, 0, -4],
    cameraPosition: [-12, 2.35, 1.35],
    cameraTarget: [-12, 1.75, -4],
    plateType: 'cycladic'
  },
  {
    id: 'dipylon-amphora',
    index: '02',
    title: 'Dipylon Geometric Amphora',
    subtitle: 'Monumental Black-Glaze Funerary Vessel',
    accessionNumber: 'ACC. 2026.02.19',
    period: 'Late Geometric Period · c. 750 BCE',
    origin: 'Kerameikos Workshop, Athens',
    medium: 'Terracotta with Obsidian Iron-Slip Glaze',
    dimensions: '118.0 × 54.0 × 54.0 cm',
    galleryWing: 'West Colonnade · Bay II',
    curatorNote:
      'Every millimeter of the vessel’s surface is governed by a strict tectonic grid of concentric bands, hatched meanders, and rhythmic linear friezes.',
    extendedEssay:
      'Thrown in three distinct structural sections—foot, ovoid belly, and elongated cylindrical neck—the amphora translates architectural proportion into ceramic form. The contrast between matte mineral-black slip and warm pale clay anticipates the monochrome clarity of modern minimalism.',
    provenance: [
      'Attributed to the Hirschfeld Workshop Tradition, Attica',
      'Private Collection, Valletta & Geneva (1928–1999)',
      'Donated by the Foundation for Mediterranean Form (2025)'
    ],
    structuralComponents: [
      { partName: 'Flared Rim & Meander Neck Cylinder', materialNote: 'Triple-fired iron-rich black reduction glaze' },
      { partName: 'Twin Arching Loop Handles', materialNote: 'Hand-pulled clay coils joining shoulder to mid-neck' },
      { partName: 'Ovoid Belly & Stepped Ring Foot', materialNote: 'Lathe-turned profile with concentric geometric registers' }
    ],
    plinthPosition: [-6, 0, -6.5],
    cameraPosition: [-6, 2.4, -1.0],
    cameraTarget: [-6, 1.8, -6.5],
    plateType: 'amphora'
  },
  {
    id: 'delos-capital',
    index: '03',
    title: 'Peristyle Capital of Delos',
    subtitle: 'Fluted Column Drum & Carved Echinus Fragment',
    accessionNumber: 'ACC. 2026.03.11',
    period: 'High Classical Period · c. 425 BCE',
    origin: 'Sanctuary of Apollo, Island of Delos',
    medium: 'Naxian & Pentelic Crystalline Limestone',
    dimensions: '92.5 × 114.0 × 86.0 cm',
    galleryWing: 'Central Oculus Court · Bay III',
    curatorNote:
      'Twenty concave flutes catch the moving Mediterranean sun, transforming a load-bearing stone cylinder into a living dial of vertical light and shadow.',
    extendedEssay:
      'In classical Mediterranean architecture, the column is never a static cylinder. Through subtle entasis and sharp arris ridges separating twenty carved flutes, the stone dematerializes in bright sunlight. The taut curve of the echinus transitions the vertical thrust of the shaft into the horizontal repose of the abacus slab.',
    provenance: [
      'Recorded in the French School architectural survey of Delos, 1909',
      'Conservation study, National Archaeological Workshop, Athens',
      'Installed in the Central Oculus Court, Thalassa Museum'
    ],
    structuralComponents: [
      { partName: 'Monolithic Abacus & Volute Cushion', materialNote: 'Chiseled Naxian marble with drafted margin edges' },
      { partName: 'Hyperbolic Echinus & Annulets', materialNote: 'Three crisp stone rings casting permanent shadow lines' },
      { partName: 'Twenty-Fluted Upper Column Drum', materialNote: 'Radial concave channels with central empolion dowel cavity' }
    ],
    plinthPosition: [0, 0, -8],
    cameraPosition: [0, 2.5, -2.2],
    cameraTarget: [0, 1.85, -8],
    imageUrl: '/src/assets/images/exhibit_corinthian_capital_1794771212016.jpg',
    plateType: 'capital'
  },
  {
    id: 'rhodes-astrolabe',
    index: '04',
    title: 'Astrolabe of Rhodes',
    subtitle: 'Hellenistic Armillary & Solar Meridian Instrument',
    accessionNumber: 'ACC. 2026.04.07',
    period: 'Hellenistic Period · c. 150 BCE',
    origin: 'School of Hipparchus, Rhodes',
    medium: 'Patinated Black-Bronze & Silvered Brass',
    dimensions: '78.4 × 62.0 × 62.0 cm',
    galleryWing: 'East Loggia · Bay IV',
    curatorNote:
      'Nested bronze rings map the celestial vault onto pure Euclidean circles, uniting Mediterranean maritime navigation with sculptural equilibrium.',
    extendedEssay:
      'Reconstructed from archaeological treatises and submerged Aegean bronze fragments, this armillary instrument demonstrates how ancient Mediterranean astronomers materialized the invisible geometry of the cosmos. Each graduated ring rotates around the polar axis, casting elliptical shadow intersections onto the white limestone plinth below.',
    provenance: [
      'Reconstructed after 2nd-century BCE Rhodian astronomical codices',
      'Maritime Antiquities Archive, Dodecanese Collection',
      'Curated for the Geometry & Cosmos Wing (2025)'
    ],
    structuralComponents: [
      { partName: 'Outer Meridian & Horizon Rings', materialNote: 'Cast patinated black-bronze with 360-degree incised divisions' },
      { partName: 'Inclined Ecliptic & Solstice Band', materialNote: 'Brushed silvered brass tilted at 23.4° axial obliquity' },
      { partName: 'Central Sighting Alidade & Zenith Axis', materialNote: 'Revolving dioptra vane anchored to a stepped marble pedestal' }
    ],
    plinthPosition: [6, 0, -6.5],
    cameraPosition: [6, 2.4, -1.0],
    cameraTarget: [6, 1.8, -6.5],
    plateType: 'astrolabe'
  },
  {
    id: 'aegean-monolith',
    index: '05',
    title: 'Monolith of the Aegean Horizon',
    subtitle: 'Interlocking Carrara Arch & Basalt Void Study',
    accessionNumber: 'ACC. 2026.05.22',
    period: 'Contemporary Minimalism · 2025',
    origin: 'Tinos & Carrara Sculptural Atelier',
    medium: 'Honed White Marble & Obsidian Basalt',
    dimensions: '165.0 × 98.0 × 44.0 cm',
    galleryWing: 'South Reflecting Pool · Bay V',
    curatorNote:
      'Framing emptiness as a physical volume, twin cantilevered marble arches embrace a suspended ring of matte black volcanic basalt.',
    extendedEssay:
      'Commissioned specifically for the museum’s south peristyle, this contemporary dialogue between white Tinos marble and dark volcanic stone distills four millennia of Mediterranean form. As the viewer orbits the sculpture, the circular void aligns with the museum’s limestone colonnade, turning the architecture itself into part of the work.',
    provenance: [
      'Carved at the Pyrgos Marble Guild, Island of Tinos (2025)',
      'Site-specific commission for Thalassa Inaugural Exhibition'
    ],
    structuralComponents: [
      { partName: 'Cantilevered Twin Marble Arches', materialNote: 'Honed matte white marble with 0.25 roughness finish' },
      { partName: 'Suspended Volcanic Basalt Torus', materialNote: 'Deep charcoal basalt honed to absorb incident sunlight' },
      { partName: 'Interlocking Mortise Plinth Block', materialNote: 'Dry-fitted stone joinery without synthetic adhesives' }
    ],
    plinthPosition: [12, 0, -4],
    cameraPosition: [12, 2.45, 1.45],
    cameraTarget: [12, 1.85, -4],
    plateType: 'monolith'
  }
];
