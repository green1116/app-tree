/**
 * 多语言工具函数
 * 用于加载和管理应用的国际化文本
 */

import en from '../locales/en.json';
import zh from '../locales/zh.json';

/**
 * 支持的语言类型
 */
export type SupportedLanguage = 'en' | 'zh';

/**
 * 语言包类型定义
 */
export type LocaleData = typeof en;

/**
 * 根据语言代码获取对应的语言包
 * 
 * @param lang 语言代码（'en' 或 'zh'）
 * @returns 对应的语言包对象
 * 
 * @example
 * const locale = getLocale('zh');
 * console.log(locale.pages.connect.bluetooth_title); // "蓝牙连接"
 */
export function getLocale(lang: string): LocaleData {
  // 默认使用中文
  const normalizedLang = (lang === 'en' ? 'en' : 'zh') as SupportedLanguage;
  return normalizedLang === 'en' ? en : zh;
}

/**
 * 获取翻译文本
 * 根据当前语言返回对应的翻译对象
 * 
 * @param lang 语言代码（'en' 或 'zh'）
 * @returns 翻译对象
 * 
 * @example
 * const t = getTranslation('zh');
 * console.log(t.pages.connect.bluetooth_title); // "蓝牙连接"
 */
export function getTranslation(lang: string): LocaleData {
  return getLocale(lang);
}

/**
 * 多语言工具对象
 * 提供统一的接口访问所有语言相关函数
 */
export const localeUtils = {
  getLocale,
  getTranslation,
  supportedLanguages: ['en', 'zh'] as const,
  defaultLanguage: 'zh' as const
};

