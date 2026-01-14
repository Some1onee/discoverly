export const SkeletonCard = () => {
  return (
    <div className="glass-card p-4 animate-pulse">
      <div className="skeleton w-full aspect-square rounded-lg mb-4" />
      <div className="space-y-2">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-8 w-full rounded mt-2" />
      </div>
    </div>
  );
};

export const SkeletonList = ({ count = 5 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

export const SkeletonTrackRow = () => {
  return (
    <div className="flex items-center gap-3 p-2 animate-pulse">
      <div className="skeleton w-12 h-12 rounded" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-1/2 rounded" />
        <div className="skeleton h-3 w-1/3 rounded" />
      </div>
      <div className="skeleton h-4 w-12 rounded" />
    </div>
  );
};
