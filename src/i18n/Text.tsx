import { Children, type ReactNode } from 'react';
import { Text as RNText, type TextProps } from 'react-native';
import { useI18n } from './I18nProvider';
export function Text({children,accessibilityLabel,...props}:TextProps) {
  const {t}=useI18n();
  const parts=Children.toArray(children);
  const localized:ReactNode=parts.every(part=>typeof part==='string'||typeof part==='number') ? t(parts.join('')) : Children.map(children,child=>typeof child==='string'?t(child):child);
  return <RNText {...props} accessibilityLabel={accessibilityLabel?t(accessibilityLabel):undefined}>{localized}</RNText>;
}
