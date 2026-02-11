/**
 * GeoJSON型定義 - 日本地図データ
 * Feature: 001-add-japan-map
 */

/**
 * 都道府県のプロパティ
 */
export interface PrefectureProperties {
  /** 都道府県名（日本語）- 例: "北海道", "東京都" */
  name: string;
  /** 都道府県コード（2桁）- 例: "01", "13" */
  code: string;
  /** 地域区分（オプション） */
  region?: string;
}

/**
 * 都道府県のジオメトリ
 */
export interface PrefectureGeometry {
  type: "Polygon" | "MultiPolygon";
  coordinates: number[][][] | number[][][][];
}

/**
 * 都道府県フィーチャー
 */
export interface Prefecture {
  type: "Feature";
  properties: PrefectureProperties;
  geometry: PrefectureGeometry;
}

/**
 * 日本地図GeoJSONデータ
 */
export interface JapanMapData {
  type: "FeatureCollection";
  features: Prefecture[];
}

/**
 * 地図インタラクション状態
 */
export interface MapInteractionState {
  /** ホバー中の都道府県コード */
  hoveredPrefecture: string | null;
  /** 選択中の都道府県コード */
  selectedPrefecture: string | null;
  /** キーボードフォーカス中の都道府県コード */
  focusedPrefecture: string | null;
  /** ズームレベル（5-10） */
  zoom: number;
  /** 地図の中心座標 [経度, 緯度] */
  center: [number, number];
}

/**
 * 地図読み込みステータス
 */
export type MapLoadingStatus = "idle" | "loading" | "success" | "error";

/**
 * 地図読み込み状態
 */
export interface MapLoadingState {
  /** 読み込みステータス */
  status: MapLoadingStatus;
  /** エラー情報（status='error'時のみ） */
  error?: Error;
}

/**
 * 初期インタラクション状態
 */
export const initialMapInteractionState: MapInteractionState = {
  hoveredPrefecture: null,
  selectedPrefecture: null,
  focusedPrefecture: null,
  zoom: 5,
  center: [138, 36], // 日本の中心座標
};
