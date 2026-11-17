import { View } from 'react-native';
import { NativeText } from '../components/native-ui/NativeText';
import { ExternalAction } from '../components/ExternalAction';
import { Page } from '../components/ui';
import { legalLinks, supportEmail } from '../legal/config';
import { spacing } from '../theme';

export default function Contact(){
  return <Page>
    <View testID="contact-page" style={{gap:spacing.lg}}>
      <NativeText variant="title" accessibilityRole="header">お問い合わせ</NativeText>
      <NativeText>不具合、ご意見、プライバシーに関するご質問を受け付けています。お問い合わせのために履歴や端末情報を自動送信することはありません。</NativeText>
      <View style={{gap:spacing.sm}}>
        <NativeText variant="label" accessibilityRole="header">メールでのお問い合わせ</NativeText>
        <NativeText selectable>{supportEmail}</NativeText>
        <ExternalAction title="メールで問い合わせる" primary url={legalLinks.email} fallbackText={supportEmail} errorMessage="メールアプリを開けませんでした。表示されたメールアドレスへ直接ご連絡ください。"/>
        <NativeText variant="caption">メールアプリで本文を入力し、内容をご確認のうえ送信してください。アプリから自動送信はしません。</NativeText>
      </View>
      <View style={{gap:spacing.sm}}>
        <NativeText variant="label" accessibilityRole="header">TestFlightをご利用の場合</NativeText>
        <NativeText>TestFlightアプリでKnowGachaを選び、「フィードバックを送信」からご連絡ください。送信前に本文やスクリーンショットの内容をご確認ください。</NativeText>
      </View>
      <View style={{gap:spacing.sm}}>
        <NativeText variant="label" accessibilityRole="header">GitHubでのお問い合わせ</NativeText>
        <NativeText>GitHubへの投稿は公開されます。氏名、メールアドレス、端末識別子、開封履歴などの個人情報・非公開にしたい内容は書き込まないでください。投稿にはGitHubへのログインが必要です。</NativeText>
        <ExternalAction title="GitHubで問い合わせる（公開）" url={legalLinks.support}/>
      </View>
      <NativeText variant="caption">不具合の報告には、問題が起きた画面と操作を、個人情報を含めずにお知らせください。履歴や端末情報は自動添付しません。</NativeText>
    </View>
  </Page>;
}
