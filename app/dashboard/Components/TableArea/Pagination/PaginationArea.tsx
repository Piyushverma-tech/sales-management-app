'use client';
import { useTheme } from 'next-themes';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import PaginationSelection from './PaginationSelection';
import { Button } from '@/components/ui/button';
import { BiFirstPage, BiLastPage } from 'react-icons/bi';
import { GrFormNext, GrFormPrevious } from 'react-icons/gr';
import { Table } from '@tanstack/react-table';
import { SaleType } from '@/app/types';
import { PaginationType } from '../TableArea';

export default function PaginationArea({
  table,
  pagination,
  setPagination,
}: {
  table: Table<SaleType>;
  pagination: PaginationType;
  setPagination: Dispatch<SetStateAction<PaginationType>>;
}) {
  const { theme } = useTheme();
  const [isClient, setIsClient] = useState(false);

  const bgColor = theme === 'dark' ? 'bg-gray-900' : 'bg-white';

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div
      className={`relative w-full h-[80px] max-sm:h-[206px] max-sm:pt-4 max-sm:pb-4 overflow-hidden flex justify-between items-center px-6 ${bgColor} border-t max-sm:flex-col max-sm:gap-2`}
    >
      <PaginationSelection
        pagination={pagination}
        setPagination={setPagination}
      />
      <div className="flex gap-6 items-center max-sm:flex-col max-sm:mt-4 max-sm:gap-2">
        <span className="text-sm text-gray-500">
          Page {pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <div className="flex items-center justify-end space-x-2">
          {/* first page button */}

          <Button
            variant="outline"
            className="size-9 w-12"
            size="sm"
            onClick={() => setPagination((prev) => ({ ...prev, pageIndex: 0 }))}
            disabled={!table.getCanPreviousPage()}
          >
            <BiFirstPage />
          </Button>

          {/* previous page button */}

          <Button
            variant="outline"
            className="size-9 w-12"
            size="sm"
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                pageIndex: prev.pageIndex - 1,
              }))
            }
            disabled={!table.getCanPreviousPage()}
          >
            <GrFormPrevious />
          </Button>

          {/* next page button */}
          <Button
            variant="outline"
            className="size-9 w-12"
            size="sm"
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                pageIndex: prev.pageIndex + 1,
              }))
            }
            disabled={!table.getCanNextPage()}
          >
            <GrFormNext />
          </Button>

          {/* last page button */}
          <Button
            variant="outline"
            className="size-9 w-12"
            size="sm"
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                pageIndex: table.getPageCount() - 1,
              }))
            }
            disabled={!table.getCanNextPage()}
          >
            <BiLastPage />
          </Button>
        </div>
      </div>
    </div>
  );
}
