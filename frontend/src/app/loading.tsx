export default function RootRouteLoading() {
  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Top sleek instant progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-indigo-500/20 overflow-hidden">
        <div className="h-full w-1/2 bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-400 animate-pulse rounded-r-full" />
      </div>
    </div>
  );
}

