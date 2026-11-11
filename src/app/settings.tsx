import { BadgeSettings } from '../components/BadgeSettings';
import { DevelopmentSettings } from '../components/DevelopmentSettings';
import { LanguageSelector } from '../components/LanguageSelector';
import { MapMotionStatus } from '../components/MapMotionStatus';
import { ReminderSettings } from '../components/ReminderSettings';
import { Page } from '../components/ui';

export default function Settings() {
  return <Page><LanguageSelector /><BadgeSettings /><ReminderSettings /><MapMotionStatus /><DevelopmentSettings /></Page>;
}
