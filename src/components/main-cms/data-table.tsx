import { ReactNode } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Button,
  Pagination,
  Select,
  SelectItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from "@heroui/react";
import { Plus, EllipsisVertical } from "lucide-react";

export interface TableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (item: T, index: number) => ReactNode;
}

export interface TableAction<T> {
  key: string;
  label: string;
  icon?: ReactNode;
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  onAction: (item: T) => void;
}

export interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface ReusableDataTableProps<T> {

  data: T[];
  pagination?: PaginationData;
  loading?: boolean;
  error?: string;
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  showAddButton?: boolean;
  addButtonLabel?: string;
  onAdd?: () => void;
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  perPageOptions?: number[];
  title?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  emptyStateIcon?: string;
  tableClassNames?: {
    wrapper?: string;
    th?: string;
    td?: string;
    tr?: string;
  };
}

export default function ReusableDataTable<T extends { id: number | string }>({
  data,
  pagination,
  loading = false,
  error,
  columns,
  actions = [],
  showAddButton = false,
  addButtonLabel = "Add Item",
  onAdd,
  onPageChange,
  onPerPageChange,
  perPageOptions = [5, 10, 25, 50],
  title,
  emptyStateTitle = "No data found",
  emptyStateDescription = "Get started by adding your first item",
  emptyStateIcon = "📋",
  tableClassNames = {}
}: ReusableDataTableProps<T>) {

  const getRowNumber = (index: number) => {
    return pagination 
      ? ((pagination.current_page - 1) * pagination.per_page) + index + 1 
      : index + 1;
  };

  const defaultTableClassNames = {
    th: "bg-transparent text-gray-700 font-bold text-sm uppercase tracking-wider border-b-2 border-indigo-50 py-5 first:pl-8 last:pr-8",
    td: "border-b border-gray-100 py-5 first:pl-8 last:pr-8",
    tr: "hover:bg-[#F7F7FF] transition-all duration-300 cursor-pointer group",
    ...tableClassNames
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="text-red-700 font-medium">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 space-y-4">
      {showAddButton && onAdd && (
        <div className="flex justify-end items-center">
          <Button 
            color="primary"
            startContent={<Plus className="w-5 h-5" />}
            onPress={onAdd}
            className="font-semibold px-5 py-5 shadow-lg hover:shadow-xl transition-all duration-300 text-sm"
            radius="lg"
          >
            {addButtonLabel}
          </Button>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-indigo-50 overflow-hidden backdrop-blur-sm">
        <div className="px-8 py-4 border-b border-indigo-50">
          <div className="flex justify-between items-center">
            <div className="text-md font-semibold text-gray-600">
              {title || `Total ${pagination?.total || data.length} Items`}
            </div>
            
            {pagination && onPerPageChange && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500">Rows per page:</span>
                  <Select
                    size="sm"
                    selectedKeys={[pagination.per_page.toString()]}
                    onChange={(e) => onPerPageChange(Number(e.target.value))}
                    className="w-20"
                    classNames={{
                      trigger: "h-9 min-h-9 bg-white border-indigo-50 hover:border-indigo-50 transition-colors",
                      value: "text-sm font-medium text-gray-500",
                      popoverContent: "bg-white shadow-lg border border-indigo-50"
                    }}
                    radius="lg"
                  >
                    {perPageOptions.map(option => (
                      <SelectItem key={option.toString()}>{option.toString()}</SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-full border border-indigo-50">
                  Page {pagination.current_page}
                </div>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Spinner size="lg" color="primary" />
          </div>
        ) : (
          <>
            <Table 
              aria-label="Data table"
              removeWrapper
              classNames={defaultTableClassNames}
            >
              <TableHeader>
                {[
                  <TableColumn key="row-number" className="text-center w-20">#</TableColumn>,
                  ...columns.map((column) => (
                    <TableColumn 
                      key={column.key}
                      className={`${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : ''} ${column.width || ''}`}
                    >
                      {column.label}
                    </TableColumn>
                  )),
                  ...(actions.length > 0 ? [
                    <TableColumn key="actions" className="text-center w-24">ACTIONS</TableColumn>
                  ] : [])
                ]}
              </TableHeader>
              
              <TableBody>
                {data.map((item, index) => {
                  const cells = [
                    <TableCell key="row-number">
                      <div className="flex items-center justify-center">
                        <div className="w-8 h-8 flex items-center justify-center text-gray-600 font-bold text-sm">
                          {getRowNumber(index)}
                        </div>
                      </div>
                    </TableCell>,
                    
                    ...columns.map((column) => (
                      <TableCell key={column.key}>
                        <div className={column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : ''}>
                          {column.render ? column.render(item, index) : (item as any)[column.key]}
                        </div>
                      </TableCell>
                    )),
                    
                    ...(actions.length > 0 ? [
                      <TableCell key="actions">
                        <Dropdown>
                          <DropdownTrigger>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              className="text-gray-500 hover:text-gray-700 hover:bg-indigo-50 transition-all duration-200"
                              radius="lg"
                            >
                              <EllipsisVertical className="w-5 h-5" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu aria-label="Actions">
                            {actions.map((action) => (
                              <DropdownItem 
                                key={action.key}
                                startContent={action.icon}
                                onPress={() => action.onAction(item)}
                                color={action.color}
                              >
                                {action.label}
                              </DropdownItem>
                            ))}
                          </DropdownMenu>
                        </Dropdown>
                      </TableCell>
                    ] : [])
                  ];

                  return (
                    <TableRow key={item.id}>
                      {cells}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {pagination && (
              <div className="px-8 py-5 border-t border-indigo-50">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium text-gray-600">
                    {pagination.total > 0 ? (
                      <span>Showing {pagination.from} to {pagination.to} of {pagination.total} entries</span>
                    ) : (
                      <span>No entries found</span>
                    )}
                  </div>

                  {onPageChange && (
                    <div className="flex items-center gap-2">
                      <Pagination
                        total={pagination.last_page || 1}
                        page={pagination.current_page || 1}
                        onChange={onPageChange}
                        showControls
                        showShadow
                        color="primary"
                        size="sm"
                        classNames={{
                          wrapper: "gap-1 overflow-visible",
                          cursor: "text-white font-bold border-none",
                          prev: "bg-white hover:bg-indigo-50 border border-indigo-50 shadow-sm text-indigo-950 font-medium",
                          next: "bg-white hover:bg-indigo-50 border border-indigo-50 shadow-sm text-indigo-950 font-medium"
                        }}
                        radius="lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {data.length === 0 && (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <div className="text-gray-400 text-2xl">{emptyStateIcon}</div>
                </div>
                <div className="text-gray-500 text-xl font-semibold mb-2">{emptyStateTitle}</div>
                <p className="text-gray-400">{emptyStateDescription}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}