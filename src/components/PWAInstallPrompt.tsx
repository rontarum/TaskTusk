import * as React from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface PWAInstallPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => void;
}

export function PWAInstallPrompt({ isOpen, onClose, onInstall }: PWAInstallPromptProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "fixed inset-0 z-50 flex items-center justify-center p-4"
            )}
          >
            <div className="w-full max-w-sm">
              <div className="paper rounded-3xl p-6 shadow-elev">
                {/* Header with icon */}
                <div className="mb-4 flex items-center justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                    <Download className="h-7 w-7 text-primary" />
                  </div>
                </div>

                {/* Title */}
                <h2 className="mb-2 text-center text-xl font-semibold font-heading">
                  Сохраните приложение на экран
                </h2>

                {/* Description */}
                <p className="mb-6 text-center text-sm text-muted-foreground font-body">
                  Установите TaskTusk как приложение для быстрого доступа и лучшего опыта использования
                </p>

                {/* Buttons */}
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={onInstall}
                    className="h-12 w-full rounded-xl bg-primary text-primary-foreground font-body text-sm hover:bg-primary/90"
                  >
                    Добавить
                  </Button>
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="h-12 w-full rounded-xl border-destructive text-destructive font-body text-sm hover:bg-destructive/10 hover:text-destructive"
                  >
                    Потом
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
