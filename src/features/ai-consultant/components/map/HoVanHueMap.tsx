import { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl, { GeoJSONSource, Map as MapLibreMap, Marker, Popup, type StyleSpecification } from 'maplibre-gl';
import { categoryMeta, vendors, type HoVanHueVendor, type VendorCategory } from '../../data/hoVanHueVendors';
import routeCoordinates from '../../data/ho-van-hue-route.json';
import './map.css';
import 'maplibre-gl/dist/maplibre-gl.css';

interface HoVanHueMapProps {
  highlightedIds: string[];
  selectedId: string | null;
  activeFilters: VendorCategory[];
  onSelectVendor: (id: string | null) => void;
}

const OPENFREEMAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';
const HO_VAN_HUE_ROUTE = routeCoordinates as [number, number][];
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

function routeToGeoJSON() {
  return {
    type: 'FeatureCollection' as const,
    features: [
      {
        type: 'Feature' as const,
        properties: { name: 'Đường Hồ Văn Huê' },
        geometry: {
          type: 'LineString' as const,
          coordinates: HO_VAN_HUE_ROUTE.map(([lat, lng]) => [lng, lat]),
        },
      },
    ],
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
      attributionControl: undefined,
      dragRotate: false,
      pitchWithRotate: false,
      maxPitch: 0,
    });

    mapRef.current = map;

    const handleLoad = () => {
      map.getStyle().layers.forEach(layer => {
        if (layer.type === 'symbol') {
          map.setLayoutProperty(layer.id, 'visibility', 'none');
        }
      });

      map.addSource('ho-van-hue-route', {
        type: 'geojson',
        data: routeToGeoJSON(),
      });
      map.addLayer({
        id: 'ho-van-hue-casing',
        type: 'line',
        source: 'ho-van-hue-route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#ffffff',
          'line-opacity': 0.96,
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15, 6,
            17, 9,
            19, 14,
            20, 18,
          ],
        },
      });

      map.addSource('recommended-route', { type: 'geojson', data: routeGeoJson([]) });
      map.addLayer({
        id: 'recommended-route-casing',
        type: 'line',
        source: 'recommended-route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#ffffff', 'line-width': 7, 'line-opacity': 0.85 },
      });
      map.addLayer({
        id: 'recommended-route-line',
        type: 'line',
        source: 'recommended-route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#c9906a', 'line-width': 3, 'line-opacity': 0.9, 'line-dasharray': [2, 2] },
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

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

    HO_VAN_HUE_ROUTE.forEach(([lat, lng]) => bounds.extend([lng, lat]));

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

  return (
    <section className="relative h-full min-h-[520px] overflow-hidden bg-[#f4f1eb] shadow-sm">
      <div ref={mapElementRef} className="h-full min-h-[520px] w-full" />
      {!mapReady && !mapError && (
        <div className="absolute inset-0 z-[1000] grid place-items-center bg-[#f4f1eb]/90 backdrop-blur-sm">
          <div className="rounded-2xl bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">Đang tải bản đồ…</div>
        </div>
      )}
      {mapError && <div className="absolute left-4 right-4 top-4 z-[1000] border border-rose-100 bg-white/95 px-4 py-3 text-sm text-rose-700 shadow-sm">{mapError}</div>}
    </section>
  );
}

export type { HoVanHueVendor as WeddingLocation, VendorCategory };
