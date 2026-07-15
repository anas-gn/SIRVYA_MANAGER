"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Navigation, Loader2, LocateFixed } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Carte principale avec un pin pour chaque advisor géolocalisé.
// Utilise Leaflet + tuiles OpenStreetMap (gratuit, aucune clé API)
// et Nominatim pour géocoder les adresses texte -> lat/lng.
//
// Prérequis (à installer dans le projet) :
//   npm install leaflet
//
// Ce composant doit être chargé en dynamique avec ssr:false, ex :
//   const AdvisorsLocationMap = dynamic(
//     () => import("@/components/AdvisorsLocationMap"),
//     { ssr: false }
//   );
// ─────────────────────────────────────────────────────────────

const GEOCODE_CACHE_KEY = "advisor-geocode-cache-v1";

function loadCache() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(GEOCODE_CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveCache(cache) {
  try {
    localStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // quota exceeded or unavailable - ignore
  }
}

async function geocode(query, signal) {
  const cache = loadCache();
  if (cache[query]) return cache[query];

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
    query
  )}`;

  const res = await fetch(url, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data?.length) return null;

  const result = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  cache[query] = result;
  saveCache(cache);
  return result;
}

function initials(a) {
  return `${a.firstName?.[0] || ""}${a.lastName?.[0] || ""}`.toUpperCase();
}

function pinDivIcon(L, { label, tone = "advisor" }) {
  const bg =
    tone === "city"
      ? "linear-gradient(135deg,#D1F96B,#9fd63a)"
      : "linear-gradient(135deg,#7a1e3a,#c98b9a)";
  const border = tone === "city" ? "#D1F96B" : "#f5e6d3";
  const size = tone === "city" ? 18 : 34;

  const html =
    tone === "city"
      ? `<div style="
          width:${size}px;height:${size}px;border-radius:50%;
          background:${bg};border:3px solid #1a0a0a;
          box-shadow:0 0 0 4px rgba(209,249,107,0.25),0 4px 10px rgba(0,0,0,0.4);
        "></div>`
      : `<div style="
          position:relative;width:${size}px;height:${size}px;
          display:flex;align-items:center;justify-content:center;
          border-radius:50% 50% 50% 0;transform:rotate(-45deg);
          background:${bg};border:2px solid ${border};
          box-shadow:0 4px 10px rgba(0,0,0,0.45);
        ">
          <span style="
            transform:rotate(45deg);color:#fff;font-size:11px;font-weight:700;
            font-family:sans-serif;letter-spacing:0.02em;
          ">${label}</span>
        </div>`;

  return L.divIcon({
    html,
    className: "advisor-pin-icon",
    iconSize: [size, size],
    iconAnchor: tone === "city" ? [size / 2, size / 2] : [size / 2, size],
    popupAnchor: [0, tone === "city" ? -size / 2 : -size],
  });
}

export default function AdvisorsLocationMap({ ville, advisors }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);
  const leafletRef = useRef(null);

  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [geocoded, setGeocoded] = useState([]);

  const advisorsWithLocation = advisors.filter(
    (a) => a.location && a.location.trim().length > 0
  );

  // Init map once
  useEffect(() => {
    let cancelled = false;

    async function init() {
      const L = (await import("leaflet")).default;
      leafletRef.current = L;
      if (cancelled || !mapContainerRef.current || mapRef.current) return;

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: true,
      }).setView([33.5731, -7.5898], 12); // fallback: Casablanca

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;

      // Center on the city itself first
      const cityPoint = await geocode(ville);
      if (cancelled) return;
      if (cityPoint) {
        map.setView([cityPoint.lat, cityPoint.lng], 12);
        L.marker([cityPoint.lat, cityPoint.lng], {
          icon: pinDivIcon(L, { tone: "city" }),
          zIndexOffset: -100,
        })
          .addTo(markersLayerRef.current)
          .bindPopup(
            `<div style="font-family:sans-serif;font-size:12px;font-weight:600;">${ville}</div>`
          );
      }

      geocodeAdvisors(L, map);
    }

    async function geocodeAdvisors(L, map) {
      if (advisorsWithLocation.length === 0) {
        setStatus("ready");
        return;
      }
      setProgress({ done: 0, total: advisorsWithLocation.length });

      const bounds = [];
      const results = [];

      for (let i = 0; i < advisorsWithLocation.length; i++) {
        if (cancelled) return;
        const advisor = advisorsWithLocation[i];
        try {
          const point = await geocode(advisor.location);
          if (point && !cancelled) {
            results.push({ ...advisor, ...point });
            bounds.push([point.lat, point.lng]);

            L.marker([point.lat, point.lng], {
              icon: pinDivIcon(L, { label: initials(advisor) }),
            })
              .addTo(markersLayerRef.current)
              .bindPopup(
                `<div style="font-family:sans-serif;min-width:160px;">
                   <div style="font-weight:700;font-size:13px;margin-bottom:2px;">${advisor.firstName} ${advisor.lastName}</div>
                   <div style="font-size:11px;color:#666;margin-bottom:4px;">${advisor.companyName || advisor.specialty || ""}</div>
                   <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                     advisor.location
                   )}" target="_blank" rel="noopener noreferrer"
                      style="font-size:11px;color:#7a1e3a;font-weight:600;text-decoration:none;">
                     Itinéraire →
                   </a>
                 </div>`
              );
          }
        } catch {
          // skip failed geocode, continue
        }
        setProgress({ done: i + 1, total: advisorsWithLocation.length });
        // Respect Nominatim's ~1 req/sec usage policy
        await new Promise((r) => setTimeout(r, 1050));
      }

      if (!cancelled && bounds.length > 0) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
      if (!cancelled) {
        setGeocoded(results);
        setStatus("ready");
      }
    }

    init().catch(() => !cancelled && setStatus("error"));

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ville]);

  const recenter = useCallback(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;
    const bounds = geocoded.map((g) => [g.lat, g.lng]);
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [geocoded]);

  return (
    <div className="relative w-full h-[460px] rounded-xl overflow-hidden border border-[#3d1a1a]">
      <div ref={mapContainerRef} className="w-full h-full" />

      {status === "loading" && (
        <div className="absolute top-4 left-4 z-[500] flex items-center gap-2 rounded-lg bg-[#2d1212]/90 backdrop-blur-sm border border-[#3d1a1a] px-3 py-2 text-xs font-medium text-[#c98b9a] shadow-lg">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Localisation des advisors… {progress.done}/{progress.total}
        </div>
      )}

      {status === "ready" && geocoded.length > 0 && (
        <button
          onClick={recenter}
          className="absolute top-4 left-4 z-[500] inline-flex items-center gap-2 rounded-lg bg-[#2d1212]/90 backdrop-blur-sm border border-[#3d1a1a] px-3 py-2 text-xs font-medium text-[#c98b9a] shadow-lg hover:bg-[#7a1e3a]/20 transition-colors"
        >
          <LocateFixed className="h-3.5 w-3.5" />
          {geocoded.length} advisor{geocoded.length > 1 ? "s" : ""} localisé
          {geocoded.length > 1 ? "s" : ""}
        </button>
      )}

      <div className="absolute bottom-4 right-4 z-[500]">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            ville
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-[#2d1212]/90 backdrop-blur-sm border border-[#3d1a1a] px-4 py-2 text-sm font-medium text-[#c98b9a] hover:bg-[#7a1e3a]/20 transition-colors shadow-lg"
        >
          <Navigation className="h-4 w-4" />
          Ouvrir {ville} dans Maps
        </a>
      </div>

      {/*
        CSS structurel essentiel de Leaflet, embarqué ici directement.
        Next.js App Router interdit d'importer un CSS global (leaflet/dist/leaflet.css)
        depuis un composant qui n'est pas app/layout.js — sans ce CSS, les tuiles et
        les marqueurs ne se positionnent plus correctement et apparaissent cassés.
        Si tu préfères, tu peux à la place ajouter
        `import "leaflet/dist/leaflet.css";` en haut de app/layout.js et supprimer
        ce bloc structurel (garder uniquement le style custom en bas).
      */}
      <style jsx global>{`
        .leaflet-pane,
        .leaflet-tile,
        .leaflet-marker-icon,
        .leaflet-marker-shadow,
        .leaflet-tile-container,
        .leaflet-pane > svg,
        .leaflet-pane > canvas,
        .leaflet-zoom-box,
        .leaflet-image-layer,
        .leaflet-layer {
          position: absolute;
          left: 0;
          top: 0;
        }
        .leaflet-container {
          overflow: hidden;
          background: #1a0a0a;
          font-family: inherit;
        }
        .leaflet-tile,
        .leaflet-marker-icon,
        .leaflet-marker-shadow {
          -webkit-user-select: none;
          user-select: none;
          -webkit-user-drag: none;
        }
        .leaflet-tile::selection { background: transparent; }
        .leaflet-safari .leaflet-tile { image-rendering: -webkit-optimize-contrast; }
        .leaflet-marker-icon,
        .leaflet-marker-shadow { display: block; }
        .leaflet-container .leaflet-overlay-pane svg,
        .leaflet-container .leaflet-marker-pane img,
        .leaflet-container .leaflet-shadow-pane img,
        .leaflet-container .leaflet-tile-pane img,
        .leaflet-container img.leaflet-image-layer,
        .leaflet-container .leaflet-tile {
          max-width: none !important;
          max-height: none !important;
        }
        .leaflet-container.leaflet-touch-zoom { touch-action: pan-x pan-y; }
        .leaflet-container.leaflet-touch-drag { touch-action: none; touch-action: pinch-zoom; }
        .leaflet-tile { filter: inherit; visibility: hidden; }
        .leaflet-tile-loaded { visibility: inherit; }
        .leaflet-zoom-box {
          width: 0;
          height: 0;
          box-sizing: border-box;
          z-index: 800;
        }
        .leaflet-overlay-pane svg { -moz-user-select: none; }
        .leaflet-pane { z-index: 400; }
        .leaflet-tile-pane { z-index: 200; }
        .leaflet-overlay-pane { z-index: 400; }
        .leaflet-shadow-pane { z-index: 500; }
        .leaflet-marker-pane { z-index: 600; }
        .leaflet-tooltip-pane { z-index: 650; }
        .leaflet-popup-pane { z-index: 700; }
        .leaflet-map-pane canvas { z-index: 100; }
        .leaflet-map-pane svg { z-index: 200; }
        .leaflet-control { position: relative; z-index: 800; pointer-events: visiblePainted; pointer-events: auto; }
        .leaflet-top,
        .leaflet-bottom { position: absolute; z-index: 1000; pointer-events: none; }
        .leaflet-top { top: 0; }
        .leaflet-right { right: 0; }
        .leaflet-bottom { bottom: 0; }
        .leaflet-left { left: 0; }
        .leaflet-control { float: left; clear: both; }
        .leaflet-right .leaflet-control { float: right; }
        .leaflet-top .leaflet-control { margin-top: 10px; }
        .leaflet-bottom .leaflet-control { margin-bottom: 10px; }
        .leaflet-left .leaflet-control { margin-left: 10px; }
        .leaflet-right .leaflet-control { margin-right: 10px; }
        .leaflet-fade-anim .leaflet-popup { opacity: 0; transition: opacity 0.2s linear; }
        .leaflet-fade-anim .leaflet-map-pane .leaflet-popup { opacity: 1; }
        .leaflet-zoom-animated { transform-origin: 0 0; }
        .leaflet-zoom-anim .leaflet-zoom-animated { transition: transform 0.25s cubic-bezier(0,0,0.25,1); }
        .leaflet-interactive { cursor: pointer; }
        .leaflet-grab { cursor: grab; }
        .leaflet-dragging .leaflet-grab,
        .leaflet-dragging .leaflet-interactive { cursor: grabbing !important; }
        .leaflet-control-zoom {
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #3d1a1a !important;
        }
        .leaflet-control-zoom a {
          background: #2d1212 !important;
          color: #f5e6d3 !important;
          border-bottom: 1px solid #3d1a1a !important;
          width: 30px;
          height: 30px;
          line-height: 30px;
          text-align: center;
          text-decoration: none;
          font-size: 16px;
        }
        .leaflet-control-zoom a:hover { background: #7a1e3a !important; }
        .leaflet-control-attribution {
          background: rgba(26, 10, 10, 0.75) !important;
          color: #a08080 !important;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 6px 0 0 0;
        }
        .leaflet-control-attribution a { color: #c98b9a !important; }
        .leaflet-popup {
          position: absolute;
          text-align: center;
          margin-bottom: 20px;
        }
        .leaflet-popup-content-wrapper {
          background: #2d1212;
          color: #f5e6d3;
          border-radius: 10px;
          border: 1px solid #3d1a1a;
          box-shadow: 0 6px 20px rgba(0,0,0,0.5);
        }
        .leaflet-popup-content {
          margin: 12px 14px;
          line-height: 1.4;
        }
        .leaflet-popup-content a {
          color: #c98b9a !important;
        }
        .leaflet-popup-tip-container {
          width: 40px;
          height: 20px;
          position: absolute;
          left: 50%;
          margin-left: -20px;
          overflow: hidden;
          pointer-events: none;
        }
        .leaflet-popup-tip {
          background: #2d1212;
          width: 12px;
          height: 12px;
          margin: -10px auto 0;
          transform: rotate(45deg);
          border: 1px solid #3d1a1a;
        }
        .leaflet-popup-close-button {
          color: #a08080 !important;
        }
        .advisor-pin-icon {
          background: transparent;
          border: none;
        }
      `}</style>
    </div>
  );
}