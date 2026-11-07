import { Redirect, useLocalSearchParams } from 'expo-router';
export default function LegacyMap() {
  const params = useLocalSearchParams<{ focus?: string; fresh?: string }>();
  return <Redirect href={{ pathname: '/', params }} />;
}
