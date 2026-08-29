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

/**
 * 消すレイヤーの source-layer。主役は局名ラベルなので、ベースマップは
 * 陸と海の区別と国境だけ残して引っ込める。dark スタイルは素のままだと
 * 道路網と各国語の地名で埋まり、局名が読めない。
 *
 * ID ではなく source-layer と type で判定する。ID の許可リストにすると
 * OpenFreeMap 側の改名で全レイヤーが消えて真っ黒になるが、この方式なら
 * レイヤーが増えたときに多少賑やかになるだけで済む。
 */
const HIDDEN_SOURCE_LAYERS = new Set([
  "transportation",
  "transportation_name",
  "aeroway",
  "building",
  "landuse",
  "landcover",
]);

/** ラベルは全部消す。残すのは background / water / waterway / boundary_* */
const isHidden = (layer: { type: string; "source-layer"?: string }) =>
  layer.type === "symbol" || HIDDEN_SOURCE_LAYERS.has(layer["source-layer"] ?? "");

export function BaseMapLayer() {
  const map = useMap();

  useEffect(() => {
    const layer = maplibreGL({
      style: STYLE_URL,
      attributionControl: { customAttribution: ATTRIBUTION },
    });
    layer.addTo(map);

    const gl = layer.getMaplibreMap();
    const hideNoise = () => {
      for (const l of gl.getStyle().layers) {
        if (isHidden(l)) {
          gl.setLayoutProperty(l.id, "visibility", "none");
        }
      }
    };
    // style.load はレイヤーが揃った時点で発火する。addTo 直後は間に合わない
    gl.on("style.load", hideNoise);

    return () => {
      layer.remove();
    };
  }, [map]);

  return null;
}
