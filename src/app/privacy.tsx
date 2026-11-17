import { View } from 'react-native';
import { useI18n } from '../i18n/I18nProvider';
import policy from '../legal/policy.json';
import { legalLinks, publicPolicyUrl } from '../legal/config';
import { NativeText } from '../components/native-ui/NativeText';
import { ExternalAction } from '../components/ExternalAction';
import { Page } from '../components/ui';
import { spacing } from '../theme';

export default function Privacy(){
  const {locale,t}=useI18n();
  const text=policy[locale];
  return <Page>
    <View testID="privacy-policy" style={{gap:spacing.lg}}>
      <NativeText variant="title" accessibilityRole="header">{text.title}</NativeText>
      <NativeText variant="caption">{`${t('最終改定日')} ${policy.updatedOn}`}</NativeText>
      <NativeText variant="caption">{policy.operator}</NativeText>
      <NativeText selectable>{text.introduction}</NativeText>
      {text.sections.map(section=><View key={section.id} style={{gap:spacing.sm}}>
        <NativeText variant="label" accessibilityRole="header">{section.title}</NativeText>
        {section.paragraphs.map((paragraph,i)=><NativeText key={i} selectable>{paragraph}</NativeText>)}
        {('links' in section?section.links ?? []:[]).map(link=><ExternalAction key={link.key} title={link.label} url={legalLinks[link.key as keyof typeof legalLinks]}/>)}
      </View>)}
      <ExternalAction title="ブラウザで公開版を開く" url={publicPolicyUrl(locale)}/>
    </View>
  </Page>;
}
