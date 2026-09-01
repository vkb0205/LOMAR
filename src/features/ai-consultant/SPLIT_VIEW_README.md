# AI Consultant split-view update

## Changes
- Converted `AIConsultantPage` to a split view:
  - right: AI chat
  - left: vendor/service map, suggested service, and quick hints
- Added `components/VendorMap.tsx` using React Leaflet + OpenStreetMap.
- Extended `RetrievedService` with optional `latitude`, `longitude`, and `address`.
- The map automatically fits all returned service locations.
- If the agent/catalog does not provide coordinates, the map shows a clear empty state instead of inventing locations.

## Dependency
Install React Leaflet and Leaflet in the frontend project:

```bash
npm install leaflet react-leaflet
npm install -D @types/leaflet
```

If the project uses another package manager, use its equivalent command.

## Data requirement
For markers to appear, the backend/agent response mapped into `RetrievedService` needs:

```ts
{
  id: string;
  name?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
}
```

Do not generate coordinates in the LLM. They should come from the catalog/vendor data or a trusted geocoding step.
