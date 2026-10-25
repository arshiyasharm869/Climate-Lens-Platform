import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import * as d3Geo from 'd3-geo';
import { worldLandFeature, worldCountriesFeature } from '../services/geoData';

interface EarthGlobeProps {
  year: number;
  indicator: string;
  className?: string;
}

export const EarthGlobe: React.FC<EarthGlobeProps> = ({
  year,
  indicator = 'Global Temperature',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const prevPointerPosRef = useRef({ x: 0, y: 0 });
  const earthTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const textureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isAutoRotatingRef = useRef(true);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cameraZRef = useRef(2.7);
  const targetCameraZRef = useRef(2.7);
  const pinchStartDistRef = useRef<number | null>(null);

  // Zoom limits: min zoom keeps full Earth visible; max zoom allows detailed close-up
  const MIN_CAMERA_Z = 1.8; // Maximum zoom (close-up)
  const MAX_CAMERA_Z = 3.4; // Minimum zoom (full Earth visible)

  // Function to render Real Natural Earth Texture + Semi-Transparent Vibrant Climate Overlay
  const renderRealisticEarthTexture = (targetYear: number): HTMLCanvasElement => {
    const width = 2048;
    const height = 1024;
    const canvas = textureCanvasRef.current || document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    textureCanvasRef.current = canvas;

    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, width, height);

    // D3 Equirectangular projection mapping UV space to longitude [-180, 180] and latitude [90, -90]
    const projection = d3Geo
      .geoEquirectangular()
      .scale(width / (2 * Math.PI))
      .translate([width / 2, height / 2]);

    const path = d3Geo.geoPath(projection, ctx);

    // =========================================================================
    // 1. REAL BASE OCEAN (Natural deep ocean with bathymetry & coastal shelves)
    // =========================================================================
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
    oceanGrad.addColorStop(0, '#06162d'); // Polar ocean
    oceanGrad.addColorStop(0.2, '#0a2347');
    oceanGrad.addColorStop(0.5, '#0d2d58'); // Deep tropical/equatorial sapphire
    oceanGrad.addColorStop(0.8, '#0a2347');
    oceanGrad.addColorStop(1, '#06162d');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, width, height);

    // Shallow continental shelf waters around coastlines
    ctx.beginPath();
    path(worldLandFeature);
    ctx.strokeStyle = 'rgba(16, 75, 110, 0.45)';
    ctx.lineWidth = 12;
    ctx.stroke();

    ctx.beginPath();
    path(worldLandFeature);
    ctx.strokeStyle = 'rgba(20, 105, 145, 0.35)';
    ctx.lineWidth = 5;
    ctx.stroke();

    // =========================================================================
    // 2. REAL NATURAL CONTINENTS & BIOMES
    // Clipped strictly to real geographic boundaries (North America, South America,
    // Europe, Africa, Asia, Australia, Antarctica, Greenland, etc.)
    // =========================================================================
    ctx.save();
    ctx.beginPath();
    path(worldLandFeature);
    ctx.clip(); // Only paint inside true geographic land

    // Base temperate vegetation (natural rich green)
    const landBaseGrad = ctx.createLinearGradient(0, 0, 0, height);
    landBaseGrad.addColorStop(0, '#eaf4fd'); // Arctic snow
    landBaseGrad.addColorStop(0.12, '#21422b'); // Tundra/boreal forest
    landBaseGrad.addColorStop(0.3, '#2a5a36'); // Temperate forests
    landBaseGrad.addColorStop(0.5, '#224e2c'); // Tropical canopy
    landBaseGrad.addColorStop(0.7, '#2a5a36'); // Southern temperate
    landBaseGrad.addColorStop(0.88, '#eaf4fd'); // Antarctica permanent ice
    landBaseGrad.addColorStop(1, '#eaf4fd');
    ctx.fillStyle = landBaseGrad;
    ctx.fillRect(0, 0, width, height);

    // Authentic Biomes: Deserts, Steppes & Savannas
    // Sahara & Arabian Peninsula
    const saharaGrad = ctx.createRadialGradient(
      ((25 + 180) / 360) * width,
      ((90 - 24) / 180) * height,
      20,
      ((25 + 180) / 360) * width,
      ((90 - 24) / 180) * height,
      180
    );
    saharaGrad.addColorStop(0, '#c79d5f');
    saharaGrad.addColorStop(0.7, '#b88f50');
    saharaGrad.addColorStop(1, 'rgba(184, 143, 80, 0)');
    ctx.fillStyle = saharaGrad;
    ctx.beginPath();
    ctx.arc(
      ((25 + 180) / 360) * width,
      ((90 - 24) / 180) * height,
      180,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Australian Outback
    const ausGrad = ctx.createRadialGradient(
      ((133 + 180) / 360) * width,
      ((90 - -25) / 180) * height,
      10,
      ((133 + 180) / 360) * width,
      ((90 - -25) / 180) * height,
      100
    );
    ausGrad.addColorStop(0, '#b87747');
    ausGrad.addColorStop(0.8, '#a66838');
    ausGrad.addColorStop(1, 'rgba(166, 104, 56, 0)');
    ctx.fillStyle = ausGrad;
    ctx.beginPath();
    ctx.arc(
      ((133 + 180) / 360) * width,
      ((90 - -25) / 180) * height,
      100,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Gobi & Central Asian Steppe
    const gobiGrad = ctx.createRadialGradient(
      ((95 + 180) / 360) * width,
      ((90 - 42) / 180) * height,
      10,
      ((95 + 180) / 360) * width,
      ((90 - 42) / 180) * height,
      90
    );
    gobiGrad.addColorStop(0, '#a89464');
    gobiGrad.addColorStop(0.7, '#928052');
    gobiGrad.addColorStop(1, 'rgba(146, 128, 82, 0)');
    ctx.fillStyle = gobiGrad;
    ctx.beginPath();
    ctx.arc(
      ((95 + 180) / 360) * width,
      ((90 - 42) / 180) * height,
      90,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Kalahari Desert
    const kalahariGrad = ctx.createRadialGradient(
      ((22 + 180) / 360) * width,
      ((90 - -23) / 180) * height,
      10,
      ((22 + 180) / 360) * width,
      ((90 - -23) / 180) * height,
      60
    );
    kalahariGrad.addColorStop(0, '#b38f5a');
    kalahariGrad.addColorStop(1, 'rgba(179, 143, 90, 0)');
    ctx.fillStyle = kalahariGrad;
    ctx.beginPath();
    ctx.arc(
      ((22 + 180) / 360) * width,
      ((90 - -23) / 180) * height,
      60,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Southwestern US & Northern Mexico arid zone
    const swUsGrad = ctx.createRadialGradient(
      ((-110 + 180) / 360) * width,
      ((90 - 32) / 180) * height,
      10,
      ((-110 + 180) / 360) * width,
      ((90 - 32) / 180) * height,
      65
    );
    swUsGrad.addColorStop(0, '#9e895c');
    swUsGrad.addColorStop(1, 'rgba(158, 137, 92, 0)');
    ctx.fillStyle = swUsGrad;
    ctx.beginPath();
    ctx.arc(
      ((-110 + 180) / 360) * width,
      ((90 - 32) / 180) * height,
      65,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Antarctica & Greenland Permanent Glacial Ice Caps
    // Antarctica (lat < -60)
    ctx.fillStyle = '#f0f8ff';
    ctx.fillRect(0, ((90 - -60) / 180) * height, width, height);

    // Greenland continental ice sheet
    const glGrad = ctx.createRadialGradient(
      ((-42 + 180) / 360) * width,
      ((90 - 72) / 180) * height,
      10,
      ((-42 + 180) / 360) * width,
      ((90 - 72) / 180) * height,
      95
    );
    glGrad.addColorStop(0, '#ffffff');
    glGrad.addColorStop(0.7, '#e8f4fc');
    glGrad.addColorStop(1, 'rgba(232, 244, 252, 0)');
    ctx.fillStyle = glGrad;
    ctx.beginPath();
    ctx.arc(
      ((-42 + 180) / 360) * width,
      ((90 - 72) / 180) * height,
      95,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.restore(); // End clipping

    // =========================================================================
    // 3. SEMI-TRANSPARENT VIBRANT CLIMATE TEMPERATURE OVERLAY
    // Deep Blue -> Cyan -> Green -> Yellow -> Orange -> Red
    // The natural Earth remains 100% visible underneath
    // =========================================================================
    const heatCanvas = document.createElement('canvas');
    heatCanvas.width = 512;
    heatCanvas.height = 256;
    const heatCtx = heatCanvas.getContext('2d')!;
    const heatImgData = heatCtx.createImageData(512, 256);

    // Multi-decadal warming scale factor (1980 -> ~0.28, 2026 -> ~1.24)
    const yearNormalized = (targetYear - 1970) / 55;
    const globalAnomalyFactor = 0.25 + yearNormalized * 1.05;

    for (let py = 0; py < 256; py++) {
      const lat = 90 - (py / 256) * 180; // -90 to 90
      const absLat = Math.abs(lat);

      for (let px = 0; px < 512; px++) {
        const lng = (px / 512) * 360 - 180; // -180 to 180
        const idx = (py * 512 + px) * 4;

        // Base regional anomaly modeling physical reality:
        // Arctic amplification: high latitudes warm 2.5x to 3x global rate
        let anomaly = 0;
        if (lat > 55) {
          anomaly = 1.9 * globalAnomalyFactor;
        } else if (lat < -60) {
          anomaly = -1.2 + 0.3 * globalAnomalyFactor; // Antarctica remains subzero
        } else if (absLat < 25) {
          anomaly = 0.85 * globalAnomalyFactor; // Tropics
        } else {
          anomaly = 1.15 * globalAnomalyFactor; // Mid-latitudes
        }

        // Continental heatwaves & thermodynamic thermal domes
        if (lat >= 12 && lat <= 36 && lng >= -15 && lng <= 60) {
          // Sahara & Middle East heat dome
          anomaly += 1.5 * globalAnomalyFactor;
        } else if (lat >= 15 && lat <= 32 && lng >= 68 && lng <= 90) {
          // Indian Subcontinent
          anomaly += 1.35 * globalAnomalyFactor;
        } else if (lat >= 25 && lat <= 65 && lng >= 60 && lng <= 140) {
          // Eurasian interior & Siberia
          anomaly += 1.65 * globalAnomalyFactor;
        } else if (lat >= 25 && lat <= 52 && lng >= -125 && lng <= -70) {
          // North American continent
          anomaly += 1.25 * globalAnomalyFactor;
        } else if (lat >= -25 && lat <= 5 && lng >= -75 && lng <= -40) {
          // South American Amazon & Cerrado
          anomaly += 1.2 * globalAnomalyFactor;
        } else if (lat >= -35 && lat <= -15 && lng >= 115 && lng <= 152) {
          // Australia
          anomaly += 1.45 * globalAnomalyFactor;
        } else if (lat >= 36 && lat <= 58 && lng >= -10 && lng <= 35) {
          // European Mediterranean & continent
          anomaly += 1.3 * globalAnomalyFactor;
        }

        // Subtle harmonic fluctuations
        anomaly += Math.sin((lng * Math.PI) / 60) * 0.25 + Math.cos((lat * Math.PI) / 35) * 0.2;

        // Temperature Gradient:
        // deep blue -> cyan -> green -> yellow -> orange -> red
        let r = 0;
        let g = 0;
        let b = 0;
        let a = 180;

        if (anomaly < -1.0) {
          // Deep blue
          r = 29;
          g = 78;
          b = 216;
          a = 150;
        } else if (anomaly < 0.0) {
          // Cyan
          const t = (anomaly + 1.0) / 1.0;
          r = Math.round(29 + t * (6 - 29));
          g = Math.round(78 + t * (182 - 78));
          b = Math.round(216 + t * (212 - 216));
          a = 160;
        } else if (anomaly < 0.8) {
          // Green
          const t = anomaly / 0.8;
          r = Math.round(6 + t * (16 - 6));
          g = Math.round(182 + t * (185 - 182));
          b = Math.round(212 + t * (129 - 212));
          a = 165;
        } else if (anomaly < 1.8) {
          // Yellow
          const t = (anomaly - 0.8) / 1.0;
          r = Math.round(16 + t * (234 - 16));
          g = Math.round(185 + t * (179 - 185));
          b = Math.round(129 + t * (8 - 129));
          a = 175;
        } else if (anomaly < 2.8) {
          // Orange
          const t = (anomaly - 1.8) / 1.0;
          r = Math.round(234 + t * (249 - 234));
          g = Math.round(179 + t * (115 - 179));
          b = Math.round(8 + t * (22 - 8));
          a = 185;
        } else {
          // Red
          const t = Math.min(1.0, (anomaly - 2.8) / 1.2);
          r = Math.round(249 + t * (239 - 249));
          g = Math.round(115 - t * 47);
          b = Math.round(22 + t * 46);
          a = 200;
        }

        heatImgData.data[idx] = r;
        heatImgData.data[idx + 1] = g;
        heatImgData.data[idx + 2] = b;
        heatImgData.data[idx + 3] = a;
      }
    }
    heatCtx.putImageData(heatImgData, 0, 0);

    // Draw the semi-transparent climate layer smoothly onto the Earth
    ctx.save();
    ctx.globalAlpha = 0.42; // Perfect transparency preserving natural Earth underneath
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(heatCanvas, 0, 0, width, height);
    ctx.restore();

    // =========================================================================
    // 4. CRISP COASTLINES & COUNTRY BORDERS (Rendered over the heat overlay)
    // =========================================================================
    // Natural coastlines
    ctx.beginPath();
    path(worldLandFeature);
    ctx.strokeStyle = 'rgba(110, 231, 183, 0.75)'; // Soft emerald glowing coastline
    ctx.lineWidth = 1.0;
    ctx.stroke();

    // Sovereign country boundaries
    ctx.beginPath();
    path(worldCountriesFeature);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 0.55;
    ctx.stroke();

    // NOTE: Removed unnecessary graticule lines that caused a horizontal decorative line

    return canvas;
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    // 1. Three.js Scene, Camera & WebGL Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = cameraZRef.current;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Earth Group (Rotated to showcase major continents prominently)
    const earthGroup = new THREE.Group();
    earthGroup.rotation.y = 1.85; // Initial view displaying Europe, Africa, Mediterranean, and Atlantic
    earthGroup.rotation.x = 0.23; // Realistic Earth axial tilt (23.5 degrees)
    scene.add(earthGroup);

    // 3. Realistic Earth Sphere with Canvas Texture
    const canvas = renderRealisticEarthTexture(year);
    const earthTexture = new THREE.CanvasTexture(canvas);
    earthTexture.wrapS = THREE.RepeatWrapping;
    earthTexture.wrapT = THREE.ClampToEdgeWrapping;
    earthTextureRef.current = earthTexture;

    const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.6,
      metalness: 0.08,
    });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    earthGroup.add(earthMesh);

    // 4. Realistic Wispy Atmospheric Cloud Layer
    const cloudsGeometry = new THREE.SphereGeometry(1.012, 64, 64);
    const cloudsCanvas = document.createElement('canvas');
    cloudsCanvas.width = 1024;
    cloudsCanvas.height = 512;
    const cloudCtx = cloudsCanvas.getContext('2d')!;
    cloudCtx.clearRect(0, 0, 1024, 512);

    // Draw realistic equatorial and mid-latitude cloud swirls
    cloudCtx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    for (let i = 0; i < 48; i++) {
      const cx = Math.random() * 1024;
      // Concentrate near equator and mid-latitude storm tracks
      const cy = Math.random() > 0.5 ? 180 + Math.random() * 150 : 80 + Math.random() * 350;
      const rx = 40 + Math.random() * 90;
      const ry = 15 + Math.random() * 35;
      cloudCtx.beginPath();
      cloudCtx.ellipse(cx, cy, rx, ry, Math.random() * 0.4, 0, Math.PI * 2);
      cloudCtx.fill();
    }
    const cloudsTexture = new THREE.CanvasTexture(cloudsCanvas);
    cloudsTexture.wrapS = THREE.RepeatWrapping;

    const cloudsMaterial = new THREE.MeshStandardMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending,
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    earthGroup.add(cloudsMesh);

    // 5. Atmospheric Rayleigh Scattering Glow (Fresnel rim halo)
    const atmosphereGeometry = new THREE.SphereGeometry(1.16, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.4);
          gl_FragColor = vec4(0.06, 0.76, 0.95, 1.0) * intensity * 1.5;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphereMesh);

    // 6. Space Starfield Background Dust
    const starsCount = 300;
    const starsGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 16;
      starPositions[i + 1] = (Math.random() - 0.5) * 16;
      starPositions[i + 2] = -2 - Math.random() * 6;
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMaterial = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.02,
      transparent: true,
      opacity: 0.45,
    });
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);

    // 7. Realistic Day / Night Planetary Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45); // Night-side illumination
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffbf2, 2.2); // Sunlight
    sunLight.position.set(4, 2.2, 3);
    scene.add(sunLight);

    const cyanRimLight = new THREE.DirectionalLight(0x06b6d4, 0.6); // Deep space reflection
    cyanRimLight.position.set(-4, -1, -2);
    scene.add(cyanRimLight);

    // =========================================================================
    // 8. ACCURATE SPHERICAL HIT-TESTING & EVENT HANDLING
    // CRITICAL: The Earth must NOT capture the entire webpage's scrolling!
    // ONLY pointer interaction directly ON the spherical Earth is intercepted.
    // =========================================================================
    const raycaster = new THREE.Raycaster();
    const dom = renderer.domElement;

    // Check if client coordinates lie directly on the Earth sphere
    const isPointerOverEarth = (clientX: number, clientY: number): boolean => {
      const rect = dom.getBoundingClientRect();
      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        return false;
      }
      const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
      const hits = raycaster.intersectObject(earthMesh, false);
      return hits.length > 0;
    };

    // Hover effect: update cursor style only when over the Earth sphere
    const onPointerMove = (e: PointerEvent) => {
      if (isDraggingRef.current) return;
      const hit = isPointerOverEarth(e.clientX, e.clientY);
      dom.style.cursor = hit ? 'grab' : 'default';
    };

    // Pointer down: initiate drag ONLY if directly on the Earth
    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return; // Only primary mouse button
      if (!isPointerOverEarth(e.clientX, e.clientY)) {
        return; // Pointer outside Earth -> allow normal browser events
      }

      isDraggingRef.current = true;
      isAutoRotatingRef.current = false;
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      prevPointerPosRef.current = { x: e.clientX, y: e.clientY };
      dom.style.cursor = 'grabbing';
      dom.setPointerCapture(e.pointerId);
    };

    // Global drag rotation when dragging on Earth
    const onGlobalPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - prevPointerPosRef.current.x;
      const deltaY = e.clientY - prevPointerPosRef.current.y;
      prevPointerPosRef.current = { x: e.clientX, y: e.clientY };

      earthGroup.rotation.y += deltaX * 0.0055;
      earthGroup.rotation.x += deltaY * 0.0055;
      earthGroup.rotation.x = THREE.MathUtils.clamp(earthGroup.rotation.x, -0.75, 0.75);
    };

    // Drag end: resume slow automatic rotation after short delay
    const onPointerUp = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      try {
        dom.releasePointerCapture(e.pointerId);
      } catch {
        // Pointer capture release safety
      }
      dom.style.cursor = isPointerOverEarth(e.clientX, e.clientY) ? 'grab' : 'default';

      // Resume auto-rotation after 2.5s idle delay
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = setTimeout(() => {
        isAutoRotatingRef.current = true;
      }, 2500);
    };

    // Wheel zoom: ONLY intercept wheel events when pointer is directly over the Earth
    const onWheel = (e: WheelEvent) => {
      if (isPointerOverEarth(e.clientX, e.clientY)) {
        // Pointer is on Earth: prevent default page scrolling and adjust zoom smoothly
        e.preventDefault();
        const zoomDelta = e.deltaY * 0.0015;
        targetCameraZRef.current = THREE.MathUtils.clamp(
          targetCameraZRef.current + zoomDelta,
          MIN_CAMERA_Z,
          MAX_CAMERA_Z
        );
      }
      // If outside Earth: DO NOT call e.preventDefault(), allowing normal page scrolling!
    };

    // Mobile / Touch controls: support drag and pinch directly on Earth without locking page scroll
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        if (isPointerOverEarth(touch.clientX, touch.clientY)) {
          isDraggingRef.current = true;
          isAutoRotatingRef.current = false;
          if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
          prevPointerPosRef.current = { x: touch.clientX, y: touch.clientY };
        }
      } else if (e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        if (
          isPointerOverEarth(t1.clientX, t1.clientY) ||
          isPointerOverEarth(t2.clientX, t2.clientY)
        ) {
          pinchStartDistRef.current = Math.hypot(
            t2.clientX - t1.clientX,
            t2.clientY - t1.clientY
          );
        }
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isDraggingRef.current) {
        // Dragging on Earth -> prevent page scroll
        e.preventDefault();
        const touch = e.touches[0];
        const deltaX = touch.clientX - prevPointerPosRef.current.x;
        const deltaY = touch.clientY - prevPointerPosRef.current.y;
        prevPointerPosRef.current = { x: touch.clientX, y: touch.clientY };

        earthGroup.rotation.y += deltaX * 0.007;
        earthGroup.rotation.x += deltaY * 0.007;
        earthGroup.rotation.x = THREE.MathUtils.clamp(earthGroup.rotation.x, -0.75, 0.75);
      } else if (e.touches.length === 2 && pinchStartDistRef.current !== null) {
        // Pinching on Earth -> smooth zoom
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const diff = pinchStartDistRef.current - dist;
        pinchStartDistRef.current = dist;

        targetCameraZRef.current = THREE.MathUtils.clamp(
          targetCameraZRef.current + diff * 0.005,
          MIN_CAMERA_Z,
          MAX_CAMERA_Z
        );
      }
    };

    const onTouchEnd = () => {
      pinchStartDistRef.current = null;
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
        resumeTimerRef.current = setTimeout(() => {
          isAutoRotatingRef.current = true;
        }, 2500);
      }
    };

    // Attach DOM listeners
    dom.addEventListener('pointermove', onPointerMove);
    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onGlobalPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop with smooth zoom damping and slow auto-rotation
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth gradual zoom interpolation
      cameraZRef.current += (targetCameraZRef.current - cameraZRef.current) * 0.08;
      camera.position.z = cameraZRef.current;

      // Slow automatic planetary rotation when idle
      if (isAutoRotatingRef.current && !isDraggingRef.current) {
        earthGroup.rotation.y += 0.0012;
        cloudsMesh.rotation.y += 0.0016;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      dom.removeEventListener('pointermove', onPointerMove);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onGlobalPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      earthGeometry.dispose();
      earthMaterial.dispose();
      cloudsGeometry.dispose();
      cloudsMaterial.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      starsGeometry.dispose();
      starsMaterial.dispose();
    };
  }, []);

  // When year or indicator changes, re-render the texture onto existing WebGL sphere
  useEffect(() => {
    if (earthTextureRef.current) {
      renderRealisticEarthTexture(year);
      earthTextureRef.current.needsUpdate = true;
    }
  }, [year, indicator]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full select-none ${className}`}
      style={{ touchAction: 'pan-y' }}
    />
  );
};
