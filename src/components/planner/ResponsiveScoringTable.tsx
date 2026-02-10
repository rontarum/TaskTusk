import { DeviceType } from '@/hooks/use-device';
import { PlannerScoringTable } from '@/components/planner/PlannerScoringTable';
import { TaskCard } from '@/components/planner/TaskCard';
import { PlannerItem } from '@/components/planner/types';
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
}: ResponsiveScoringTableProps) => {
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  const isDesktop = deviceType === 'desktop';

  // Mobile: TaskCard grid
  if (isMobile) {
    const orderedItems = order.map((id) => items.find((item) => item.id === id)).filter(Boolean) as PlannerItem[];

    return (
      <motion.div
        layout
        className="grid gap-4"
        transition={{ duration: 0.3 }}
      >
        {orderedItems.map((item) => (
          <TaskCard
            key={item.id}
            item={item}
            onTap={onCardTap}
            onEdit={onCardEdit}
            onDelete={onCardDelete}
            onDuplicate={onCardDuplicate}
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
