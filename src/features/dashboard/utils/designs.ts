import { DashboardStationId } from '../constants';
import { SavedDesign, StationDesignFilter } from '../types';

const stationDesignFilters: StationDesignFilter = {
  T01: () => false,
  T02: design => design.category === 'Studio',
  T03: design => design.category === 'Váy Cưới' || design.category === 'Vest',
  T04: design => design.category === 'Venue',
};

export function getStationDesigns(stationId: DashboardStationId, savedDesigns: SavedDesign[]): SavedDesign[] {
  return savedDesigns.filter(stationDesignFilters[stationId]);
}

export function formatDesignDate(createdAt: string): string {
  return new Date(createdAt).toLocaleDateString('vi-VN');
}
