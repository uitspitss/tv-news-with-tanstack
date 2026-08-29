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
 *
 * 帰属表示はプラグインがスタイルの sources から拾って Leaflet の attributionControl に
 * 流し込む。OpenFreeMap 自身の表記は sources に含まれないので customAttribution で足す。
 */
const STYLE_URL = "https://tiles.openfreemap.org/styles/dark";

export function BaseMapLayer() {
  const map = useMap();

  useEffect(() => {
    const layer = maplibreGL({
      style: STYLE_URL,
      attributionControl: { customAttribution: "&copy; OpenFreeMap &copy; OpenMapTiles" },
    });
    layer.addTo(map);

    return () => {
      layer.remove();
    };
  }, [map]);

  return null;
}
