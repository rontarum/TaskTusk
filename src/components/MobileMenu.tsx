import { motion, PanInfo } from 'framer-motion';
import { X, Upload, Download, Trash2, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: () => void;
  onExport: () => void;
  onClear: () => void;
  onSettings: () => void;
  className?: string;
}

export const MobileMenu = ({
  isOpen,
  onClose,
  onImport,
  onExport,
  onClear,
  onSettings,
  className,
}: MobileMenuProps) => {
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    // Close if swiped right with sufficient velocity or distance
    if (velocity > 500 || offset > 100) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const menuItems = [
    { icon: Upload, label: 'Открой', onClick: onImport },
    { icon: Download, label: 'Сохрани', onClick: onExport },
    { icon: Trash2, label: 'Очисти', onClick: onClear },
  ];

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black"
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0, right: 0.5 }}
        onDragEnd={handleDragEnd}
        transition={{ type: 'spring', damping: 40, stiffness: 400 }}
        className={cn(
          'fixed top-0 right-0 bottom-0 z-50 w-[300px] bg-background shadow-2xl flex flex-col',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-heading font-semibold">Меню</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Закрыть меню"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => {
                  item.onClick();
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors text-left"
              >
                <Icon className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Settings section */}
        <div className="p-4 border-t border-border">
          <button
            onClick={() => {
              onSettings();
              onClose();
            }}
            className="w-full flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors text-left"
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">Настройки</span>
          </button>
        </div>
      </motion.div>
    </>
  );
};
