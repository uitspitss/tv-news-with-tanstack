/**
 * Prefecture Capital Data Converter
 *
 * Converts CSV data from dataofjapan/land to JSON format
 * for use in the prefecture office markers feature.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { parse } from 'csv-parse/sync';
import { dirname } from 'node:path';

interface CSVRow {
  id: string;
  nam_ja: string;
  lat: string;
  lon: string;
}

interface PrefectureOffice {
  code: string;
  name: string;
  officeName: string;
  lat: number;
  lon: number;
}

/**
 * Generates office name from prefecture name
 * 例: 北海道 → 北海道庁, 東京都 → 東京都庁
 */
function generateOfficeName(prefectureName: string): string {
  // 都道府県名は既に「都」「道」「府」「県」で終わる
  return `${prefectureName}庁`;
}

/**
 * Main conversion function
 */
function convertCapitalData(): void {
  try {
    // CSVファイルを読み込み
    console.log('📖 Reading CSV file: scripts/prefecturalCapital.csv');
    const csvContent = readFileSync('scripts/prefecturalCapital.csv', 'utf-8');

    // CSVをパース
    const records: CSVRow[] = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    console.log(`✅ Parsed ${records.length} records from CSV`);

    // JSON形式に変換
    const prefectureOffices: PrefectureOffice[] = records.map((row) => {
      const code = row.id.padStart(2, '0'); // ゼロパディング: 1 → "01"
      const name = row.nam_ja;
      const officeName = generateOfficeName(name);
      const lat = parseFloat(row.lat);
      const lon = parseFloat(row.lon);

      // データ検証
      if (!code || !name || isNaN(lat) || isNaN(lon)) {
        throw new Error(`Invalid data for row: ${JSON.stringify(row)}`);
      }

      return { code, name, officeName, lat, lon };
    });

    // 都道府県コード順にソート
    prefectureOffices.sort((a, b) => a.code.localeCompare(b.code));

    // 出力ディレクトリを作成（存在しない場合）
    const outputPath = 'public/data/prefecture-offices.json';
    mkdirSync(dirname(outputPath), { recursive: true });

    // JSONファイルとして保存
    writeFileSync(
      outputPath,
      JSON.stringify(prefectureOffices, null, 2),
      'utf-8'
    );

    console.log(`✅ Successfully converted ${prefectureOffices.length} prefecture offices`);
    console.log(`📝 Output saved to: ${outputPath}`);

    // サンプルデータを表示
    console.log('\n📊 Sample data (first 3 entries):');
    prefectureOffices.slice(0, 3).forEach((office) => {
      console.log(`  - ${office.code}: ${office.name} (${office.officeName}) [${office.lat}, ${office.lon}]`);
    });

  } catch (error) {
    console.error('❌ Error during conversion:', error);
    process.exit(1);
  }
}

// スクリプト実行
convertCapitalData();
