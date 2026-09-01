interface VendorCardSkeletonProps {
  className?: string;
}

/** AIC SkeletonCard — hairline panel mirroring VendorCard anatomy. */
export function VendorCardSkeleton({ className = '' }: VendorCardSkeletonProps) {
  return (
    <div aria-hidden className={`flex flex-col overflow-hidden rounded-xl border border-hairline bg-canvas ${className}`}>
      <div className="relative aspect-video w-full">
        <div className="skeleton h-full w-full rounded-none" />
      </div>

      <div className="flex flex-col gap-2.5 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="skeleton h-4 w-2/3" />
          <div className="skeleton h-4 w-10 shrink-0" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="skeleton h-3 w-1/2" />
        </div>
        <div className="flex gap-2 border-t border-hairline pt-2.5">
          <div className="skeleton h-8 flex-1" />
          <div className="skeleton h-8 flex-1" />
          <div className="skeleton h-8 flex-1" />
        </div>
      </div>
    </div>
  );
}
