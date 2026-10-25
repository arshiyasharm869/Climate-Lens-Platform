import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { getJson, GeoResult, placeLabel } from '../services/api';
import { useSettings, toDisplayTemp } from '../settings';
import { Search, Home, Loader2, AlertCircle, X, Info } from 'lucide-react';

// Public NASA "Blue Marble" composite + night-lights images (static, not live satellite feeds)
const DAY_URLS = [
  'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
  'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg',
];
const NIGHT_URLS = [
  'https://unpkg.com/three-globe/example/img/earth-night.jpg',
  'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg',
];

// rank 0 = continent, 1 = country, 2 = city
const PLACES: { n: string; lat: number; lon: number; r: number }[] = [
  { n: 'Asia', lat: 45, lon: 90, r: 0 }, { n: 'Europe', lat: 52, lon: 15, r: 0 }, { n: 'Africa', lat: 5, lon: 20, r: 0 },
  { n: 'North America', lat: 45, lon: -100, r: 0 }, { n: 'South America', lat: -15, lon: -60, r: 0 }, { n: 'Oceania', lat: -25, lon: 135, r: 0 },
  { n: 'Antarctica', lat: -80, lon: 0, r: 0 },
  { n: 'India', lat: 22, lon: 79, r: 1 }, { n: 'China', lat: 35, lon: 103, r: 1 }, { n: 'United States', lat: 39, lon: -98, r: 1 },
  { n: 'Brazil', lat: -10, lon: -52, r: 1 }, { n: 'Russia', lat: 60, lon: 95, r: 1 }, { n: 'Australia', lat: -25, lon: 134, r: 1 },
  { n: 'Canada', lat: 58, lon: -105, r: 1 }, { n: 'Indonesia', lat: -2, lon: 118, r: 1 }, { n: 'Saudi Arabia', lat: 24, lon: 45, r: 1 },
  { n: 'Egypt', lat: 27, lon: 30, r: 1 }, { n: 'Nigeria', lat: 9, lon: 8, r: 1 }, { n: 'South Africa', lat: -29, lon: 24, r: 1 },
  { n: 'France', lat: 46.5, lon: 2.5, r: 1 }, { n: 'Germany', lat: 51, lon: 10, r: 1 }, { n: 'United Kingdom', lat: 54, lon: -2, r: 1 },
  { n: 'Japan', lat: 36, lon: 138, r: 1 }, { n: 'Mexico', lat: 23, lon: -102, r: 1 }, { n: 'Argentina', lat: -38, lon: -64, r: 1 },
  { n: 'Pakistan', lat: 30, lon: 70, r: 1 }, { n: 'Turkey', lat: 39, lon: 35, r: 1 }, { n: 'Kazakhstan', lat: 48, lon: 67, r: 1 },
  { n: 'Delhi', lat: 28.61, lon: 77.21, r: 2 }, { n: 'Mumbai', lat: 19.08, lon: 72.88, r: 2 }, { n: 'Chandigarh', lat: 30.73, lon: 76.78, r: 2 },
  { n: 'London', lat: 51.51, lon: -0.13, r: 2 }, { n: 'Paris', lat: 48.86, lon: 2.35, r: 2 }, { n: 'New York', lat: 40.71, lon: -74.0, r: 2 },
  { n: 'Los Angeles', lat: 34.05, lon: -118.24, r: 2 }, { n: 'Tokyo', lat: 35.68, lon: 139.69, r: 2 }, { n: 'Beijing', lat: 39.9, lon: 116.4, r: 2 },
  { n: 'Dubai', lat: 25.2, lon: 55.27, r: 2 }, { n: 'Cairo', lat: 30.04, lon: 31.24, r: 2 }, { n: 'Lagos', lat: 6.52, lon: 3.38, r: 2 },
  { n: 'Sydney', lat: -33.87, lon: 151.21, r: 2 }, { n: 'São Paulo', lat: -23.55, lon: -46.63, r: 2 }, { n: 'Moscow', lat: 55.76, lon: 37.62, r: 2 },
  { n: 'Singapore', lat: 1.35, lon: 103.82, r: 2 }, { n: 'Cape Town', lat: -33.92, lon: 18.42, r: 2 }, { n: 'Mexico City', lat: 19.43, lon: -99.13, r: 2 },
  { n: 'Nairobi', lat: -1.29, lon: 36.82, r: 2 }, { n: 'Toronto', lat: 43.65, lon: -79.38, r: 2 }, { n: 'Jakarta', lat: -6.2, lon: 106.85, r: 2 },
];

const D2R = Math.PI / 180;
// Matches THREE.SphereGeometry UV layout (equirectangular texture, lon -180 at u=0)
const toVec = (lat: number, lon: number, r = 1) =>
  new THREE.Vector3(r * Math.cos(lat * D2R) * Math.cos(lon * D2R), r * Math.sin(lat * D2R), -r * Math.cos(lat * D2R) * Math.sin(lon * D2R));
const toLatLon = (v: THREE.Vector3) => {
  const n = v.clone().normalize();
  return { lat: Math.asin(n.y) / D2R, lon: Math.atan2(-n.z, n.x) / D2R };
};

function sunDirection(): THREE.Vector3 {
  const now = new Date();
  const dayOfYear = (Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - Date.UTC(now.getUTCFullYear(), 0, 0)) / 86400000;
  const decl = 23.44 * Math.sin((2 * Math.PI * (dayOfYear - 81)) / 365);
  const hours = now.getUTCHours() + now.getUTCMinutes() / 60;
  return toVec(decl, -(hours - 12) * 15).normalize();
}

function loadTexture(urls: string[], onOk: (t: THREE.Texture) => void, onFail: () => void, i = 0) {
  if (i >= urls.length) return onFail();
  new THREE.TextureLoader().setCrossOrigin('anonymous').load(urls[i], onOk, undefined, () => loadTexture(urls, onOk, onFail, i + 1));
}

const HOME = { lat: 22, lon: 78, dist: 3.2 };

export const GlobeView: React.FC = () => {
  const { settings } = useSettings();
  const mountRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const coordRef = useRef<HTMLSpanElement>(null);
  const altRef = useRef<HTMLSpanElement>(null);
  const flyRef = useRef<((lat: number, lon: number, dist?: number) => void) | null>(null);
  const markRef = useRef<((lat: number, lon: number) => void) | null>(null);
  const liveRef = useRef({ rotate: settings.globeRotate, labels: settings.globeLabels, night: settings.globeNight });
  const uniformsRef = useRef<any>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const [status, setStatus] = useState<'loading' | 'ready' | 'nowebgl'>('loading');
  const [texError, setTexError] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoResult[]>([]);
  const [info, setInfo] = useState<{ lat: number; lon: number; title?: string; w?: any; err?: string; busy?: boolean } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const pick = (lat: number, lon: number, title?: string) => {
    markRef.current?.(lat, lon);
    setInfo({ lat, lon, title, busy: true });
    getJson(`/api/weather?lat=${lat.toFixed(2)}&lon=${lon.toFixed(2)}`)
      .then((d) => setInfo({ lat, lon, title, w: d.weather }))
      .catch((e) => setInfo({ lat, lon, title, err: e.message }));
  };
  const pickRef = useRef(pick);
  pickRef.current = pick;

  useEffect(() => {
    liveRef.current = { rotate: settings.globeRotate, labels: settings.globeLabels, night: settings.globeNight };
    if (controlsRef.current) controlsRef.current.autoRotate = settings.globeRotate;
    if (uniformsRef.current) uniformsRef.current.uNight.value = settings.globeNight ? 1 : 0;
  }, [settings.globeRotate, settings.globeLabels, settings.globeNight]);

  useEffect(() => {
    const mount = mountRef.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    } catch {
      setStatus('nowebgl');
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x02040a);
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = 'none';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
    camera.position.copy(toVec(HOME.lat, HOME.lon, HOME.dist));

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 1.35;
    controls.maxDistance = 6;
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 0.7;
    controls.autoRotate = liveRef.current.rotate;
    controls.autoRotateSpeed = 0.35;
    controlsRef.current = controls;

    // Earth with day/night blend
    const uniforms: any = {
      dayMap: { value: null }, nightMap: { value: null }, uSun: { value: sunDirection() },
      uNight: { value: liveRef.current.night ? 1 : 0 }, uHasDay: { value: 0 }, uHasNight: { value: 0 },
    };
    uniformsRef.current = uniforms;
    const earthMat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: 'varying vec2 vUv; varying vec3 vN; void main(){ vUv=uv; vN=normalize(mat3(modelMatrix)*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} ',
      fragmentShader: `uniform sampler2D dayMap; uniform sampler2D nightMap; uniform vec3 uSun; uniform float uNight; uniform float uHasDay; uniform float uHasNight;
        varying vec2 vUv; varying vec3 vN;
        void main(){
          vec3 fallback = mix(vec3(0.03,0.09,0.2), vec3(0.1,0.25,0.4), vUv.y);
          vec3 day = uHasDay > 0.5 ? texture2D(dayMap, vUv).rgb : fallback;
          vec3 night = uHasNight > 0.5 ? texture2D(nightMap, vUv).rgb : day*0.15;
          float k = dot(normalize(vN), normalize(uSun));
          float lit = mix(1.0, smoothstep(-0.12, 0.18, k), uNight);
          vec3 dark = night*1.1 + day*0.04;
          gl_FragColor = vec4(mix(dark, day*(0.55+0.45*max(k,0.0)*uNight + 0.45*(1.0-uNight)), lit), 1.0);
        }`,
    });
    const earth = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 96), earthMat);
    scene.add(earth);
    const aniso = renderer.capabilities.getMaxAnisotropy();
    loadTexture(DAY_URLS, (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso; uniforms.dayMap.value = t; uniforms.uHasDay.value = 1; }, () => setTexError(true));
    loadTexture(NIGHT_URLS, (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso; uniforms.nightMap.value = t; uniforms.uHasNight.value = 1; }, () => { /* night side falls back to darkened day */ });

    // Atmosphere glow
    const atmo = new THREE.Mesh(
      new THREE.SphereGeometry(1.14, 64, 64),
      new THREE.ShaderMaterial({
        transparent: true, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
        vertexShader: 'varying vec3 vN; void main(){ vN=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} ',
        fragmentShader: 'varying vec3 vN; void main(){ float i=pow(0.62-dot(vN,vec3(0.,0.,1.)),3.0); gl_FragColor=vec4(0.3,0.62,1.0,1.0)*i*1.4;}',
      })
    );
    scene.add(atmo);

    // Stars
    const sp = new Float32Array(1800 * 3);
    for (let i = 0; i < 1800; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(60 + Math.random() * 20);
      sp.set([v.x, v.y, v.z], i * 3);
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    const stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 0.25, sizeAttenuation: true, transparent: true, opacity: 0.8 }));
    scene.add(stars);

    // Selected-location marker
    const marker = new THREE.Mesh(new THREE.SphereGeometry(0.014, 16, 16), new THREE.MeshBasicMaterial({ color: 0xff3b30 }));
    marker.visible = false;
    scene.add(marker);
    markRef.current = (lat, lon) => { marker.position.copy(toVec(lat, lon, 1.01)); marker.visible = true; };

    // Labels
    const labelEls = PLACES.map((p) => {
      const el = document.createElement('div');
      el.textContent = p.n;
      el.className = 'absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap pointer-events-none select-none text-white font-semibold';
      el.style.cssText += `font-size:${p.r === 0 ? 13 : p.r === 1 ? 11 : 10}px;text-shadow:0 1px 3px #000,0 0 6px #000;letter-spacing:${p.r === 0 ? '0.12em' : '0'};text-transform:${p.r === 0 ? 'uppercase' : 'none'};display:none;`;
      labelsRef.current?.appendChild(el);
      return { el, p, v: toVec(p.lat, p.lon, 1.005) };
    });

    // Fly-to animation
    let fly: { from: THREE.Vector3; to: THREE.Vector3; t: number } | null = null;
    flyRef.current = (lat, lon, dist) => {
      const d = dist ?? Math.min(Math.max(camera.position.length(), 1.9), 2.4);
      fly = { from: camera.position.clone(), to: toVec(lat, lon, d), t: 0 };
    };

    // Picking
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const hit = (cx: number, cy: number) => {
      const r = renderer.domElement.getBoundingClientRect();
      ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const h = ray.intersectObject(earth)[0];
      return h ? toLatLon(h.point) : null;
    };
    let down = { x: 0, y: 0 };
    const onDown = (e: PointerEvent) => { down = { x: e.clientX, y: e.clientY }; };
    const onUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) return;
      const ll = hit(e.clientX, e.clientY);
      if (ll) pickRef.current(ll.lat, ll.lon);
    };
    const onMove = (e: PointerEvent) => {
      const ll = hit(e.clientX, e.clientY);
      if (coordRef.current) coordRef.current.textContent = ll ? `${Math.abs(ll.lat).toFixed(2)}°${ll.lat >= 0 ? 'N' : 'S'}  ${Math.abs(ll.lon).toFixed(2)}°${ll.lon >= 0 ? 'E' : 'W'}` : '—';
    };
    renderer.domElement.addEventListener('pointerdown', onDown);
    renderer.domElement.addEventListener('pointerup', onUp);
    renderer.domElement.addEventListener('pointermove', onMove);

    const resize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();

    let raf = 0, lastAlt = 0;
    const tmp = new THREE.Vector3();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (fly) {
        fly.t = Math.min(1, fly.t + 0.025);
        const k = 1 - Math.pow(1 - fly.t, 3);
        const mid = fly.from.clone().lerp(fly.to, k);
        if (mid.length() > 0.01) camera.position.copy(mid.normalize().multiplyScalar(fly.from.length() + (fly.to.length() - fly.from.length()) * k));
        if (fly.t >= 1) fly = null;
      }
      controls.update();
      uniforms.uSun.value = sunDirection();

      const dist = camera.position.length();
      const camDir = camera.position.clone().normalize();
      const maxRank = dist > 3.6 ? 0 : dist > 2.3 ? 1 : 2;
      const rect = renderer.domElement.getBoundingClientRect();
      for (const l of labelEls) {
        const visible = liveRef.current.labels && l.p.r <= maxRank && l.v.clone().normalize().dot(camDir) > 0.2;
        if (!visible) { l.el.style.display = 'none'; continue; }
        tmp.copy(l.v).project(camera);
        l.el.style.display = 'block';
        l.el.style.left = `${((tmp.x + 1) / 2) * rect.width}px`;
        l.el.style.top = `${((1 - tmp.y) / 2) * rect.height}px`;
      }
      if (now - lastAlt > 250 && altRef.current) {
        lastAlt = now;
        altRef.current.textContent = `Altitude ≈ ${Math.round((dist - 1) * 6371).toLocaleString()} km`;
      }
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(loop);
    setStatus('ready');

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onDown);
      renderer.domElement.removeEventListener('pointerup', onUp);
      renderer.domElement.removeEventListener('pointermove', onMove);
      controls.dispose();
      earth.geometry.dispose(); earthMat.dispose(); atmo.geometry.dispose(); sg.dispose();
      uniforms.dayMap.value?.dispose(); uniforms.nightMap.value?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      labelEls.forEach((l) => l.el.remove());
      flyRef.current = null; markRef.current = null; controlsRef.current = null; uniformsRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      getJson<{ results: GeoResult[] }>(`/api/geocode?q=${encodeURIComponent(query.trim())}`).then((d) => setResults(d.results)).catch(() => setResults([]));
    }, 350);
    return () => clearTimeout(timer.current);
  }, [query]);

  const go = (r: GeoResult) => {
    setQuery(''); setResults([]);
    flyRef.current?.(r.latitude, r.longitude, 2.0);
    pick(r.latitude, r.longitude, placeLabel(r));
  };
  const w = info?.w;

  return (
    <div className="space-y-3 pb-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">3D Earth</h1>
        <p className="text-xs text-slate-400">Drag to rotate, scroll or pinch to zoom, click anywhere for local weather.</p>
      </div>

      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-black h-[68vh] min-h-[420px]">
        <div ref={mountRef} className="absolute inset-0" />
        <div ref={labelsRef} className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true" />

        {status === 'loading' && <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-emerald-400" /></div>}
        {status === 'nowebgl' && (
          <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-sm text-slate-300">
            <div><AlertCircle className="w-6 h-6 text-amber-500 mx-auto mb-2" />Your browser or device does not support WebGL, so the 3D globe cannot be shown. Try the Live Climate Map instead.</div>
          </div>
        )}

        {/* Search + reset */}
        <div className="absolute top-3 left-3 right-3 sm:right-auto sm:w-80 z-10">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a city or country" aria-label="Search location on globe"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/60 backdrop-blur border border-white/20 text-xs text-white globe-input focus:outline-none focus:border-emerald-400" style={{ color: '#fff' }} />
            </div>
            <button onClick={() => { flyRef.current?.(HOME.lat, HOME.lon, HOME.dist); setInfo(null); }} title="Reset view" aria-label="Reset globe view"
              className="px-3 rounded-xl bg-black/60 backdrop-blur border border-white/20 hover:border-emerald-400" style={{ color: '#fff' }}><Home className="w-4 h-4" /></button>
          </div>
          {results.length > 0 && (
            <ul className="mt-1 rounded-xl bg-black/80 backdrop-blur border border-white/20 overflow-hidden">
              {results.map((r, i) => (
                <li key={i}><button onClick={() => go(r)} className="w-full text-left px-3.5 py-2 text-xs hover:bg-white/10" style={{ color: '#fff' }}>{placeLabel(r)}</button></li>
              ))}
            </ul>
          )}
        </div>

        {/* Info panel */}
        {info && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:w-72 z-10 rounded-2xl bg-black/75 backdrop-blur border border-white/20 p-3.5 text-xs" style={{ color: '#fff' }}>
            <div className="flex items-start justify-between gap-2">
              <div className="font-bold">{info.title || `${info.lat.toFixed(2)}°, ${info.lon.toFixed(2)}°`}</div>
              <button onClick={() => setInfo(null)} aria-label="Close"><X className="w-3.5 h-3.5" /></button>
            </div>
            {info.busy && <div className="mt-2 flex items-center gap-2 opacity-80"><Loader2 className="w-3.5 h-3.5 animate-spin" />Loading…</div>}
            {info.err && <div className="mt-2 text-red-300">{info.err}</div>}
            {w && (
              <div className="mt-1.5 space-y-0.5">
                <div className="text-lg font-extrabold">{toDisplayTemp(w.current.temperature, settings.tempUnit)}°{settings.tempUnit} <span className="text-xs font-medium opacity-80">{w.current.condition}</span></div>
                <div className="opacity-90">Feels {toDisplayTemp(w.current.feelsLike, settings.tempUnit)}° · Humidity {w.current.humidity}% · Wind {Math.round(w.current.windSpeed)} km/h</div>
                <div className="opacity-90">Today {toDisplayTemp(w.daily[0].tempMin, settings.tempUnit)}° / {toDisplayTemp(w.daily[0].tempMax, settings.tempUnit)}° · UV {w.daily[0].uvIndexMax ?? '—'}</div>
                {w.airQuality?.usAqi != null && <div className="opacity-90">US AQI {w.airQuality.usAqi}</div>}
              </div>
            )}
          </div>
        )}

        {/* Readouts */}
        <div className="absolute bottom-3 right-3 z-10 rounded-xl bg-black/60 backdrop-blur border border-white/20 px-3 py-2 text-[11px] font-mono text-right" style={{ color: '#fff' }}>
          <div><span ref={coordRef}>—</span></div>
          <div className="opacity-80"><span ref={altRef}>Altitude ≈ —</span></div>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 flex items-start gap-1.5">
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        Imagery: NASA Blue Marble and Earth-at-night composites (static images loaded from a public CDN, not live satellite feeds). Day/night shading follows the current UTC time. {texError && <strong className="text-amber-500">The imagery could not be loaded (check your internet connection), so a plain blue globe is shown.</strong>}
      </p>
    </div>
  );
};
