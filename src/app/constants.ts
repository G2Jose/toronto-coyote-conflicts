export const MAP_TILE_LAYER_LIGHT =
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
export const MAP_TILE_LAYER_DARK =
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'

export const getMapTileLayer = (isDark: boolean) => {
  return isDark ? MAP_TILE_LAYER_DARK : MAP_TILE_LAYER_LIGHT
}
