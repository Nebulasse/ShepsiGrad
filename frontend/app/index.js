import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';

// Должен совпадать с именем директории, содержащей маршруты
const Root = () => {
  return <ExpoRoot context={require.context('./', true, /\.(js|jsx|ts|tsx)$/)} />;
};

registerRootComponent(Root); 