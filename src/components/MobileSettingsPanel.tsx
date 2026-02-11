import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/button';
import { useMobileSettings } from '@/hooks/use-mobile-settings';
import { useDevice } from '@/hooks/use-device';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

interface MobileSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSettingsPanel = ({ isOpen, onClose }: MobileSettingsPanelProps) => {
  const { settings, updateSetting, resetToDefaults } = useMobileSettings();
  const { capabilities, type: deviceType } = useDevice();
  const isMobile = deviceType === 'mobile';

  const showLowEndWarning = settings.enhancedEffects && isMobile;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="p-6 pb-8">
        <h2 className="text-2xl font-heading font-semibold mb-6">Настройки</h2>

        <div className="space-y-6">
          {/* Device capabilities (read-only) */}
          <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
            <h3 className="text-sm font-semibold mb-3">Возможности устройства</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Сенсорный экран</span>
                <span>{capabilities.touch ? 'Да' : 'Нет'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Гироскоп</span>
                <span>{capabilities.gyroscope ? 'Да' : 'Нет'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">GPU ускорение</span>
                <span>{capabilities.gpu ? 'Да' : 'Нет'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Web Share API</span>
                <span>{capabilities.webShare ? 'Да' : 'Нет'}</span>
              </div>
            </div>
          </div>

          {/* Settings toggles */}
          <div className="space-y-4">
            {/* Enhanced Effects */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="enhanced-effects" className="text-base font-medium">
                  Улучшенные эффекты
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Включить дополнительные анимации
                </p>
              </div>
              <Switch
                id="enhanced-effects"
                checked={settings.enhancedEffects}
                onCheckedChange={(checked) => updateSetting('enhancedEffects', checked)}
              />
            </div>

            {showLowEndWarning && (
              <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-700">
                  Улучшенные эффекты могут снизить производительность на мобильных устройствах
                </p>
              </div>
            )}

            {/* Gyroscope Tilt - Hidden on mobile */}
            {capabilities.gyroscope && !isMobile && (
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="gyroscope-tilt" className="text-base font-medium">
                    Наклон по гироскопу
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    3D эффект при наклоне устройства
                  </p>
                </div>
                <Switch
                  id="gyroscope-tilt"
                  checked={settings.gyroscopeTilt}
                  onCheckedChange={(checked) => updateSetting('gyroscopeTilt', checked)}
                />
              </div>
            )}
          </div>

          {/* Reset button */}
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => {
              resetToDefaults();
              onClose();
            }}
          >
            Сбросить настройки
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};
