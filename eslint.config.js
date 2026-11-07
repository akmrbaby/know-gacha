const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
module.exports = defineConfig([expoConfig, { ignores: ['dist/**'] }, {
  // SDK 58 UI packages expose their entry points through package exports.
  files: ['src/components/native-ui/AppIcon.tsx', 'src/components/native-ui/AppSheet.tsx'],
  settings: { 'import/resolver': { typescript: { conditionNames: ['types', 'expo-source', 'react-native', 'import', 'default'] } } },
}]);
