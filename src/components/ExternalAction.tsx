import { useRef, useState } from 'react';
import { Linking, View } from 'react-native';
import { NativeText } from './native-ui/NativeText';
import { Action } from './ui';
import { spacing } from '../theme';

// External destinations open only after an explicit tap; no diagnostics are attached.
export function ExternalAction({title,url,primary=false,errorMessage,fallbackText}:{title:string;url:string;primary?:boolean;errorMessage?:string;fallbackText?:string}){
  const [busy,setBusy]=useState(false),[error,setError]=useState(false);
  const lock=useRef(false);
  async function open(){
    if(lock.current)return;
    lock.current=true;setBusy(true);setError(false);
    try{await Linking.openURL(url);}catch{setError(true);}
    finally{lock.current=false;setBusy(false);}
  }
  return <View style={{gap:spacing.sm}}>
    <Action title={title} secondary={!primary} loading={busy} onPress={()=>{void open();}} />
    {error && <><NativeText accessibilityRole="alert">{errorMessage ?? 'リンクを開けませんでした。以下のアドレスをコピーしてブラウザで開いてください。'}</NativeText><NativeText selectable variant="caption">{fallbackText ?? url}</NativeText></>}
  </View>;
}
