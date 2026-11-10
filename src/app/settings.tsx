import { LanguageSelector } from '../components/LanguageSelector';
import { MapMotionStatus } from '../components/MapMotionStatus';
import { Page } from '../components/ui';

export default function Settings() {
  return <Page><LanguageSelector /><MapMotionStatus /></Page>;
}
