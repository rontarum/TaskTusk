import { DeviceType } from '@/hooks/use-device';
import { PlannerScoringTable } from '@/components/planner/PlannerScoringTable';
import { TaskCard } from '@/components/planner/TaskCard';
import { PlannerItem } from '@/components/planner/types';
import { scoreOf } from '@/components/planner/scoring';
import { motion } from 'framer-motion';

interface ResponsiveScoringTableProps {
  deviceType: DeviceType;
  items: PlannerItem[];
  order: string[];
  onUpdate: (id: string, patch: Partial<PlannerItem>) => void;
  onEditingChange: (editing: boolean) => void;
  onCardTap?: (id: string) => void;
  onCardEdit?: (id: string) => void;
  onCardDelete?: (id: string) => void;
  onCardDuplicate?: (id: string) => void;
  isFormOpen?: boolean;
}

export const ResponsiveScoringTable = ({
  deviceType,
  items,
  order,
  onUpdate,
  onEditingChange,
  onCardTap,
  onCardEdit,
  onCardDelete,
  onCardDuplicate,
  isFormOpen,
}: ResponsiveScoringTableProps) => {
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  const isDesktop = deviceType === 'desktop';

  // Mobile: TaskCard grid
  if (isMobile) {
    const orderedItems = order.map((id) => items.find((item) => item.id === id)).filter(Boolean) as PlannerItem[];

    // Calculate min and max scores for color interpolation (only from actual items)
    const scores = orderedItems.map(scoreOf);
    const minScore = scores.length > 0 ? Math.min(...scores) : 0;
    const maxScore = scores.length > 0 ? Math.max(...scores) : 100;

    return (
      <motion.div
        layout="position"
        className="grid gap-4"
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        {orderedItems.map((item) => (
          <TaskCard
            key={item.id}
            item={item}
            minScore={minScore}
            maxScore={maxScore}
            onTap={onCardTap}
            onEdit={onCardEdit}
            onDelete={onCardDelete}
            onDuplicate={onCardDuplicate}
            isFormOpen={isFormOpen}
          />
        ))}
      </motion.div>
    );
  }

  // Tablet: Simplified table (TODO: implement simplified 4-column table)
  // For now, use desktop table
  if (isTablet) {
    return (
      <PlannerScoringTable
        items={items}
        order={order}
        onUpdate={onUpdate}
        onEditingChange={onEditingChange}
      />
    );
  }

  // Desktop: Full PlannerScoringTable
  return (
    <PlannerScoringTable
      items={items}
      order={order}
      onUpdate={onUpdate}
      onEditingChange={onEditingChange}
    />
  );
};
