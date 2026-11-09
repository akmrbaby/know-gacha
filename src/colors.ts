// Shared color tokens; no React/native imports, so graph data stays runtime independent.
export const knowledgeColors = { teal: '#197B78', violet: '#8060B0', amber: '#9B6514', onNode: '#FFFFFF' } as const;
export const palettes = {
  light: {
    background: '#FAF9F5', surface: '#FFFFFF', text: '#153D3A', secondaryText: '#536763',
    accent: '#C64B34', onAccent: '#FFFFFF', separator: '#D7E2DD',
    map: '#F1F7F3', dot: '#B9D0C7', edge: '#668C81', scrim: '#153D3A55',
    capsuleTop: '#FFE0C9', capsuleBorder: '#D59378', capsuleBottom: '#185A53',
    capsuleBand: '#FFFFFF', capsuleInk: '#153D3A', capsuleShadow: '#DCE9E2',
  },
  dark: {
    background: '#122420', surface: '#1D3430', text: '#F3F7F3', secondaryText: '#B7CCC3',
    accent: '#FF9C80', onAccent: '#332017', separator: '#3E5C52',
    map: '#142824', dot: '#3B5A50', edge: '#A5C4B6', scrim: '#00000077',
    capsuleTop: '#BA7353', capsuleBorder: '#E5A586', capsuleBottom: '#235E55',
    capsuleBand: '#182F2A', capsuleInk: '#F3F7F3', capsuleShadow: '#0C1B18',
  },
} as const;
