// import { useMemo } from 'react';

// const TARGET_ASPECT_RATIO = 16 / 9;

// interface MagicGridProps {
//   containerWidth: number;
//   containerHeight: number;
//   streamCount: number;
// }

// interface MagicGridResult {
//   columns: number;
//   rows: number;
//   cellWidth: number;
//   cellHeight: number;
// }

// /**
//  * This is the "Magic Grid" algorithm. It calculates the optimal layout 
//  * to maximize the size of each 16:9 cell within a given container,
//  * ensuring there is no wasted space.
//  */
// export function useMagicGrid({ containerWidth, containerHeight, streamCount }: MagicGridProps): MagicGridResult {
//   return useMemo(() => {
//     if (streamCount === 0 || !containerWidth || !containerHeight) {
//       return { columns: 1, rows: 1, cellWidth: 0, cellHeight: 0 };
//     }

//     let bestLayout = { cols: 1, rows: streamCount, area: 0 };

//     for (let cols = 1; cols <= streamCount; cols++) {
//       const rows = Math.ceil(streamCount / cols);
//       const widthLimitedCellW = containerWidth / cols;
//       const widthLimitedCellH = widthLimitedCellW / TARGET_ASPECT_RATIO;
//       let currentArea = 0;

//       if (widthLimitedCellH * rows <= containerHeight) {
//         currentArea = widthLimitedCellW * widthLimitedCellH;
//       } else {
//         const heightLimitedCellH = containerHeight / rows;
//         const heightLimitedCellW = heightLimitedCellH * TARGET_ASPECT_RATIO;
//         currentArea = heightLimitedCellW * heightLimitedCellH;
//       }

//       if (currentArea > bestLayout.area) {
//         bestLayout = { cols, rows, area: currentArea };
//       }
//     }
    
//     const finalCellW = containerWidth / bestLayout.cols;
//     const finalCellH = finalCellW / TARGET_ASPECT_RATIO;
    
//     if (finalCellH * bestLayout.rows <= containerHeight) {
//         return { columns: bestLayout.cols, rows: bestLayout.rows, cellWidth: finalCellW, cellHeight: finalCellH };
//     } else {
//         const finalH = containerHeight / bestLayout.rows;
//         const finalW = finalH * TARGET_ASPECT_RATIO;
//         return { columns: bestLayout.cols, rows: bestLayout.rows, cellWidth: finalW, cellHeight: finalH };
//     }

//   }, [containerWidth, containerHeight, streamCount]);
// }






import { useMemo } from 'react';

const TARGET_ASPECT_RATIO = 16 / 9;

interface MagicGridProps {
  containerWidth: number;
  containerHeight: number;
  streamCount: number;
}

interface MagicGridResult {
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
export function useMagicGrid({ containerWidth, containerHeight, streamCount }: MagicGridProps): MagicGridResult {
  return useMemo(() => {
    if (streamCount === 0 || !containerWidth || !containerHeight) {
      return { columns: 1, rows: 1, cellWidth: 0, cellHeight: 0 };
    }

    let bestLayout = { cols: 1, rows: streamCount, area: 0 };

    for (let cols = 1; cols <= streamCount; cols++) {
      const rows = Math.ceil(streamCount / cols);
      const widthLimitedCellW = containerWidth / cols;
      const widthLimitedCellH = widthLimitedCellW / TARGET_ASPECT_RATIO;
      let currentArea = 0;

      if (widthLimitedCellH * rows <= containerHeight) {
        currentArea = widthLimitedCellW * widthLimitedCellH;
      } else {
        const heightLimitedCellH = containerHeight / rows;
        const heightLimitedCellW = heightLimitedCellH * TARGET_ASPECT_RATIO;
        currentArea = heightLimitedCellW * heightLimitedCellH;
      }

      if (currentArea > bestLayout.area) {
        bestLayout = { cols, rows, area: currentArea };
      }
    }
    
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