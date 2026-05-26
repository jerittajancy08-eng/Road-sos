export const CHENNAI_COORDINATES = [13.0827, 80.2707];

export function isValidCoordinate(lat, lng) {
  return typeof lat === "number" && typeof lng === "number" && Number.isFinite(lat) && Number.isFinite(lng);
}

export function isValidPosition(position) {
  return Array.isArray(position) && isValidCoordinate(position[0], position[1]);
}

export function safePosition(position, fallback = CHENNAI_COORDINATES) {
  return isValidPosition(position) ? position : fallback;
}

export function positionFromLatLng(lat, lng) {
  return isValidCoordinate(lat, lng) ? [lat, lng] : null;
}

export function validPositions(positions = []) {
  return positions.filter(isValidPosition);
}
