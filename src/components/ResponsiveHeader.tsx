import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DonateButton } from '@/components/DonateButton';
import { DeviceType } from '@/hooks/use-device';
import { cn } from '@/lib/utils';

interface ResponsiveHeaderProps {
  deviceType: DeviceType;
  onMenuToggle?: () => void;
  isBottomSheetOpen?: boolean;
  className?: string;
}

export const ResponsiveHeader = ({
  deviceType,
  onMenuToggle,
  isBottomSheetOpen = false,
  className,
}: ResponsiveHeaderProps) => {
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';

  // Height variants: mobile 56px, tablet 60px, desktop 64px
  const height = isMobile ? 'h-14' : isTablet ? 'h-[60px]' : 'h-16';

  return (
    <motion.header
      className={cn(
        'sticky top-0 z-50 border-b border-border/40 bg-background/45 backdrop-blur-md',
        className
      )}
      animate={{ 
        height: isMobile ? 56 : isTablet ? 60 : 64,
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className={cn('mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8', height)}>
        {/* Left: Logo + Title */}
        <div className="flex min-w-0 items-center gap-3">
          <div className={cn(
            'flex items-center justify-center overflow-hidden',
            isMobile ? 'h-8 w-8' : 'h-10 w-10'
          )}>
            <img src="/icon.png" alt="" className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0">
            <h1 className={cn(
              'font-semibold font-heading',
              isMobile ? 'text-sm' : 'text-base'
            )}>
              TASKTUSK
            </h1>
            {/* Hide tagline on mobile */}
            {!isMobile && (
              <p className="text-xs text-muted-foreground font-body">
                Выполняй задачи в верном порядке
              </p>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex shrink-0 items-center gap-2 h-full">
          <DonateButton />
          <div className="flex items-center">
            <ThemeToggle />
          </div>
          
          {/* Hamburger menu (mobile only) */}
          {isMobile && onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Открыть меню"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
};
