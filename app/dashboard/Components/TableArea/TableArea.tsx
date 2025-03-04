'use client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useMemo, useState } from 'react';
import { HiDocumentDownload } from 'react-icons/hi';
import PaginationArea from './Pagination/PaginationArea';
import { salesColumns } from './SalesColumn';
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSalesStore } from '@/app/useSalesStore';
import { SaleType } from '@/app/types';
import Papa from 'papaparse';

export interface PaginationType {
  pageIndex: number;
  pageSize: number;
}

export default function TableArea({ searchQuery }: { searchQuery: string }) {
  const { allSales, loadAllSales } = useSalesStore();
  const tabItems = [
    { value: 'All', label: 'All Deals', count: allSales.length },
    {
      value: 'high',
      label: 'High Priority',
      count: allSales.filter((d: SaleType) => d.priority === 'High').length,
    },
    {
      value: 'medium',
      label: 'Medium Priority',
      count: allSales.filter((d: SaleType) => d.priority === 'Medium').length,
    },
    {
      value: 'low',
      label: 'low Priority',
      count: allSales.filter((d: SaleType) => d.priority === 'Low').length,
    },
  ];

  const [activeTab, setActiveTab] = useState('All');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationType>({
    pageIndex: 0,
    pageSize: 8,
  });

  const { isLoading } = useSalesStore();

  useEffect(() => {
    loadAllSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //filter data based on the active tab

  const filteredData = useMemo(() => {
    if (activeTab === 'All') {
      return allSales;
    }
    return allSales.filter(
      (data: SaleType) => data.priority.toLowerCase() === activeTab
    );
  }, [activeTab, allSales]);

  const table = useReactTable({
    data: filteredData,
    columns: salesColumns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination,
      sorting,
      columnFilters,
    },
    onPaginationChange: setPagination,
  });

  useEffect(() => {
    table.getColumn('customerName')?.setFilterValue(searchQuery);
  }, [searchQuery, table]);

  function downloadCSV() {
    const tableData = table.getRowModel().rows.map((row) => {
      return row.getVisibleCells().reduce((acc, cell) => {
        const columnName =
          typeof cell.column.columnDef.header === 'string'
            ? cell.column.columnDef.header
            : cell.column.id; // Use column ID if header is not a string

        let value = cell.getValue();

        // 🟢 Ensure value is a valid date before formatting
        if (cell.column.id === 'contactDate' && value) {
          if (typeof value === 'string' || typeof value === 'number') {
            const dateValue = new Date(value);
            if (!isNaN(dateValue.getTime())) {
              value = dateValue.toLocaleDateString('en-IN'); // Format as DD/MM/YYYY
            } else {
              value = ''; // If invalid, set empty
            }
          }
        }

        // 🟢 Fix Deal Value Encoding (Replace ₹ with Rs.)
        if (cell.column.id === 'dealValue' && typeof value === 'string') {
          value = value.replace(/₹/g, 'Rs.');
        }

        acc[columnName] = value;
        return acc;
      }, {});
    });

    // 🟢 Convert Data to CSV
    const csv = Papa.unparse(tableData);

    // 🟢 Create Blob with UTF-8 BOM (Fixes encoding issues)
    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);

    // 🟢 Create and Trigger Download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'table-data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <Card className="sm:m-6 shadow-none overflow-hidden">
      <div className="p-4 sm:p-8">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value)}
          className="mb-6 w-full "
        >
          <div className="flex items-center justify-between mb-4 max-md:flex-col  max-lg:gap-2 max-sm:items-start ">
            <TabsList className="h-10 max-sm:flex max-sm:flex-col max-sm:h-[132px] max-sm:w-full bg-primary-foreground">
              {tabItems.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={`flex items-center gap-2 h-8 rounded-md transition-all ${
                    activeTab === tab.value
                      ? 'bg-primary text-white max-sm:w-full'
                      : 'text-gray-600'
                  }`}
                  onClick={() => setActiveTab(tab.value)}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`size-5 rounded-full ${
                      activeTab === tab.value ? 'text-primary' : 'text-gray-500'
                    } text-[11px]`}
                  >
                    {tab.count}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
            <Button
              onClick={downloadCSV}
              className="flex bg-gradient-to-r from-blue-600 to-blue-400 items-center gap-2 max-lg:w-full max-sm:mt-4"
            >
              <HiDocumentDownload className="size-5" />
              <span>Download as CSV</span>
            </Button>
          </div>

          {tabItems.map((tab) => (
            <TabsContent
              key={tab.value}
              value={tab.value}
              className="w-full mt-9"
            >
              {activeTab === tab.value && (
                //table
                <span>
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader className=" overflow-hidden">
                        {table.getHeaderGroups().map((headerGroup) => (
                          <TableRow key={headerGroup.id} className="h-10">
                            {headerGroup.headers.map((header) => {
                              return (
                                <TableHead key={header.id}>
                                  {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                      )}
                                </TableHead>
                              );
                            })}
                          </TableRow>
                        ))}
                      </TableHeader>
                      <TableBody>
                        {table.getRowModel().rows?.length ? (
                          table.getRowModel().rows.map((row) => (
                            <TableRow
                              className="h-12"
                              key={row.id}
                              data-state={row.getIsSelected() && 'selected'}
                            >
                              {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        ) : isLoading ? (
                          Array.from({ length: 4 }).map((_, index) => (
                            <TableRow key={`shimmer-${index}`} className="h-12">
                              {table.getAllColumns().map((column, colIndex) => (
                                <TableCell key={`shimmer-cell-${colIndex}`}>
                                  <div className="animate-shimmer bg-gradient-to-r from-transparent via-gray-400/20 to-transparent w-full h-4 rounded"></div>
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={table.getAllColumns().length}
                              className="h-24 text-center"
                            >
                              No results.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </span>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
      {/* pagination */}
      <PaginationArea
        table={table}
        pagination={pagination}
        setPagination={setPagination}
      />
    </Card>
  );
}
