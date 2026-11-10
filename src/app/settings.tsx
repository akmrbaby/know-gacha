import { DevelopmentSettings } from '../components/DevelopmentSettings';
import { LanguageSelector } from '../components/LanguageSelector';
import { MapMotionStatus } from '../components/MapMotionStatus';
import { ReminderSettings } from '../components/ReminderSettings';
import { Page } from '../components/ui';

export default function Settings() {
  return <Page><LanguageSelector /><ReminderSettings /><MapMotionStatus /><DevelopmentSettings /></Page>;
}
