import { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl, { GeoJSONSource, Map as MapLibreMap, Marker, Popup, type StyleSpecification } from 'maplibre-gl';
import { categoryMeta, vendors, type HoVanHueVendor, type VendorCategory } from '../../data/hoVanHueVendors';
import './map.css';
import 'maplibre-gl/dist/maplibre-gl.css';

interface HoVanHueMapProps {
  highlightedIds: string[];
  selectedId: string | null;
  activeFilters: VendorCategory[];
  onSelectVendor: (id: string | null) => void;
}

const OPENFREEMAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';
const HCMC_CENTER: [number, number] = [106.6763, 10.8008];

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function routeGeoJson(highlightedIds: string[]): GeoJSON.Feature<GeoJSON.LineString> {
  const orderedVendors = highlightedIds
    .map(id => vendors.find(vendor => vendor.id === id))
    .filter((vendor): vendor is HoVanHueVendor => Boolean(vendor));
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

function createVendorMarker(vendor: HoVanHueVendor, highlighted: boolean, selected: boolean, rank: number | null): HTMLDivElement {
  const meta = categoryMeta[vendor.category];
  const element = document.createElement('div');
  element.className = `hvh-vendor-marker${highlighted ? ' hvh-vendor-marker--highlighted' : ''}${selected ? ' hvh-vendor-marker--selected' : ''}`;
  element.style.setProperty('--vendor-color', meta.color);
  element.style.setProperty('--vendor-bg', meta.bg);
  element.setAttribute('aria-label', `${vendor.name} ${meta.label}`);
  element.innerHTML = `
    <span class="hvh-vendor-marker__pulse"></span>
    <span class="hvh-vendor-marker__icon">${meta.icon}</span>
    ${rank ? `<span class="hvh-vendor-marker__rank">${rank}</span>` : ''}
  `;
  return element;
}

function popupHtml(vendor: HoVanHueVendor, highlighted: boolean, rank: number | null): string {
  const meta = categoryMeta[vendor.category];
  const stars = '★'.repeat(Math.floor(vendor.rating));
  return `
    <div class="hvh-rich-popup">
      <div class="hvh-rich-popup__image">
        <img src="${escapeHtml(vendor.image)}" alt="${escapeHtml(vendor.name)}" />
        <span class="hvh-rich-popup__category">${meta.icon} ${escapeHtml(meta.label)}</span>
        ${highlighted && rank ? `<span class="hvh-rich-popup__rank">#${rank} đề xuất</span>` : ''}
      </div>
      <div class="hvh-rich-popup__body">
        <div class="hvh-rich-popup__title-row">
          <div>
            <strong>${escapeHtml(vendor.name)}</strong>
            <small>${escapeHtml(vendor.address)}</small>
          </div>
          <span class="hvh-rich-popup__price">${escapeHtml(vendor.priceRange)}</span>
        </div>
        <div class="hvh-rich-popup__rating"><span>${stars}</span><b>${vendor.rating}</b><small>(${vendor.reviews})</small></div>
        <p>${escapeHtml(vendor.description)}</p>
        <div class="hvh-rich-popup__details"><span>📞 ${escapeHtml(vendor.phone)}</span><span>🕐 ${escapeHtml(vendor.hours)}</span></div>
        <div class="hvh-rich-popup__chips">${vendor.specialties.map(item => `<span>${escapeHtml(item)}</span>`).join('')}</div>
      </div>
    </div>
  `;
}

export function HoVanHueMap({ highlightedIds, selectedId, activeFilters, onSelectVendor }: HoVanHueMapProps) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const filteredVendors = useMemo(
    () => vendors.filter(vendor => activeFilters.length === 0 || activeFilters.includes(vendor.category)),
    [activeFilters],
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
        park: '#e8f0da',
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

      map.addSource('recommended-route', { type: 'geojson', data: routeGeoJson([]) });
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
    source?.setData(routeGeoJson(highlightedIds));

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    const bounds = new maplibregl.LngLatBounds();

    filteredVendors.forEach(vendor => {
      const highlighted = highlightedIds.includes(vendor.id);
      const selected = selectedId === vendor.id;
      const rank = highlighted ? highlightedIds.indexOf(vendor.id) + 1 : null;
      const marker = new Marker({ element: createVendorMarker(vendor, highlighted, selected, rank), anchor: 'bottom' })
        .setLngLat([vendor.lng, vendor.lat])
        .setPopup(new Popup({ offset: 28, maxWidth: '320px' }).setHTML(popupHtml(vendor, highlighted, rank)))
        .addTo(map);

      marker.getElement().addEventListener('click', () => onSelectVendor(vendor.id));
      markersRef.current.push(marker);
      bounds.extend([vendor.lng, vendor.lat]);
    });

    highlightedIds
      .map(id => vendors.find(vendor => vendor.id === id))
      .filter((vendor): vendor is HoVanHueVendor => Boolean(vendor))
      .forEach(vendor => bounds.extend([vendor.lng, vendor.lat]));

    if (!bounds.isEmpty()) map.fitBounds(bounds, { padding: 58, maxZoom: highlightedIds.length > 0 ? 17.5 : 16.7 });
  }, [activeFilters, filteredVendors, highlightedIds, mapReady, onSelectVendor, selectedId]);

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

export type { HoVanHueVendor as WeddingLocation, VendorCategory };
