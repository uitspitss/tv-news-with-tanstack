/**
 * GeoJSONデータ変換スクリプト
 * 元のデータ形式を期待される形式に変換する
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

interface OriginalProperties {
  nam: string;
  nam_ja: string;
  id: number;
}

interface ConvertedProperties {
  name: string;
  code: string;
}

interface Feature {
  type: "Feature";
  properties: OriginalProperties | ConvertedProperties;
  geometry: unknown;
}

interface GeoJSON {
  type: "FeatureCollection";
  features: Feature[];
}

// ファイルパス
const inputPath = join(process.cwd(), "public/data/japan-prefectures.json");
const outputPath = join(process.cwd(), "public/data/japan-prefectures.json");
const backupPath = join(process.cwd(), "public/data/japan-prefectures.backup.json");

try {
  // 元のデータを読み込む
  console.log("Reading GeoJSON data...");
  const data: GeoJSON = JSON.parse(readFileSync(inputPath, "utf-8"));

  // バックアップを作成
  console.log("Creating backup...");
  writeFileSync(backupPath, JSON.stringify(data, null, 2));

  // データを変換
  console.log("Converting data...");
  const converted: GeoJSON = {
    type: "FeatureCollection",
    features: data.features.map((feature) => {
      const props = feature.properties as OriginalProperties;
      return {
        ...feature,
        properties: {
          name: props.nam_ja,
          code: props.id.toString().padStart(2, "0"),
        },
      };
    }),
  };

  // 変換後のデータを保存
  console.log("Saving converted data...");
  writeFileSync(outputPath, JSON.stringify(converted, null, 2));

  console.log("✓ Conversion completed successfully!");
  console.log(`  Backup: ${backupPath}`);
  console.log(`  Output: ${outputPath}`);
  console.log(`  Features: ${converted.features.length}`);
} catch (error) {
  console.error("✗ Conversion failed:", error);
  process.exit(1);
}
