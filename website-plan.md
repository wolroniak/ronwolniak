# Webseite-Plan für ronwolniak.com

## Übersicht
Erstellung einer minimalistischen, optisch ansprechenden Webseite für Ron Wolniak mit Dark/Light Mode, interaktiven Animationen und einer futuristischen Ästhetik.

## Technologie-Stack
- **Framework**: Nuxt.js 3
- **Styling**: TailwindCSS
- **Animationen**: Three.js für 3D-Animationen
- **Hosting**: Linux VPS mit Plesk
- **Deployment**: Git-basierter Workflow

## Projektstruktur
```
ronwolniak/
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions für automatisches Deployment
├── assets/
│   ├── css/
│   └── images/
├── components/
│   ├── AnimationCanvas.vue # Three.js Animation Component
│   ├── ThemeToggle.vue     # Dark/Light Mode Toggle
│   └── TheHeader.vue       # Header Component
├── composables/
│   └── useMousePosition.ts # Mouse tracking für Animation
├── layouts/
│   └── default.vue         # Hauptlayout mit Theme-Unterstützung
├── pages/
│   └── index.vue           # Landing Page
├── public/
│   ├── favicon.ico
│   └── robots.txt
├── app.vue
├── nuxt.config.ts
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
```

## Design-Konzept
- **Farbschema**:
  - **Dark Mode**: Tiefes Schwarz (#121212) als Hintergrund, Akzentfarben in Neon-Blau (#00FFFF) und subtilen Violett-Tönen (#9D4EDD)
  - **Light Mode**: Reines Weiß (#FFFFFF) als Hintergrund, Akzentfarben in Tiefblau (#0077B6) und subtilen Lavendel-Tönen (#7209B7)

- **Typografie**:
  - Hauptschrift: "Inter" für klare Lesbarkeit
  - Akzentschrift: "Space Grotesk" für futuristische Überschriften

- **Animation**:
  - Interaktives 3D-Netzwerk aus Partikeln/Linien, das auf Mausbewegungen reagiert
  - Subtile Farbveränderungen basierend auf der Mausposition
  - Sanfte Übergänge zwischen Dark und Light Mode

## Implementierungsplan

### Phase 1: Setup & Grundstruktur
1. Nuxt.js 3 Projekt initialisieren
2. TailwindCSS und Three.js integrieren
3. Dark/Light Mode Funktionalität implementieren
4. Basis-Layout erstellen

### Phase 2: Animation & Interaktivität
1. Three.js Canvas-Komponente entwickeln
2. Maus-Tracking implementieren
3. Partikel-Netzwerk Animation erstellen
4. Interaktivität und Reaktionen auf Mausbewegungen hinzufügen

### Phase 3: Styling & Responsive Design
1. Detailliertes Styling der Landing Page
2. Responsive Design für alle Bildschirmgrößen
3. Animationsperformance für mobile Geräte optimieren
4. Barrierefreiheit sicherstellen

### Phase 4: Deployment & Optimierung
1. Git-Repository einrichten
2. Deployment-Workflow konfigurieren
3. Performance-Optimierung (Lighthouse-Score verbessern)
4. SEO-Optimierung

## Deployment-Strategie
1. Git-Repository auf GitHub/GitLab hosten
2. SSH-Zugang zum VPS-Server einrichten
3. Automatisiertes Deployment über Git-Hooks oder GitHub Actions
4. Plesk für Domain-Management und SSL-Zertifikate nutzen

## Nächste Schritte
1. Projekt initialisieren und Repository einrichten
2. Grundlegende Animation-Prototypen entwickeln
3. Design-Mockups für Dark/Light Mode erstellen
