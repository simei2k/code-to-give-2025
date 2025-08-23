"use client";

import { useEffect, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";

const TARGETS = ["sham shui po", "kwai tsing", "kwun tong"] as const;

type DistrictInfo = {
  howMuchDonated?: number;
  schools?: string[];
};

function nameExpr() {
  return ["downcase", ["coalesce", ["get", "name"], ["get", "DISTRICT"], ["get", "District"], ["get", "dc_name_e"]]];
}

function bboxOfGeoJSON(geo: any) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  function expand(coords: any) {
    if (typeof coords[0] === "number") {
      const [x, y] = coords;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    } else {
      for (const c of coords) expand(c);
    }
  }
  if (geo.type === "FeatureCollection") {
    for (const f of geo.features) expand(f.geometry.coordinates);
  } else if (geo.type === "Feature") {
    expand(geo.geometry.coordinates);
  } else {
    expand(geo.coordinates);
  }
  return [[minX, minY], [maxX, maxY]] as [[number, number], [number, number]];
}

const SECTION_IDS: Record<string, string> = {
  "sham shui po": "sham-shui-po",
  "kwun tong": "kwun-tong",
  "kwai tsing": "kwai-tsing"
};

function popupHTML(p: any, info?: { howMuchDonated?: number; schools?: string[] }) {
  const name =
    (p.name || p.DISTRICT || p.District || p.dc_name_e || "").toString();
  const donated = info?.howMuchDonated ?? null;
  const schools = Array.isArray(info?.schools) ? info!.schools : [];

  const money =
    typeof donated === "number"
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(donated)
      : null;

  const maxShow = 4;
  const more = Math.max(0, schools.length - maxShow);
  const list = schools.slice(0, maxShow);

  return `
  <div class="hk-pop">
    <div class="hk-pop__head">
      <div class="hk-pop__title">${name}</div>
      ${
        money
          ? `<div class="hk-pop__badge" title="Total donated">${money}</div>`
          : ``
      }
    </div>

    ${
      list.length
        ? `
      <div class="hk-pop__section">
        <div class="hk-pop__label">Supported schools</div>
        <ul class="hk-pop__list">
          ${list.map((s) => `<li>•${s}</li>`).join("")}
          ${
            more
              ? `<li class="hk-pop__more">+${more} more</li>`
              : ``
          }
        </ul>
      </div>`
        : ``
    }

    <div class="hk-pop__hint">Click district to jump to details ↓</div>
  </div>`;
}


export default function HKMapbox({ geojsonUrl = "/hk-districts.geojson", dataUrl="/districts.json" }: { geojsonUrl?: string, dataUrl?: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const hoveredIdRef = useRef<number | string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    (async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

      const map = new mapboxgl.Map({
        container: containerRef.current!,
        style: "mapbox://styles/mapbox/light-v11",
        center: [114.1694, 22.3193],
        zoom: 10.8,
      });

      map.scrollZoom.disable(); map.boxZoom.disable(); map.dragRotate.disable();
      map.dragPan.disable(); map.keyboard.disable(); map.doubleClickZoom.disable();
      map.touchZoomRotate.disable();

      mapRef.current = map;

      map.on("load", async () => {
        try {
          const res = await fetch(geojsonUrl, { cache: "no-store" });
          if (!res.ok) throw new Error(`HTTP ${res.status} for ${geojsonUrl}`);
          const geo = await res.json();

          const infoRes = await fetch(dataUrl, { cache: "no-store" });
          if (!infoRes.ok) throw new Error(`HTTP ${infoRes.status} for ${dataUrl}`);
          const rawInfo: Record<string, DistrictInfo> = await infoRes.json();

          // Normalize to a Map with lowercase keys
          const infoMap = new Map<string, DistrictInfo>();
          Object.entries(rawInfo || {}).forEach(([k, v]) => infoMap.set(k.toLowerCase(), v || {}));

          // Decide if we must auto-generate ids
          let useGenerateId = true;
          if (geo?.type === "FeatureCollection" && geo.features?.length) {
            // If features already have an 'id', don't use generateId
            useGenerateId = !geo.features.some((f: any) => f && typeof f.id !== "undefined");
          }

          map.addSource("hk", {
            type: "geojson",
            data: geo,
            ...(useGenerateId ? { generateId: true } : {}),
          } as any);

          const [sw, ne] = bboxOfGeoJSON(geo);
          if (Number.isFinite(sw[0]) && Number.isFinite(ne[0])) {
            map.fitBounds([sw, ne], { padding: 40, duration: 600 });
          }

          // Try to insert before water (acts like a mask)
          const layers = map.getStyle().layers || [];

          for (const l of layers) {
            const id = l.id;
            const srcLayer = (l as any)["source-layer"];
        
            // Hide linework for roads, bridges, tunnels
            if (srcLayer === "bridge" || srcLayer === "tunnel" || id.includes("road")) {
              try { map.setLayoutProperty(id, "visibility", "none"); } catch {}
            }
        
            // Hide road labels / shields
            if (id.includes("road-label") || id.includes("road-number-shield")) {
              try { map.setLayoutProperty(id, "visibility", "none"); } catch {}
            }
          }
          const waterId =
            layers.find(l => l.id === "water")?.id ||
            layers.find(l => (l as any)["source-layer"] === "water")?.id;

      
          // Base fill
          map.addLayer(
            {
              id: "hk-fill",
              type: "fill",
              source: "hk",
              paint: {
                "fill-color": ["case", ["in", nameExpr(), ["literal", TARGETS]], "#A9E34B", "#E5E7EB"],
                "fill-opacity": ["case", ["in", nameExpr(), ["literal", TARGETS]], 1, 0.6],
              },
            },
            waterId
          );

          // HOVER layer (sits ABOVE hk-fill but BELOW labels)
          // Uses feature-state to shade the hovered polygon.
          map.addLayer({
            id: "hk-hover",
            type: "fill",
            source: "hk",
            paint: {
              // darker green/gray overlay on hover (tweak as you like)
              "fill-color": [
                "case",
                ["in", nameExpr(), ["literal", TARGETS]],
                "#7CC243",       // hover color for target districts
                "#C8CDD3"        // hover color for non-target districts
              ],
              "fill-opacity": [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                0.9,             // only show when hovered
                0
              ],
            },
          },
          waterId);

          // Label layer for target districts
          map.addLayer({
            id: "hk-label",
            type: "symbol",
            source: "hk",
            filter: ["in", nameExpr(), ["literal", TARGETS]],
            layout: {
              "text-field": ["coalesce", ["get", "District"], "District"],
              "text-size": 12,
              "text-padding": 6,
              "text-allow-overlap": true,
              "text-justify": "center",
              "text-variable-anchor": ["center"],
            },
            paint: { "text-color": "#0f5132", "text-halo-color": "white", "text-halo-width": 1.2 },
          },
          waterId);

          const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 10,
            className: "hk-hover-popup",
            maxWidth: "280px"
          });

          // Cursor + feature-state hover handling on the BASE FILL layer
          // Reusable popup (no close button, follows mouse)
          map.on("mousemove", "hk-fill", (e: any) => {
            map.getCanvas().style.cursor = "pointer";
            const f = e.features?.[0];
            if (!f) return;

            // feature-state hover toggle
            const id = typeof f.id !== "undefined" ? f.id : null;
            if (id != null && hoveredIdRef.current !== id) {
              if (hoveredIdRef.current != null) {
                map.setFeatureState({ source: "hk", id: hoveredIdRef.current }, { hover: false });
              }
              hoveredIdRef.current = id;
              map.setFeatureState({ source: "hk", id }, { hover: true });
            }

            // popup content from infoMap
            const p = f.properties || {};
            const nmLc = (p.name || p.DISTRICT || p.District || p.dc_name_e || "").toLowerCase();
            if (!SECTION_IDS[nmLc]) {
              popup.remove();
              return;
            }
            const info = infoMap.get(nmLc);

            popup
              .setLngLat(e.lngLat)
              .setHTML(popupHTML(p, info))
              .addTo(map);
          });

          map.on("mouseleave", "hk-fill", () => {
            map.getCanvas().style.cursor = "";
            if (hoveredIdRef.current != null) {
              map.setFeatureState({ source: "hk", id: hoveredIdRef.current }, { hover: false });
              hoveredIdRef.current = null;
            }
            popup.remove();
          });

          // Click → scroll to the matching section (targets only)
          map.on("click", "hk-fill", (e: any) => {
            const f = e.features?.[0];
            if (!f) return;
            const p = f.properties || {};
            const nm = (p.name || p.DISTRICT || p.District || p.dc_name_e || "").toLowerCase();
            const anchorId = SECTION_IDS[nm];
            if (!anchorId) return; // ignore non-target districts

            // Smooth scroll to the section
            const el = document.getElementById(anchorId);
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "start" });
              // optionally set the hash (keeps the URL in sync)
              history.replaceState(null, "", `#${anchorId}`);
            }
          });
        } catch (err: any) {
          console.error("[HKMapbox] load error:", err);
          setLoadError(String(err?.message || err));
        }
      });
    })();

    return () => {
      try { mapRef.current?.remove(); } catch {}
      mapRef.current = null;
      hoveredIdRef.current = null;
    };
  }, [geojsonUrl, dataUrl]);

  return (
    <div className="mt-10">
      <div
        ref={containerRef}
        className="h-[420px] md:h-[520px] rounded overflow-hidden border border-[#e5e7eb]"
      />
      {loadError && (
        <p className="mt-2 text-sm text-red-600">
          Failed to load GeoJSON: {loadError}
        </p>
      )}
    </div>
  );
}
