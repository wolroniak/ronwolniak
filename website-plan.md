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

**Abgeschlossen:**
- **Projekt initialisieren und Repository einrichten**
  - Nuxt.js 3 Projekt wurde im Verzeichnis `/home/ron/ronwolniak` initialisiert.
  - Git-Repository wurde im Projektverzeichnis initialisiert.

**Aktueller Schritt:**
- **Grundlegende Animation-Prototypen entwickeln**
  - **Unter-Schritte:**
    1. **Abgeschlossen:** Three.js als Abhängigkeit zum Projekt hinzufügen (via `npm install three`).
    2. **Abgeschlossen:** Das `AnimationCanvas.vue` Komponent erstellen (in `components/AnimationCanvas.vue`).
    3. **Abgeschlossen:** Eine minimale Three.js Szene (rotierender Würfel) im `AnimationCanvas.vue` eingerichtet.
    4. **Abgeschlossen:** Das `AnimationCanvas.vue` Komponent in `pages/index.vue` eingebunden und die Seite erstellt.
    5. **Abgeschlossen:** Prototyp getestet (via `npm run dev`) - rotierender Würfel sollte unter http://localhost:3000 sichtbar sein.

**Phase 1: Setup & Grundstruktur - Abgeschlossen**

### Phase 2: Animation & Interaktivität
**Aktueller Schritt:**
- **Maus-Tracking implementieren**
  - **Unter-Schritte:**
    1. **Abgeschlossen:** Den `useMousePosition.ts` Composable erstellt (in `composables/useMousePosition.ts`).
    2. **Abgeschlossen:** Den Composable in `AnimationCanvas.vue` importiert und verwendet, um Mauskoordinaten zu erhalten.
    3. **Abgeschlossen:** Die erhaltenen Mauskoordinaten werden in der Konsole ausgegeben (via `watch` und `console.log`).

**Aktueller Schritt (Maus-Tracking implementieren) - Abgeschlossen.**

**Aktueller Schritt:**
- **Partikel-Netzwerk Animation erstellen**
  - **Unter-Schritte:**
    1. **Abgeschlossen:** Bestehende Würfel-Animation aus `AnimationCanvas.vue` entfernt.
    2. **Abgeschlossen:** Parameter für Partikelsystem definiert (Anzahl `PARTICLE_COUNT = 5000`, Verteilung `PARTICLE_SPREAD = 100`).
    3. **Abgeschlossen:** Partikelpositionen erstellt und `BufferGeometry` (`particlesGeometry`) damit gefüllt.
    4. **Abgeschlossen:** `PointsMaterial` (`particlesMaterial`) für Partikel erstellt (Farbe: weiß, Größe: 0.02).
    5. **Abgeschlossen:** `THREE.Points` Objekt (`particles`) erstellt und zur Szene hinzugefügt.
    6. **Abgeschlossen:** Statische Partikel sollten nun im Browser Preview sichtbar sein.

**Aktueller Schritt (Partikel-Netzwerk Animation erstellen) - Abgeschlossen.**

**Aktueller Schritt:**
- **Interaktivität und Reaktionen auf Mausbewegungen hinzufügen**
  - **Unter-Schritte:**
    1. **Abgeschlossen:** Das gesamte Partikelsystem (`particles`) rotiert nun in `AnimationCanvas.vue` basierend auf `mouseX` und `mouseY`.
    2. **Abgeschlossen:** Die Kamera-Position wird nun in `AnimationCanvas.vue` basierend auf Mausbewegung angepasst, um einen Parallax-Effekt zu erzeugen.
    3. **Abgeschlossen:** Interaktionen (Partikel-Rotation und Kamera-Parallax) im Browser Preview überprüft und als performant und wie erwartet funktionierend angenommen.

**Aktueller Schritt (Interaktivität und Reaktionen auf Mausbewegungen hinzufügen) - Abgeschlossen.**
**Phase 2: Animation & Interaktivität - Abgeschlossen.**

**Nächster Schritt (aus Phase 1, verschoben):**
- **Design-Mockups für Dark/Light Mode erstellen**
  - **Unter-Schritte:**
    1. **Abgeschlossen:** Farbschemata für Dark/Light Mode finalisiert.
       - **Dark Mode**: BG: `#121212`, Akzente: `#00FFFF` (Neon-Blau), `#9D4EDD` (Violett)
       - **Light Mode**: BG: `#FFFFFF`, Akzente: `#0077B6` (Tiefblau), `#7209B7` (Lavendel)
    2. **Abgeschlossen:** Typografie-Entscheidungen bestätigt (Haupt: Inter, Akzent: Space Grotesk).
    3. **Abgeschlossen:** Layout für Landing Page Mockups definiert:
       - **Header:** Schlank, oben fixiert. "Ron Wolniak" linksbündig, Theme-Toggle rechtsbündig.
       - **Animation Canvas:** Nimmt den gesamten Viewport-Hintergrund ein.
       - **Text Inhalt:** Vorerst kein zusätzlicher Text; Fokus auf Animation.

**Aktueller Schritt (Design-Mockups für Dark/Light Mode erstellen) - Abgeschlossen.**
**Phase 1: Grundlagen & Planung (inkl. verschobener Design-Mockups) - Abgeschlossen.**

**Nächster Schritt: Phase 3: Styling & Responsive Design**
- **Unter-Schritte:**
  1. **Abgeschlossen:** Grundlegendes Layout für `pages/index.vue` mit `TheHeader.vue` (neu erstellt) und `AnimationCanvas.vue` erstellt (TailwindCSS).
  2. **Abgeschlossen:** Styling für `TheHeader.vue` implementiert (Schriftart: Space Grotesk, Textfarben für Dark/Light Mode via Tailwind `dark:` Präfix, Layout). Die Funktionalität des Dark Mode Wechsels (via `@nuxtjs/color-mode` und `tailwind.config.js`) muss ggf. noch sichergestellt werden.
  3. **Problem:** `TheHeader.vue` ist nicht sichtbar, obwohl `AnimationCanvas.vue` korrekt angezeigt wird. `z-index` Werte (`z-50` für Header, `z-0` für Canvas) scheinen korrekt.
     **Problem identifiziert:** TailwindCSS ist nicht im Projekt installiert/konfiguriert.
     **Behoben:** `@nuxtjs/tailwindcss` installiert.
     **Behoben:** `tailwind.config.js` erstellt.
     **Behoben:** `@nuxtjs/tailwindcss` Modul zu `nuxt.config.ts` hinzugefügt.
     **TailwindCSS Setup abgeschlossen und Styles sind nun sichtbar.**
  4. **Abgeschlossen:** Ursprüngliches Layout in `pages/index.vue` und `TheHeader.vue` wiederhergestellt. Header wird korrekt über dem vollflächigen, responsiven `AnimationCanvas` angezeigt.
  5. **Abgeschlossen:** `ThemeToggle.vue` erstellt und Basis-Styling (Button-Platzhalter) implementiert.
  6. **Abgeschlossen:** `ThemeToggle.vue` Komponente in `TheHeader.vue` platziert.
  7. **Aktueller Unter-Schritt:** Implementierung der Dark/Light Mode Umschaltung:
     a. **Abgeschlossen:** Installation von `@nuxtjs/color-mode`.
     b. **Abgeschlossen (Konfiguration):**
        i. `@nuxtjs/color-mode` zu `nuxt.config.ts` hinzugefügt.
        ii. `darkMode: 'class'` zu `tailwind.config.js` hinzugefügt.
     c. **Abgeschlossen:** Logik (Verwendung von `useColorMode`) und Icons (☀️/🌙) zu `ThemeToggle.vue` hinzugefügt.
     **Dark/Light Mode Implementierung (ThemeToggle) abgeschlossen und Funktionalität bestätigt:** Toggle-Icon und Header-Textfarbe ändern sich korrekt.
     **Nächster Schritt (Theme-Anpassung):** `AnimationCanvas.vue` Theme-sensitiv machen:
        a. **Abgeschlossen:** Aktuellen Theme-Status (`useColorMode().value`) als Prop von `pages/index.vue` an `AnimationCanvas.vue` übergeben.
        b. **Abgeschlossen:** In `AnimationCanvas.vue` den Prop `currentTheme` definiert, auf Änderungen reagiert und Three.js Szene (Hintergrund, Partikelfarben) angepasst.
     **`AnimationCanvas` ist jetzt Theme-sensitiv und Funktionalität bestätigt.**
  8. **Abgeschlossen:** Grundlegendes Responsive Design sichergestellt (Header und Layout auf simulierten Geräten überprüft und für gut befunden).

**Ausstehend (Weitere Phasen):**
- **NEUES FEATURE: Interaktive Sonnensystem-Szene mit Raumschiff**
  - **Phase A: Statisches Sonnensystem & Raumschiff**
    - **Abgeschlossen:** Partikelsystem als Sternenhintergrund angepasst.
    - **Abgeschlossen:** Sonne als Lichtquelle (`PointLight`) und sichtbare Kugel (`SphereGeometry` mit `MeshBasicMaterial`) hinzugefügt. Szene ist statisch.
    - **Abgeschlossen:** Erde als blaue Kugel hinzugefügt und sichtbar gemacht.
    - **Abgeschlossen:** Textur auf Erde angewendet.
    - **Abgeschlossen:** Helligkeit der Sonne erhöht.
    - **Abgeschlossen:** Textur für die Sonne erfolgreich angewendet (neue Quelle wegen CORS-Problemen).
    - **Abgeschlossen:** Feinabstimmung der Helligkeit von Sonne (Textur-Emission) und Beleuchtung der Erde.
    - **Abgeschlossen:** Einfaches Raumschiffmodell (`Executioner.gltf`) importiert. Statisch platziert und Kamera für initialen Third-Person-Look angepasst.
  - **Phase B: Basis-Raumschiffsteuerung**
    - **Status:** Weitgehend abgeschlossen, kleinere Anpassungen und Bugfixes bei Bedarf.

  **Ziele:**
  - Grundlegende Steuerung des Raumschiffs implementieren.
  - Interaktion mit der Simulationsumgebung (Pause, Start).

  **Fortschritt & Abgeschlossene Features:**
    - **Abgeschlossen:** Erdrotation (axial und orbital um die Sonne) implementiert. Kamera angepasst für kleineres Raumschiff.
    - **Abgeschlossen:** Implementierung Pausenfunktion (Enter-Taste, Overlay) und Umstellung des Steuerungsschemas:
        - Automatischer Vorwärtsflug Raumschiff.
        - W/S-Tasten für Neigen (Hoch/Runter).
        - A/D-Tasten für Gieren (Links/Rechts).
        - Raumschiff-Modell Orientierung korrigiert (fliegt visuell vorwärts).
        - Geschwindigkeit und Spielbereich angepasst.
        - Unsichtbare Grenzen für Spielbereich implementiert.
    - **Abgeschlossen:** Planetengrößen (Sonne, Erde) angepasst. Startmenü und verfeinerte Pausenlogik (mit `simulationState`) implementiert.
    - **Abgeschlossen:** Keybinding-Menü im Pausenmenü implementiert. Tastenbelegungen für Raumschiffsteuerung sind nun anpassbar und werden im Local Storage gespeichert. Die Funktionalität wurde erfolgreich debugged und implementiert.
    - **Abgeschlossen:** Crash-Screen implementiert: Zeigt an, mit welchem Himmelsobjekt das Raumschiff kollidiert ist (z.B. "Kollision mit Erde").
### Phase C: UI/UX Verbesserungen
  - **Status:** Abgeschlossen

  **Ziele:**
  - Verbesserung der Benutzererfahrung und visuellen Ästhetik der Simulations-Overlays.

  **Fortschritt & Abgeschlossene Features:**
    - **Abgeschlossen:** UI-Redesign für Dark Theme: Alle Menüs (Start, Pause, Crash-Screen, Keybinding-Einstellungen) haben nun ein dunkles, transparentes Design mit weißen/hellen Texten und Ghost-Style Buttons erhalten. Dies sorgt für eine moderne und kohärente "Deep Space"-Ästhetik innerhalb der Simulation.

### Phase D: Inhaltliche Erweiterung & Optimierung
  - **Status:** Laufend

  **Ziele:**
  - Hinzufügen neuer interaktiver Elemente und Spielinhalte für die Sonnensystem-Simulation.
  - Optimierung der Performance und Vorbereitung auf mobile Nutzung.

  **Als Nächstes in Phase D (Sonnensystem-Simulation):**
    - **Geplant:** Implementierung eines einfachen Missionsziels oder Sammelobjekts (z.B. "Erreiche den Mars" oder sammle Weltraumschrott).
    - **Geplant:** Hinzufügen von Soundeffekten (z.B. Triebwerksgeräusch, Kollision, Menü-Interaktionen).
    - **Geplant:** Texturen für Planeten verbessern / hinzufügen (z.B. Mars, Venus, Merkur).
    - **Geplant:** Mobile Optimierung: Performance und Steuerung für mobile Geräte verbessern (Touch-Controls evaluieren und ggf. implementieren für die Simulation).

  **Zukünftige Ideen für die Sonnensystem-Simulation (Ausblick Phase E und darüber hinaus):**
    - Erweiterung des Sonnensystems: Zusätzliche Planeten (Jupiter, Saturn etc.), Monde, Asteroidenfelder, Kometen, interstellare Nebel.
    - Fortgeschrittene Raumschiff-Interaktionen: Andockmanöver an Raumstationen, Ressourcensammeln, einfache Handelsmechaniken.
    - Physik-Verbesserungen: Gravitationseffekte von Planeten auf das Raumschiff (optional zuschaltbar für Realismus vs. Arcade-Feeling).
    - Visuelle Effekte: Partikelsysteme für Triebwerke, Lens Flares, volumetrisches Licht.
    - Story-Elemente / Lore: Kleine Hintergrundgeschichten oder Entdeckungen im All.
    - Mini-Karte / Navigationssystem.
    - Mehr Details auf Planetenoberflächen (sofern Landung implementiert wird).

---

## Ursprünglicher Plan (Phasen 3 & 4 - Webseite Allgemein)

Die folgenden Phasen beziehen sich auf allgemeinere Aspekte der Webseite, außerhalb der reinen Sonnensystem-Simulation. Einige Punkte könnten bereits durch die Arbeit an der Simulation abgedeckt oder beeinflusst worden sein.

### Phase 3: Styling & Responsive Design (Webseite Allgemein)
1. Detailliertes Styling der Landing Page (falls mehr als die Simulation angezeigt werden soll).
2. Responsive Design für alle Bildschirmgrößen sicherstellen.
3. Animationsperformance für mobile Geräte optimieren (gilt auch für die Simulation, wird aber hier als allgemeiner Punkt für die Webseite betrachtet).
4. Barrierefreiheit sicherstellen.

### Phase 4: Deployment & Optimierung (Webseite Allgemein)
1. Git-Repository einrichten (bereits geschehen).
2. Deployment-Workflow konfigurieren (bereits geschehen).
3. Performance-Optimierung (Lighthouse-Score verbessern).
4. SEO-Optimierung.
