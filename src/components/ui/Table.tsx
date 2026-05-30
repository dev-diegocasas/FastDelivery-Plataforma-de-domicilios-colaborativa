import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

export default function Table<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = "No hay datos disponibles",
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 text-center">
        <span className="material-symbols-outlined text-[48px] text-secondary block mb-2">
          database
        </span>
        <p className="text-body-md text-secondary font-body-md">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "text-left px-4 py-3 text-label-md text-secondary font-label-md uppercase tracking-wider",
                    col.hideOnMobile && "hidden lg:table-cell",
                    col.className,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/50">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  "transition-colors",
                  onRowClick && "cursor-pointer hover:bg-surface-container",
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-4 py-3 text-body-md text-on-surface font-body-md",
                      col.hideOnMobile && "hidden lg:table-cell",
                      col.className,
                    )}
                  >
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-outline-variant">
        {data.map((item) => (
          <div
            key={keyExtractor(item)}
            onClick={() => onRowClick?.(item)}
            className={cn(
              "p-4 space-y-3",
              onRowClick && "cursor-pointer hover:bg-surface-container transition-colors",
            )}
          >
            {columns
              .filter((col) => !col.hideOnMobile)
              .map((col) => (
                <div key={col.key} className="flex items-center justify-between">
                  <span className="text-label-sm text-secondary font-label-sm uppercase mr-2">
                    {col.header}
                  </span>
                  <span className="text-body-md text-on-surface font-body-md text-right">
                    {col.render(item)}
                  </span>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
