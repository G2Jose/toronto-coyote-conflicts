'use client'

import { useState } from 'react'
import {
  type ColumnDef,
  type Column,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAttackStore, type Incident } from '../store/attackStore'
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowUpDownIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from 'lucide-react'
import { LocationCell } from './LocationCell'
import React from 'react'
import { formatDate } from '@/app/utils'
import dayjs from 'dayjs'

interface SortableHeaderProps<TData> {
  column: Column<TData, unknown>
  title: string
}

const SortableHeader = <TData,>({
  column,
  title,
}: SortableHeaderProps<TData>) => {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {title}
      {column.getIsSorted() === 'asc' ? (
        <ArrowUpIcon className="ml-2 h-4 w-4" />
      ) : column.getIsSorted() === 'desc' ? (
        <ArrowDownIcon className="ml-2 h-4 w-4" />
      ) : (
        <ArrowUpDownIcon className="ml-2 h-4 w-4" />
      )}
    </Button>
  )
}

const columns: ColumnDef<Incident>[] = [
  {
    id: 'expand',
    header: () => null,
    cell: ({ row }) => (
      <Button
        variant="ghost"
        onClick={() => row.toggleExpanded()}
        className="p-0 h-auto"
      >
        {row.getIsExpanded() ? (
          <ChevronDownIcon className="h-4 w-4" />
        ) : (
          <ChevronRightIcon className="h-4 w-4" />
        )}
      </Button>
    ),
  },
  {
    accessorKey: 'date',
    header: ({ column }) => (
      <SortableHeader<Incident> column={column} title="Date" />
    ),
    cell: ({ row }) => <div>{formatDate(row.getValue<string>('date'))}</div>,
    sortingFn: (rowA, rowB) => {
      const a = rowA.getValue<string>('date')
      const b = rowB.getValue<string>('date')

      console.log({ a, b })

      if (!a || !b) {
        console.log('returning 0')
        return 0
      }

      return dayjs(a).valueOf() - dayjs(b).valueOf()
    },
  },
  {
    accessorKey: 'time',
    header: ({ column }) => (
      <SortableHeader<Incident> column={column} title="Time" />
    ),
    cell: ({ row }) => <div>{row.getValue<string>('time')}</div>,
  },
  {
    accessorKey: 'dogBreed',
    header: ({ column }) => (
      <SortableHeader<Incident> column={column} title="Dog Breed" />
    ),
    cell: ({ row }) => <div>{row.getValue<string>('dogBreed')}</div>,
  },
  {
    accessorKey: 'wasLeashed',
    header: ({ column }) => (
      <SortableHeader<Incident> column={column} title="Leashed" />
    ),
    cell: ({ row }) => <div>{row.getValue<string>('wasLeashed')}</div>,
  },
  {
    accessorKey: 'dogInjured',
    header: ({ column }) => (
      <SortableHeader<Incident> column={column} title="Dog Injured" />
    ),
    cell: ({ row }) => <div>{row.getValue<string>('dogInjured')}</div>,
  },
  {
    accessorKey: 'dogWeightLb',
    header: ({ column }) => (
      <SortableHeader<Incident> column={column} title="Dog Weight (lbs)" />
    ),
    cell: ({
      row,
    }: {
      row: { getValue<T extends 'dogWeightLb'>(key: T): Incident[T] }
    }) => <div>{row.getValue('dogWeightLb')}</div>,
  },
  {
    accessorKey: 'numCoyotes',
    header: ({ column }) => (
      <SortableHeader<Incident> column={column} title="Coyotes Involved" />
    ),
    cell: ({ row }) => <div>{row.getValue<number>('numCoyotes')}</div>,
  },
  {
    accessorKey: 'lat',
    header: ({ column }) => (
      <SortableHeader<Incident> column={column} title="Latitude" />
    ),
    cell: ({ row }) => <div>{row.getValue<number>('lat')}</div>,
  },
  {
    accessorKey: 'lng',
    header: ({ column }) => (
      <SortableHeader<Incident> column={column} title="Longitude" />
    ),
    cell: ({ row }) => <div>{row.getValue<number>('lng')}</div>,
  },
  {
    accessorKey: 'location',
    header: ({ column }) => (
      <SortableHeader<Incident> column={column} title="Location" />
    ),
    cell: ({ row }) => <div>{row.getValue<string>('location')}</div>,
  },
  {
    accessorKey: 'notes',
    header: ({ column }) => (
      <SortableHeader<Incident> column={column} title="Notes" />
    ),
    cell: ({ row }) => (
      <div className="line-clamp-2">{row.getValue<string>('notes')}</div>
    ),
  },
] as const

function ExpandedRow({ incident }: { incident: Incident }) {
  return (
    <div className="p-4 bg-muted/50">
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-1 flex flex-col">
          <h4 className="font-semibold mb-2">Notes</h4>
          <div className="whitespace-pre-line">{incident.notes}</div>
        </div>
        <div className="col-span-2 flex flex-col">
          <h4 className="font-semibold mb-2">Location</h4>
          {incident.coordinates && (
            <LocationCell
              coordinates={incident.coordinates}
              incident={incident}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export function DataTable() {
  const { filteredAttacks } = useAttackStore()
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'date',
      desc: true,
    },
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    lat: false,
    lng: false,
  })
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data: filteredAttacks,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 99999,
      },
      sorting: [
        {
          id: 'date',
          desc: true,
        },
      ],
      columnVisibility: {
        lat: false,
        lng: false,
      },
    },
    enableSorting: true,
    enableColumnFilters: true,
    getRowCanExpand: () => true,
  })

  return (
    <div className="w-full bg-card text-card-foreground">
      <div className="flex items-center py-4">
        <Input
          placeholder="Search all columns..."
          value={globalFilter ?? ''}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
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
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() && 'selected'}
                    className="cursor-pointer"
                    onClick={() => row.toggleExpanded()}
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
                  {row.getIsExpanded() && (
                    <TableRow key={`${row.id}-expanded`}>
                      <TableCell colSpan={row.getVisibleCells().length}>
                        <ExpandedRow incident={row.original} />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
