import type { MapVendor } from '../services/mapVendorService';

interface RoutePoint {
  vendor: MapVendor;
  originalIndex: number;
}

const EPSILON = 1e-12;

/**
 * Orders route stops monotonically along their dominant geographic axis.
 *
 * A route whose projection always increases cannot reverse direction or have
 * non-adjacent segments cross. The axis is oriented from the AI's first stop
 * toward its last stop so the suggestion's general travel direction is kept.
 */
export function orderUnidirectionalRoute(vendors: MapVendor[], suggestedIds: string[]): string[] {
  const vendorsById = new Map(vendors.map(vendor => [vendor.id, vendor]));
  const seenIds = new Set<string>();
  const points: RoutePoint[] = [];

  suggestedIds.forEach((id, originalIndex) => {
    const vendor = vendorsById.get(id);
    if (!vendor || seenIds.has(id)) return;

    seenIds.add(id);
    points.push({ vendor, originalIndex });
  });

  if (points.length <= 2) return points.map(point => point.vendor.id);

  const center = points.reduce(
    (sum, point) => ({
      lng: sum.lng + point.vendor.lng / points.length,
      lat: sum.lat + point.vendor.lat / points.length,
    }),
    { lng: 0, lat: 0 },
  );

  let lngVariance = 0;
  let latVariance = 0;
  let covariance = 0;

  points.forEach(({ vendor }) => {
    const lngOffset = vendor.lng - center.lng;
    const latOffset = vendor.lat - center.lat;
    lngVariance += lngOffset * lngOffset;
    latVariance += latOffset * latOffset;
    covariance += lngOffset * latOffset;
  });

  const angle = Math.atan2(2 * covariance, lngVariance - latVariance) / 2;
  let axisLng = Math.cos(angle);
  let axisLat = Math.sin(angle);
  const first = points[0].vendor;
  const last = points[points.length - 1].vendor;
  const suggestedDirection =
    (last.lng - first.lng) * axisLng + (last.lat - first.lat) * axisLat;

  if (
    suggestedDirection < -EPSILON ||
    (Math.abs(suggestedDirection) <= EPSILON &&
      (Math.abs(axisLng) >= Math.abs(axisLat) ? axisLng < 0 : axisLat < 0))
  ) {
    axisLng *= -1;
    axisLat *= -1;
  }

  const perpendicularLng = -axisLat;
  const perpendicularLat = axisLng;

  return [...points]
    .sort((left, right) => {
      const leftLng = left.vendor.lng - center.lng;
      const leftLat = left.vendor.lat - center.lat;
      const rightLng = right.vendor.lng - center.lng;
      const rightLat = right.vendor.lat - center.lat;
      const projectionDifference =
        leftLng * axisLng + leftLat * axisLat -
        (rightLng * axisLng + rightLat * axisLat);

      if (Math.abs(projectionDifference) > EPSILON) return projectionDifference;

      const perpendicularDifference =
        leftLng * perpendicularLng + leftLat * perpendicularLat -
        (rightLng * perpendicularLng + rightLat * perpendicularLat);

      if (Math.abs(perpendicularDifference) > EPSILON) return perpendicularDifference;
      return left.originalIndex - right.originalIndex;
    })
    .map(point => point.vendor.id);
}
