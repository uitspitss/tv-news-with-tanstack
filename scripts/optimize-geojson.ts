/**
 * GeoJSON最適化スクリプト
 * 座標精度を調整し、不要なプロパティを削除してファイルサイズを削減
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

interface GeoJSONFeature {
  type: string;
  properties: Record<string, any>;
  geometry: {
    type: string;
    coordinates: any;
  };
}

interface GeoJSONData {
  type: string;
  features: GeoJSONFeature[];
}

/**
 * 座標の精度を調整（小数点以下の桁数を制限）
 */
function roundCoordinate(coord: number, precision: number = 4): number {
  const multiplier = 10 ** precision;
  return Math.round(coord * multiplier) / multiplier;
}

/**
 * 座標配列を再帰的に処理
 */
function processCoordinates(coords: any, precision: number = 4): any {
  if (Array.isArray(coords[0])) {
    return coords.map((c: any) => processCoordinates(c, precision));
  } else {
    // 座標のペア [lng, lat]
    return coords.map((c: number) => roundCoordinate(c, precision));
  }
}

/**
 * GeoJSONデータを最適化
 */
function optimizeGeoJSON(data: GeoJSONData, precision: number = 4): GeoJSONData {
  return {
    type: data.type,
    features: data.features.map((feature) => ({
      type: feature.type,
      properties: {
        // 必要なプロパティのみ保持
        name: feature.properties.name || feature.properties.nam || feature.properties.NAME,
        code: feature.properties.code || feature.properties.id || feature.properties.ID,
      },
      geometry: {
        type: feature.geometry.type,
        coordinates: processCoordinates(feature.geometry.coordinates, precision),
      },
    })),
  };
}

// メイン処理
const inputPath = join(process.cwd(), "public/data/japan-prefectures.json");
const outputPath = join(process.cwd(), "public/data/japan-prefectures.optimized.json");

console.log("🔧 GeoJSON最適化を開始...");
console.log(`📁 入力: ${inputPath}`);

// ファイルを読み込む
const rawData = readFileSync(inputPath, "utf-8");
const originalSize = Buffer.byteLength(rawData, "utf-8");
const data: GeoJSONData = JSON.parse(rawData);

console.log(`📊 元のファイルサイズ: ${(originalSize / (1024 * 1024)).toFixed(2)} MB`);
console.log(`📊 都道府県数: ${data.features.length}`);

// 最適化を実行
const optimized = optimizeGeoJSON(data, 4); // 小数点以下4桁

// 最適化されたデータを書き込む
const optimizedData = JSON.stringify(optimized);
const optimizedSize = Buffer.byteLength(optimizedData, "utf-8");

writeFileSync(outputPath, optimizedData, "utf-8");

console.log(`📊 最適化後のファイルサイズ: ${(optimizedSize / (1024 * 1024)).toFixed(2)} MB`);
console.log(`📉 削減率: ${(((originalSize - optimizedSize) / originalSize) * 100).toFixed(2)}%`);
console.log(`✅ 最適化完了: ${outputPath}`);
console.log("");
console.log("次のステップ:");
console.log("1. 最適化されたファイルを確認: public/data/japan-prefectures.optimized.json");
console.log("2. 問題なければ、元のファイルを置き換え:");
console.log(
  "   mv public/data/japan-prefectures.optimized.json public/data/japan-prefectures.json",
);
