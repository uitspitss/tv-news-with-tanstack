import { maplibreGL } from "@maplibre/maplibre-gl-leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import "maplibre-gl/dist/maplibre-gl.css";

/**
 * ベースマップ。OpenFreeMap の dark スタイルを使う。
 *
 * OpenFreeMap は API キー不要・リクエスト数無制限・商用可で、利用条件が明示されている
 * 数少ないタイル提供元。ただしベクタータイルなので Leaflet の TileLayer では描画できず、
 * MapLibre GL を Leaflet のレイヤーとして挟んでいる。
 */
const STYLE_URL = "https://tiles.openfreemap.org/styles/dark";

/**
 * OpenFreeMap が要求する帰属表示。OpenStreetMap のクレジットは ODbL 上必須。
 *
 * プラグインは customAttribution が指定されていると **それだけ** を返し、
 * TileJSON 由来の帰属を捨てる（getAttribution の早期 return）。したがって
 * ここに完全な文字列を書く必要がある。TileJSON の取得に失敗しても
 * 表示が消えない利点もある。
 *
 * 出典: https://tiles.openfreemap.org/planet の attribution
 */
const ATTRIBUTION = [
  '<a href="https://openfreemap.org" target="_blank" rel="noopener noreferrer">OpenFreeMap</a>',
  '<a href="https://www.openmaptiles.org/" target="_blank" rel="noopener noreferrer">&copy; OpenMapTiles</a>',
  'Data from <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
].join(" ");

export function BaseMapLayer() {
  const map = useMap();

  useEffect(() => {
    const layer = maplibreGL({
      style: STYLE_URL,
      attributionControl: { customAttribution: ATTRIBUTION },
    });
    layer.addTo(map);

    return () => {
      layer.remove();
    };
  }, [map]);

  return null;
}
