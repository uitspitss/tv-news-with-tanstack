import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { ReactNode } from 'react';

export interface PrefectureTooltipProps {
  /** 都道府県名（日本語） */
  prefectureName: string | null;
  /** ツールチップの表示/非表示 */
  isVisible: boolean;
  /** 子要素（地図要素など） */
  children: ReactNode;
  /** ツールチップの位置（オプション） */
  position?: { x: number; y: number };
}

/**
 * 都道府県名を表示するツールチップコンポーネント
 * shadcn/ui Tooltipを使用してアクセシビリティを確保
 *
 * @example
 * ```tsx
 * <PrefectureTooltip prefectureName="東京都" isVisible={true}>
 *   <path d="..." />
 * </PrefectureTooltip>
 * ```
 */
export function PrefectureTooltip({
  prefectureName,
  isVisible,
  children,
  position,
}: PrefectureTooltipProps) {
  // 都道府県名が空またはnullの場合は、ツールチップなしで子要素のみをレンダリング
  if (!prefectureName || prefectureName.trim() === '') {
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      <Tooltip open={isVisible} delayDuration={0}>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        {isVisible && (
          <TooltipContent
            side="top"
            align="center"
            className="bg-popover text-popover-foreground border border-border px-3 py-1.5 text-sm font-medium shadow-md"
            sideOffset={5}
            style={
              position
                ? {
                    position: 'fixed',
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                  }
                : undefined
            }
          >
            {prefectureName}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
