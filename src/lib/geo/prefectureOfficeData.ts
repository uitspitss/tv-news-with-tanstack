/**
 * Prefecture Office Data Types and Validation
 *
 * Type definitions and validation functions for prefecture office location data.
 */

/**
 * 都道府県庁舎所在地データ
 */
export interface PrefectureOffice {
  /** 都道府県コード（2桁、ゼロパディング） */
  code: string;

  /** 都道府県名（例：「北海道」、「東京都」） */
  name: string;

  /** 庁舎名（例：「北海道庁」、「東京都庁」） */
  officeName: string;

  /** 緯度（世界測地系WGS84、小数点以下6桁精度） */
  lat: number;

  /** 経度（世界測地系WGS84、小数点以下6桁精度） */
  lon: number;
}

/**
 * 都道府県庁舎所在地データの配列
 */
export type PrefectureOfficeData = PrefectureOffice[];

/**
 * 都道府県庁舎所在地データのバリデーション
 *
 * @param office - 検証する庁舎所在地オブジェクト
 * @returns オブジェクトが有効なPrefectureOffice型である場合はtrue
 */
export function validatePrefectureOffice(office: unknown): office is PrefectureOffice {
  if (typeof office !== "object" || office === null) {
    return false;
  }

  const o = office as Record<string, unknown>;

  // code: 2桁の文字列、"01"〜"47"
  if (typeof o.code !== "string" || !/^(0[1-9]|[1-4][0-9])$/.test(o.code)) {
    return false;
  }

  // name: 空でない文字列
  if (typeof o.name !== "string" || o.name.trim().length === 0) {
    return false;
  }

  // officeName: 空でない文字列
  if (typeof o.officeName !== "string" || o.officeName.trim().length === 0) {
    return false;
  }

  // lat: 数値、-90.0 〜 90.0
  if (typeof o.lat !== "number" || o.lat < -90.0 || o.lat > 90.0) {
    return false;
  }

  // lon: 数値、-180.0 〜 180.0
  if (typeof o.lon !== "number" || o.lon < -180.0 || o.lon > 180.0) {
    return false;
  }

  return true;
}

/**
 * 都道府県庁舎所在地データ配列のバリデーション
 *
 * @param data - 検証するデータ配列
 * @returns すべての要素が有効なPrefectureOffice型である場合はtrue
 */
export function validatePrefectureOfficeData(data: unknown): data is PrefectureOfficeData {
  if (!Array.isArray(data)) {
    return false;
  }

  // 47都道府県すべてが含まれているか確認
  if (data.length !== 47) {
    return false;
  }

  // すべての要素が有効なPrefectureOfficeか確認
  return data.every(validatePrefectureOffice);
}
