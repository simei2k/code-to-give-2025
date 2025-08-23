"use client";

import { useEffect, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";

const TARGETS = ["sham shui po", "kwai tsing", "kwun tong"] as const;

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

export default function HKMapbox({ geojsonUrl = "/hk-districts.geojson" }: { geojsonUrl?: string }) {
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
        interactive: false
      });
      mapRef.current = map;

      map.on("load", async () => {
        try {
          const res = await fetch(geojsonUrl, { cache: "no-store" });
          if (!res.ok) throw new Error(`HTTP ${res.status} for ${geojsonUrl}`);
          const geo = await res.json();

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

          // Cursor + feature-state hover handling on the BASE FILL layer
          map.on("mousemove", "hk-fill", (e: any) => {
            map.getCanvas().style.cursor = "pointer";

            const f = e.features?.[0];
            if (!f) return;

            const id = typeof f.id !== "undefined" ? f.id : null;
            if (id == null) return; // need feature ids for feature-state

            // clear previous hover
            if (hoveredIdRef.current != null) {
              map.setFeatureState({ source: "hk", id: hoveredIdRef.current }, { hover: false });
            }
            // set new hover
            hoveredIdRef.current = id;
            map.setFeatureState({ source: "hk", id }, { hover: true });
          });

          map.on("mouseleave", "hk-fill", () => {
            map.getCanvas().style.cursor = "";
            if (hoveredIdRef.current != null) {
              map.setFeatureState({ source: "hk", id: hoveredIdRef.current }, { hover: false });
              hoveredIdRef.current = null;
            }
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
  }, [geojsonUrl]);

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
