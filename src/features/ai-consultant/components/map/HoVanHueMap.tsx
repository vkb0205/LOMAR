import { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl, { GeoJSONSource, Map as MapLibreMap, Marker, type StyleSpecification } from 'maplibre-gl';
import type { MapVendor } from '../../services/mapVendorService';
import './map.css';
import 'maplibre-gl/dist/maplibre-gl.css';

interface HoVanHueMapProps {
  vendors: MapVendor[];
  highlightedIds: string[];
  selectedId: string | null;
  activeFilters: string[];
  onSelectVendor: (id: string | null) => void;
}

const OPENFREEMAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';
const HCMC_CENTER: [number, number] = [106.6763, 10.8008];

function routeGeoJson(vendors: MapVendor[], highlightedIds: string[]): GeoJSON.Feature<GeoJSON.LineString> {
  const orderedVendors = highlightedIds
    .map(id => vendors.find(vendor => vendor.id === id))
    .filter((vendor): vendor is MapVendor => Boolean(vendor));
  const vendorCoordinates = orderedVendors.map(vendor => [vendor.lng, vendor.lat] as [number, number]);

  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates:
        vendorCoordinates.length > 1
          ? vendorCoordinates
          : vendorCoordinates.length === 1
            ? [vendorCoordinates[0], vendorCoordinates[0]]
            : [HCMC_CENTER, HCMC_CENTER],
    },
    properties: {},
  };
}

const CATEGORY_ICON_SVGS = {
  camera: '<svg class="hvh-category-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 4h-5L8 2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-2.5z"/><circle cx="12" cy="12" r="3"/></svg>',
  aperture: '<svg class="hvh-category-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m14.31 8 5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16 3.95 6.06M14.31 16H2.83M16.62 12l-5.74 9.94"/></svg>',
  dress: '<svg class="hvh-category-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m8 2 4 3 4-3 2 4-2 3 3 11H5L8 9 6 6z"/><path d="M8 9h8"/></svg>',
  makeup: '<svg class="hvh-category-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3-1.9 5.1L5 10l5.1 1.9L12 17l1.9-5.1L19 10l-5.1-1.9z"/><path d="m19 16-.9 2.1L16 19l2.1.9L19 22l.9-2.1L22 19l-2.1-.9zM5 3l-.7 1.3L3 5l1.3.7L5 7l.7-1.3L7 5l-1.3-.7z"/></svg>',
  fallback: '<svg class="hvh-category-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>',
} as const;

function categoryAppearance(category: string) {
  const normalizedCategory = category.toLocaleLowerCase('vi-VN');
  const icon = normalizedCategory.includes('chụp')
    ? CATEGORY_ICON_SVGS.camera
    : normalizedCategory.includes('váy')
      ? CATEGORY_ICON_SVGS.dress
      : normalizedCategory.includes('trang điểm')
        ? CATEGORY_ICON_SVGS.makeup
        : normalizedCategory.includes('studio')
          ? CATEGORY_ICON_SVGS.aperture
          : CATEGORY_ICON_SVGS.fallback;
  const hue = Array.from(category).reduce((value, character) => value + character.charCodeAt(0), 0) % 360;
  return {
    icon,
    color: `hsl(${hue} 42% 42%)`,
    bg: `hsl(${hue} 58% 94%)`,
  };
}

function createVendorMarker(vendor: MapVendor, highlighted: boolean, selected: boolean, rank: number | null): HTMLDivElement {
  const appearance = categoryAppearance(vendor.category);
  const element = document.createElement('div');
  element.className = `hvh-vendor-marker${highlighted ? ' hvh-vendor-marker--highlighted' : ''}${selected ? ' hvh-vendor-marker--selected' : ''}`;
  element.style.setProperty('--vendor-color', appearance.color);
  element.style.setProperty('--vendor-bg', appearance.bg);
  element.setAttribute('aria-label', `${vendor.name} ${vendor.category}`);
  element.innerHTML = `
    <span class="hvh-vendor-marker__pulse"></span>
    <span class="hvh-vendor-marker__icon">${appearance.icon}</span>
    ${rank ? `<span class="hvh-vendor-marker__rank">${rank}</span>` : ''}
  `;
  return element;
}

export function HoVanHueMap({ vendors, highlightedIds, selectedId, activeFilters, onSelectVendor }: HoVanHueMapProps) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const filteredVendors = useMemo(
    () => vendors.filter(vendor => activeFilters.length === 0 || activeFilters.includes(vendor.category)),
    [activeFilters, vendors],
  );

  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) return;

    setMapError(null);

    const map = new maplibregl.Map({
      container: mapElementRef.current,
      style: OPENFREEMAP_STYLE,
      center: HCMC_CENTER,
      zoom: 17,
      minZoom: 15,
      maxZoom: 20,
      attributionControl: { compact: false },
      dragRotate: false,
      pitchWithRotate: false,
      maxPitch: 0,
    });

    mapRef.current = map;

    const handleLoad = () => {
      const theme = {
        background: '#fffdfa',
        land: '#fffdfa',
        residential: '#f4f1e8',
        park: '#fbe9ee',
        water: '#dceaf0',
        waterLine: '#c6dce4',
        building: '#ece8dd',
        buildingOutline: '#ddd7c8',
        road: '#ffffff',
        roadCasing: '#e3ded1',
        roadMuted: '#f7f4ec',
        path: '#e0dbc9',
      } as const;

      const setPaint = (layerId: string, property: string, value: unknown) => {
        try {
          map.setPaintProperty(layerId, property, value as never);
        } catch {
          // Some OpenFreeMap style layers may not expose the requested paint
          // property. Leave those layers unchanged rather than breaking the map.
        }
      };

      map.getStyle().layers.forEach(layer => {
        if (layer.type === 'symbol') {
          map.setLayoutProperty(layer.id, 'visibility', 'none');
          return;
        }

        const id = layer.id.toLowerCase();
        const sourceLayer = String(
          (layer as { 'source-layer'?: string })['source-layer'] ?? '',
        ).toLowerCase();

        if (layer.type === 'background') {
          setPaint(layer.id, 'background-color', theme.background);
          return;
        }

        if (sourceLayer === 'landcover' || sourceLayer === 'land') {
          if (layer.type === 'fill' || layer.type === 'fill-extrusion') {
            setPaint(layer.id, 'fill-color', theme.land);
            setPaint(layer.id, 'fill-opacity', 0.9);
          }
          return;
        }

        if (sourceLayer === 'landuse' || id.includes('residential')) {
          if (layer.type === 'fill') {
            setPaint(layer.id, 'fill-color', theme.residential);
            setPaint(layer.id, 'fill-opacity', 0.65);
          }
          return;
        }

        if (sourceLayer === 'park' || id.includes('park') || id.includes('green')) {
          if (layer.type === 'fill') {
            setPaint(layer.id, 'fill-color', theme.park);
            setPaint(layer.id, 'fill-opacity', 0.75);
          }
          return;
        }

        if (sourceLayer === 'water' || sourceLayer === 'waterway' || id.includes('water')) {
          if (layer.type === 'fill') {
            setPaint(layer.id, 'fill-color', theme.water);
            setPaint(layer.id, 'fill-opacity', 0.9);
          } else if (layer.type === 'line') {
            setPaint(layer.id, 'line-color', theme.waterLine);
            setPaint(layer.id, 'line-opacity', 0.85);
          }
          return;
        }

        if (sourceLayer === 'building' || id.includes('building')) {
          if (layer.type === 'fill' || layer.type === 'fill-extrusion') {
            setPaint(layer.id, 'fill-color', theme.building);
            setPaint(layer.id, 'fill-outline-color', theme.buildingOutline);
            setPaint(layer.id, 'fill-opacity', 0.9);
          }
          return;
        }

        if (sourceLayer === 'transportation' || sourceLayer === 'transportation_name' || id.includes('road') || id.includes('transportation')) {
          if (layer.type === 'line') {
            const isCasing = id.includes('casing') || id.includes('outline') || id.includes('case');
            const isPath = id.includes('path') || id.includes('foot') || id.includes('cycle');

            setPaint(layer.id, 'line-color', isPath
              ? theme.path
              : isCasing
                ? theme.roadCasing
                : theme.roadMuted);
            setPaint(layer.id, 'line-opacity', isPath ? 0.7 : 0.9);
          }
        }
      });

      map.addSource('recommended-route', { type: 'geojson', data: routeGeoJson([], []) });
      map.addLayer({
        id: 'recommended-route-casing',
        type: 'line',
        source: 'recommended-route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#FFFFFF', 'line-width': 7, 'line-opacity': 0.85 },
      });
      map.addLayer({
        id: 'recommended-route-line',
        type: 'line',
        source: 'recommended-route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#a4506b', 'line-width': 3, 'line-opacity': 0.9, 'line-dasharray': [2, 2] },
      });

      mapRef.current = map;
      setMapReady(true);
      window.setTimeout(() => map.resize(), 100);
    };

    const handleError = (event: maplibregl.ErrorEvent) => {
      if (event.error?.message) {
        setMapError(`Không thể tải bản đồ: ${event.error.message}`);
      }
    };

    map.on('load', handleLoad);
    map.on('error', handleError);

    return () => {
      map.off('load', handleLoad);
      map.off('error', handleError);
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map) return;

    const source = map.getSource('recommended-route') as GeoJSONSource | undefined;
    source?.setData(routeGeoJson(vendors, highlightedIds));

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    const bounds = new maplibregl.LngLatBounds();

    filteredVendors.forEach(vendor => {
      const highlighted = highlightedIds.includes(vendor.id);
      const selected = selectedId === vendor.id;
      const rank = highlighted ? highlightedIds.indexOf(vendor.id) + 1 : null;
      const marker = new Marker({ element: createVendorMarker(vendor, highlighted, selected, rank), anchor: 'bottom' })
        .setLngLat([vendor.lng, vendor.lat])
        .addTo(map);

      marker.getElement().addEventListener('click', () => onSelectVendor(vendor.id));
      markersRef.current.push(marker);
      bounds.extend([vendor.lng, vendor.lat]);
    });

    highlightedIds
      .map(id => vendors.find(vendor => vendor.id === id))
      .filter((vendor): vendor is MapVendor => Boolean(vendor))
      .forEach(vendor => bounds.extend([vendor.lng, vendor.lat]));

    const selectedVendor = selectedId ? vendors.find(vendor => vendor.id === selectedId) : null;
    if (selectedVendor) {
      map.easeTo({
        center: [selectedVendor.lng, selectedVendor.lat],
        zoom: Math.max(map.getZoom(), 17.5),
        duration: 350,
      });
    } else if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 58, maxZoom: highlightedIds.length > 0 ? 17.5 : 16.7 });
    }
  }, [filteredVendors, highlightedIds, mapReady, onSelectVendor, selectedId, vendors]);

  const locateMe = () => {
    if (!navigator.geolocation || !mapRef.current) return;

    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        const map = mapRef.current;
        if (!map) return;

        map.easeTo({
          center: [longitude, latitude],
          zoom: 18,
          duration: 500,
        });

        userMarkerRef.current?.remove();

        const element = document.createElement('div');
        element.className = 'hvh-user-marker-wrapper';
        element.innerHTML = '<div class="hvh-user-marker"><span></span></div>';

        userMarkerRef.current = new maplibregl.Marker({
          element,
          anchor: 'center',
        })
          .setLngLat([longitude, latitude])
          .addTo(map);
      },
      () => setMapError('Không thể lấy vị trí hiện tại. Hãy kiểm tra quyền truy cập vị trí của trình duyệt.'),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 },
    );
  };

  return (
    <section className="relative h-full min-h-[520px] overflow-hidden rounded-xl border border-hairline bg-canvas shadow-subtle">
      <div ref={mapElementRef} className="h-full min-h-[520px] w-full" />

      {!mapReady && !mapError && (
        <div className="absolute inset-0 z-[1000] grid place-items-center bg-canvas/90 backdrop-blur-sm">
          <div className="rounded-lg border border-hairline bg-canvas px-5 py-3 text-sm text-ink shadow-subtle">
            Đang tải bản đồ…
          </div>
        </div>
      )}

      {mapError && (
        <div className="absolute left-4 right-4 top-4 z-[1000] rounded-lg border border-rose/30 bg-canvas px-4 py-3 text-sm text-rose-deep shadow-subtle">
          {mapError}
        </div>
      )}

      <button
        type="button"
        onClick={locateMe}
        className="absolute bottom-5 right-5 z-[500] rounded-lg border border-hairline bg-canvas px-4 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-ink shadow-card transition-colors duration-200 hover:bg-surface-soft"
      >
        ⌾ Vị trí của tôi
      </button>
    </section>
  );
}

export type { MapVendor as WeddingLocation };
