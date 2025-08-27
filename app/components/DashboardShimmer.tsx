// for stats cards
const Shimmer = ({ className = '' }) => (
  <div className={`animate-pulse rounded ${className}`} />
);

// Shimmer for individual stat cards
const StatCardSkeleton = () => (
  <div className=" bg-slate-100 dark:bg-slate-800 rounded-lg border p-4 flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <Shimmer className="h-4 w-20" />
      <Shimmer className="h-7 w-7 rounded-md" />
    </div>

    {/* Main value */}
    <Shimmer className="h-8 w-24" />
  </div>
);

const TabsSkeleton = () => (
  <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-fit">
    <Shimmer className="h-6 w-20 rounded" />
    <Shimmer className="h-6 w-28 rounded" />
    <Shimmer className="h-6 w-20 rounded" />
  </div>
);

export const DashboardShimmer = () => {
  return (
    <div className="">
      <div className="mb-4">
        {/* Tabs skeleton */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <TabsSkeleton />
        </div>

        {/* Stats cards skeleton */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      </div>
    </div>
  );
};

// for table area

const TableRowSkeleton = () => (
  <tr className="h-12 border-b">
    <td className="px-4 py-2">
      <div className="flex items-center gap-3">
        <Shimmer className="h-4 w-4" />
        <Shimmer className="h-4 w-24" />
      </div>
    </td>
    <td className="px-4 py-2">
      <Shimmer className="h-4 w-20" />
    </td>
    <td className="px-4 py-2">
      <Shimmer className="h-6 w-16 rounded-full" />
    </td>
    <td className="px-4 py-2">
      <Shimmer className="h-4 w-18" />
    </td>
    <td className="px-4 py-2">
      <Shimmer className="h-4 w-20" />
    </td>
  </tr>
);

// Complete table shimmer for your TableArea component
export const TableAreaShimmer = () => {
  return (
    <div className="">
      <div className="p-4 sm:p-8">
        {/* Tabs and buttons area */}
        <div className="mb-6 w-full">
          <div className="flex items-center justify-between mb-4 max-md:flex-col max-lg:gap-2 max-sm:items-start">
            {/* Tabs skeleton */}
            <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 flex gap-1">
              <Shimmer className="h-6 w-20" />
              <Shimmer className="h-6 w-24" />
              <Shimmer className="h-6 w-20" />
            </div>

            {/* Buttons skeleton */}
            <div className="flex gap-4 bg-slate-100 dark:bg-slate-800 rounded-lg max-lg:w-full max-sm:mt-4">
              <Shimmer className="h-8 w-24 max-lg:flex-1" />
              <Shimmer className="h-8 w-32 max-lg:flex-1" />
            </div>
          </div>

          {/* Table skeleton */}
          <div className="mt-9 w-full">
            <div className="rounded-md border overflow-hidden">
              <table className="w-full">
                {/* Table header */}
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr className="h-10">
                    <th className="px-4 py-2 text-left">
                      <div className="flex items-center gap-2">
                        <Shimmer className="h-4 w-4" />
                        <Shimmer className="h-4 w-20" />
                      </div>
                    </th>
                    <th className="px-4 py-2 text-left">
                      <Shimmer className="h-4 w-16" />
                    </th>
                    <th className="px-4 py-2 text-left">
                      <Shimmer className="h-4 w-12" />
                    </th>
                    <th className="px-4 py-2 text-left">
                      <Shimmer className="h-4 w-20" />
                    </th>
                    <th className="px-4 py-2 text-left">
                      <Shimmer className="h-4 w-18" />
                    </th>
                    <th className="px-4 py-2 text-left">
                      <Shimmer className="h-4 w-14" />
                    </th>
                    <th className="px-4 py-2 text-left">
                      <Shimmer className="h-4 w-4" />
                    </th>
                  </tr>
                </thead>

                {/* Table body with shimmer rows */}
                <tbody>
                  {[...Array(6)].map((_, index) => (
                    <TableRowSkeleton key={index} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination skeleton */}
      <div className="px-4 sm:px-8 py-4 border-t bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center justify-between">
          <Shimmer className="h-4 w-32" />
          <div className="flex items-center gap-2">
            <Shimmer className="h-8 w-8" />
            <Shimmer className="h-8 w-8" />
            <Shimmer className="h-8 w-8" />
            <Shimmer className="h-8 w-8" />
          </div>
          <Shimmer className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
};
