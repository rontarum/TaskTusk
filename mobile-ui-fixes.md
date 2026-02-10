# Mobile UI Fixes - Task List

## Главный экран

- [x] 1. Fix ThemeToggle position in header
  - ✅ ThemeToggle теперь правильно выровнена по центру

- [x] 2. Fix animation jitter in BottomSheet and MobileMenu
  - ✅ Увеличен damping (30→40) и stiffness (300→400) для более плавных анимаций

- [x] 3. Change FAB shape from circle to rounded rect
  - ✅ FAB теперь rounded-xl вместо rounded-full

- [x] 4. Fix card collapse animation
  - ✅ Добавлен ease: 'easeInOut' для плавного закрытия карточки

## Меню настроек (MobileSettingsPanel)

- [x] 5. Fix device capabilities box styling
  - ✅ bg-primary/10 с border-primary/20, rounded-xl

- [x] 6. Fix warning box border radius
  - ✅ rounded-xl вместо rounded-lg

- [x] 7. Style "Сбросить настройки" button like "Убрать всё"
  - ✅ variant="destructive"

- [x] 8. Change default settings values
  - ✅ enhancedEffects: true, gyroscopeTilt: true

- [x] 9. Remove compactMode and autoHideHeader settings
  - ✅ Удалены из MobileSettings interface
  - ✅ Удалены из UI
  - ✅ Удалён autoHide prop из ResponsiveHeader

- [x] 10. Fix switch visibility in light theme
  - ✅ bg-muted вместо bg-input для unchecked состояния

## Меню создания/изменения задачи (MobileTaskForm)

- [x] 11. Fix emoji picker button styling
  - ✅ rounded-xl, убран Smile icon, добавлен w-full

- [x] 12. Reduce TouchSlider thumb size
  - ✅ w-6 h-6 вместо w-12 h-12

- [x] 13. Style percent selector buttons
  - ✅ rounded-lg вместо rounded-lg (уже было)
  - ✅ Цветовая логика: 0,25=destructive, 50=gold, 75,100=primary

## Карточки (TaskCard)

- [x] 14. Reduce emoji and score font sizes
  - ✅ text-2xl вместо text-3xl для обоих
  - ✅ toFixed(0) вместо toFixed(1)

- [x] 15. Match desktop typography styles
  - ✅ Уже используется font-heading и font-numbers как в desktop

- [x] 16. Change swipe-right edit color
  - ✅ bg-primary вместо bg-blue-500

## ✅ Все задачи выполнены!

---

# Второй раунд исправлений

## Главный экран

- [x] 1. FAB aspect ratio (кнопка плюса сплюснутая)
  - ✅ w-14 h-14 для соотношения 1:1

## Карточки (TaskCard)

- [x] 2. Card collapse animation (резкое закрытие)
  - ✅ Добавлен AnimatePresence wrapper с ease: 'easeInOut'

## Меню создания/изменения задачи (MobileTaskForm)

- [x] 3. Emoji button width (слишком широкая)
  - ✅ w-20 h-20 вместо w-full

- [x] 4. Percent buttons border radius
  - ✅ rounded-xl вместо rounded-lg

- [x] 5. Swipe background rect styling
  - ✅ rounded-[calc(var(--radius)-0.25rem)] для соответствия радиусу карточки
  - ✅ -inset-y-0.5 для увеличения высоты на 4px

## ✅ Второй раунд завершен!

---

# Третий раунд исправлений

## Карточки (TaskCard)

- [x] 1. Swipe background появляется раньше
  - ✅ Порог изменен с 60px на 30px для более быстрой реакции

- [x] 2. Swipe background менее круглый
  - ✅ rounded-lg вместо rounded-[calc(var(--radius)-0.25rem)]

## Меню создания/изменения задачи (MobileTaskForm)

- [x] 3. Кнопка эмодзи слишком большая
  - ✅ w-14 h-14 вместо w-20 h-20
  - ✅ text-2xl вместо text-3xl для эмодзи

- [x] 4. Полноценный выбор эмодзи
  - ✅ Создан компонент MobileEmojiPicker с BottomSheet
  - ✅ Сетка 8 колонок с 128 эмодзи
  - ✅ Открывается по клику на кнопку эмодзи

## ✅ Третий раунд завершен!

---

# Четвертый раунд исправлений

## Карточки (TaskCard)

- [x] 1. Динамический цвет очков
  - ✅ Добавлен импорт scoreColor из scoring.ts
  - ✅ Вычисление minScore и maxScore в ResponsiveScoringTable
  - ✅ Передача minScore/maxScore в TaskCard
  - ✅ Применение динамического цвета через style={{ color }}
  - ✅ Цвет меняется от красного → оранжевого → зеленого в зависимости от очков

## Главный экран (Index.tsx)

- [x] 2. Кнопка сортировки на мобильном
  - ✅ Добавлена кнопка сортировки слева от FAB (right-20)
  - ✅ Размер 14×14, rounded-xl
  - ✅ Активное состояние: bg-primary
  - ✅ Неактивное: bg-background/80 с backdrop-blur
  - ✅ Анимация переворота иконки при сортировке
  - ✅ FAB изменен на rounded-xl (было rounded-2xl)

- [x] 3. Исправлена логика цветов очков
  - ✅ Убраны фиксированные значения 0 и 100
  - ✅ Теперь используются только реальные min/max из текущего списка задач
  - ✅ Самое низкое очко → рубиновый цвет
  - ✅ Среднее очко → оранжевый/желтый
  - ✅ Самое высокое очко → мятный цвет

## ✅ Четвертый раунд завершен!
