/**
 * 浏览器兼容性检测工具
 * 用于检测浏览器类型和 Web Bluetooth API 支持情况
 */

/**
 * 浏览器类型
 */
export type BrowserName = 'Chrome' | 'Edge' | 'Safari' | 'Firefox' | 'unknown';

/**
 * 浏览器检测结果
 */
export interface BrowserInfo {
  /** 浏览器名称 */
  name: BrowserName;
  /** 是否支持 Web Bluetooth API */
  isSupported: boolean;
  /** 是否为 Chrome 浏览器 */
  isChrome: boolean;
  /** 是否为 Edge 浏览器 */
  isEdge: boolean;
  /** 是否为 Safari 浏览器 */
  isSafari: boolean;
  /** 是否为 Firefox 浏览器 */
  isFirefox: boolean;
}

/**
 * 检测浏览器类型和 Web Bluetooth API 支持情况
 * 
 * Web Bluetooth API 支持情况：
 * - Chrome: ✅ 完全支持（桌面和 Android）
 * - Edge: ✅ 完全支持（基于 Chromium）
 * - Safari: ❌ 不支持
 * - Firefox: ❌ 不支持
 * 
 * @returns BrowserInfo 浏览器信息对象
 * 
 * @example
 * const browser = detectBrowser();
 * if (!browser.isSupported) {
 *   console.warn('Web Bluetooth is not supported');
 * }
 */
export function detectBrowser(): BrowserInfo {
  // 服务端渲染时返回默认值
  if (typeof window === 'undefined') {
    return {
      name: 'unknown',
      isSupported: false,
      isChrome: false,
      isEdge: false,
      isSafari: false,
      isFirefox: false
    };
  }

  const userAgent = navigator.userAgent.toLowerCase();
  
  // 检测浏览器类型
  // 注意：Edge 的 userAgent 包含 'edg'，需要先检测 Edge 再检测 Chrome
  const isEdge = /edg/.test(userAgent);
  const isChrome = /chrome/.test(userAgent) && !/edge|opr|edg/.test(userAgent);
  const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
  const isFirefox = /firefox/.test(userAgent);
  
  // 检测 Web Bluetooth API 支持
  // Web Bluetooth API 仅在 Chrome/Edge 中支持
  const isBluetoothSupported = typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  
  // 确定浏览器名称
  let browserName: BrowserName = 'unknown';
  if (isChrome) browserName = 'Chrome';
  else if (isEdge) browserName = 'Edge';
  else if (isSafari) browserName = 'Safari';
  else if (isFirefox) browserName = 'Firefox';
  
  return {
    name: browserName,
    isSupported: isBluetoothSupported,
    isChrome,
    isEdge,
    isSafari,
    isFirefox
  };
}

/**
 * 获取浏览器兼容性提示信息
 * 
 * @param browserInfo 浏览器信息
 * @param lang 语言代码（'en' 或 'zh'）
 * @returns 提示信息对象，包含标题和描述
 */
export function getCompatibilityMessage(browserInfo: BrowserInfo, lang: string = 'zh') {
  const isZh = lang === 'zh';
  
  if (browserInfo.isSupported) {
    return null; // 支持时不需要提示
  }
  
  if (browserInfo.isSafari) {
    return {
      title: isZh ? '浏览器兼容性提示' : 'Browser Compatibility Notice',
      message: isZh 
        ? 'Safari 浏览器不支持 Web Bluetooth API。建议使用 Chrome 或 Edge 浏览器以获得最佳体验。'
        : 'Safari does not support Web Bluetooth API. We recommend using Chrome or Edge browser for the best experience.'
    };
  }
  
  if (browserInfo.isFirefox) {
    return {
      title: isZh ? '浏览器兼容性提示' : 'Browser Compatibility Notice',
      message: isZh
        ? 'Firefox 浏览器不支持 Web Bluetooth API。建议使用 Chrome 或 Edge 浏览器以获得最佳体验。'
        : 'Firefox does not support Web Bluetooth API. We recommend using Chrome or Edge browser for the best experience.'
    };
  }
  
  return {
    title: isZh ? '浏览器兼容性提示' : 'Browser Compatibility Notice',
    message: isZh
      ? '当前浏览器不支持 Web Bluetooth API。建议使用 Chrome 或 Edge 浏览器以获得最佳体验。'
      : 'Current browser does not support Web Bluetooth API. We recommend using Chrome or Edge browser for the best experience.'
  };
}

/**
 * 浏览器检测工具对象
 * 提供统一的接口访问所有浏览器检测相关函数
 */
export const browserDetection = {
  detectBrowser,
  getCompatibilityMessage
};

