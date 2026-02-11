/**
 * 地図ユーティリティ関数
 * Feature: 001-add-japan-map
 */

import type { JapanMapData, Prefecture } from "./japanGeoData";

/**
 * JapanMapDataの型ガード関数
 * @param data - 検証対象のデータ
 * @returns データが有効なJapanMapDataの場合はtrue
 */
export function validateJapanMapData(data: unknown): data is JapanMapData {
  if (!data || typeof data !== "object") return false;
  if ((data as JapanMapData).type !== "FeatureCollection") return false;

  const features = (data as JapanMapData).features;
  if (!Array.isArray(features)) return false;

  // 47都道府県のチェック（警告のみ）
  if (features.length !== 47) {
    console.warn(`Expected 47 prefectures, got ${features.length}`);
  }

  return features.every(validatePrefecture);
}

/**
 * Prefectureの型ガード関数
 * @param feature - 検証対象のフィーチャー
 * @returns フィーチャーが有効なPrefectureの場合はtrue
 */
export function validatePrefecture(feature: unknown): feature is Prefecture {
  if (!feature || typeof feature !== "object") return false;
  if ((feature as Prefecture).type !== "Feature") return false;

  const props = (feature as Prefecture).properties;
  if (!props?.name || !props?.code) return false;
  if (!/^\d{2}$/.test(props.code)) return false;

  const geom = (feature as Prefecture).geometry;
  if (!geom || !["Polygon", "MultiPolygon"].includes(geom.type)) return false;

  return true;
}

/**
 * 都道府県コードから都道府県を検索
 * @param data - 日本地図データ
 * @param code - 都道府県コード（例: "01", "13"）
 * @returns 該当する都道府県、見つからない場合はundefined
 */
export function findPrefectureByCode(data: JapanMapData, code: string): Prefecture | undefined {
  return data.features.find((feature) => feature.properties.code === code);
}

/**
 * 都道府県名から都道府県を検索
 * @param data - 日本地図データ
 * @param name - 都道府県名（例: "北海道", "東京都"）
 * @returns 該当する都道府県、見つからない場合はundefined
 */
export function findPrefectureByName(data: JapanMapData, name: string): Prefecture | undefined {
  return data.features.find((feature) => feature.properties.name === name);
}

/**
 * GeoJSONデータを取得
 * @param url - GeoJSONファイルのURL
 * @returns Promise<JapanMapData>
 * @throws データの取得または検証に失敗した場合
 */
export async function fetchJapanMapData(url: string): Promise<JapanMapData> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch GeoJSON data: ${response.status} ${response.statusText}`);
  }

  const data: unknown = await response.json();

  if (!validateJapanMapData(data)) {
    throw new Error("Invalid GeoJSON data format");
  }

  return data;
}
