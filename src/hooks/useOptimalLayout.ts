import { useMemo } from 'react';

const TARGET_ASPECT_RATIO = 16 / 9;

interface LayoutProps {
  containerWidth: number;
  containerHeight: number;
  streamCount: number;
}

interface LayoutResult {
  columns: number;
  rows: number;
  cellWidth: number;
  cellHeight: number;
}

/**
 * This is the "Magic Grid" algorithm. It calculates the optimal layout 
 * to maximize the size of each 16:9 cell within a given container,
 * ensuring there is no wasted space.
 */
export function useOptimalLayout({ containerWidth, containerHeight, streamCount }: LayoutProps): LayoutResult {
  return useMemo(() => {
    if (streamCount === 0 || !containerWidth || !containerHeight) {
      return { columns: 1, rows: 1, cellWidth: 0, cellHeight: 0 };
    }

    let bestLayout = { cols: 1, rows: streamCount, area: 0 };

    // Iterate through all possible column counts to find the best arrangement
    for (let cols = 1; cols <= streamCount; cols++) {
      const rows = Math.ceil(streamCount / cols);
      
      // Calculate potential cell dimensions based on width and height constraints
      const widthLimitedCellW = containerWidth / cols;
      const widthLimitedCellH = widthLimitedCellW / TARGET_ASPECT_RATIO;
      
      const heightLimitedCellH = containerHeight / rows;
      const heightLimitedCellW = heightLimitedCellH * TARGET_ASPECT_RATIO;
      
      let currentArea = 0;
      
      // Determine which dimension is the limiting factor for this column count
      if (widthLimitedCellH * rows <= containerHeight) {
        // The layout is limited by width
        currentArea = widthLimitedCellW * widthLimitedCellH;
      } else {
        // The layout is limited by height
        currentArea = heightLimitedCellW * heightLimitedCellH;
      }
      
      // If this layout results in larger cells, it's our new best option
      if (currentArea > bestLayout.area) {
        bestLayout = { cols, rows, area: currentArea };
      }
    }
    
    // Recalculate the final, precise dimensions based on the best layout found
    const finalCellW = containerWidth / bestLayout.cols;
    const finalCellH = finalCellW / TARGET_ASPECT_RATIO;
    
    if (finalCellH * bestLayout.rows <= containerHeight) {
        return { columns: bestLayout.cols, rows: bestLayout.rows, cellWidth: finalCellW, cellHeight: finalCellH };
    } else {
        const finalH = containerHeight / bestLayout.rows;
        const finalW = finalH * TARGET_ASPECT_RATIO;
        return { columns: bestLayout.cols, rows: bestLayout.rows, cellWidth: finalW, cellHeight: finalH };
    }

  }, [containerWidth, containerHeight, streamCount]);
}