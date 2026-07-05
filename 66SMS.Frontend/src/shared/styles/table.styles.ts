export const TABLE_STYLES = {
  pageCard:
    "relative bg-white/70 backdrop-blur-md rounded-admin border border-stone-200/30 overflow-hidden",
  cellMuted: "text-lotus-deep/80",
  cellMutedSmall: "text-lotus-deep/80 text-[12px]",
  cellIndex: "text-lotus-stone",
  cellName: "font-semibold text-lotus-deep",
  cellTruncate: "text-lotus-deep/80 truncate max-w-[300px] inline-block",
  toolbarBtn: "text-[12px] gap-1.5",
  selectionBar:
    "flex items-center gap-2 mr-auto text-[13px] text-lotus-deep font-medium bg-lotus-cream/50 px-3 py-1.5 rounded-lg border border-stone-200/50",
  sortBtn: "flex items-center gap-1.5 hover:text-lotus-leaf transition-colors",
  fetchBar: "absolute top-0 left-0 right-0 h-0.5 bg-lotus-leaf/30 overflow-hidden",
  fetchBarInner:
    "h-full w-1/3 bg-lotus-leaf animate-[slide_1s_ease-in-out_infinite]",
} as const;
