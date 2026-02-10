import { useLocalStorageState } from '@/hooks/useLocalStorageState';
import { useDevice } from '@/hooks/use-device';

export interface MobileSettings {
  enhancedEffects: boolean;
  gyroscopeTilt: boolean;
}

const STORAGE_KEY = 'decision-planner:mobile-settings:v1';

const getDefaultSettings = (gyroscopeSupported: boolean): MobileSettings => ({
  enhancedEffects: true,
  gyroscopeTilt: gyroscopeSupported,
});

export const useMobileSettings = () => {
  const { capabilities } = useDevice();
  
  const [settings, setSettings] = useLocalStorageState<MobileSettings>(
    STORAGE_KEY,
    getDefaultSettings(capabilities.gyroscope)
  );

  const updateSetting = <K extends keyof MobileSettings>(
    key: K,
    value: MobileSettings[K]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetToDefaults = () => {
    setSettings(getDefaultSettings(capabilities.gyroscope));
  };

  return {
    settings,
    updateSetting,
    resetToDefaults,
  };
};
