import "@testing-library/jest-dom";
import { JSDOM } from "jsdom";

// JSDOM環境をセットアップ
const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
  url: "http://localhost",
  pretendToBeVisual: true,
});

// グローバルオブジェクトを設定
global.document = dom.window.document;
global.window = dom.window as any;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;
global.Element = dom.window.Element;
global.KeyboardEvent = dom.window.KeyboardEvent;
global.MouseEvent = dom.window.MouseEvent;
global.Event = dom.window.Event;
global.getComputedStyle = dom.window.getComputedStyle;
