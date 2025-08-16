"use client";
import { useEffect, useState } from "react";
import { pageActiveStore } from "@/stores/store";
import ReusableDataTable, { TableColumn, TableAction } from "../../components/main-cms/data-table";
import EmployeeFormModal from "../../components/main-cms/employee-form-modal";
import DeleteConfirmationModal from "../../components/main-cms/delete-confirmation-modal";
import { Trash, Pencil, User } from "lucide-react";

interface Department {
  id: number;
  departement_name: string;
  max_clock_in_time: string;
  max_clock_out_time: string;
  created_at: string;
  updated_at: string;
}

interface Employee {
  id: number;
  employee_id: string;
  departement_id: number;
  name: string;
  address: string;
  created_at: string;
  updated_at: string;
  departement?: Department;
}

interface PaginationLink {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
}

interface ApiResponse {
  current_page: number;
  data: Employee[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export default function EmployeePage() {
  const { setPageActive } = pageActiveStore();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editData, setEditData] = useState<Employee | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchEmployees = async (page: number) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/employees?page=${page}&per_page=${perPage}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const result: ApiResponse = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPageActive('Employee');
    fetchEmployees(currentPage);
  }, [currentPage, perPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  const handleAdd = () => {
    setModalMode('create');
    setEditData(null);
    setIsModalOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setModalMode('edit');
    setEditData(employee);
    setIsModalOpen(true);
  };

  const handleDelete = (employee: Employee) => {
    setDeleteTarget(employee);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setDeleteLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/employees/${deleteTarget.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete employee');
      }

      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
      fetchEmployees(currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete employee');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    if (!deleteLoading) {
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditData(null);
  };

  const handleModalSuccess = () => {
    fetchEmployees(currentPage);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const columns: TableColumn<Employee>[] = [
    {
      key: 'employee_info',
      label: 'EMPLOYEE INFO',
      render: (employee) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <User className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800">
              {employee.name}
            </span>
            <span className="text-sm text-gray-500">
              ID: {employee.employee_id}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'department',
      label: 'DEPARTMENT',
      render: (employee) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-700">
            {employee.departement?.departement_name || 'N/A'}
          </span>
          <span className="text-xs text-gray-500">
            Department
          </span>
        </div>
      )
    },
    {
      key: 'address',
      label: 'ADDRESS',
      render: (employee) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-700">
            {employee.address}
          </span>
          <span className="text-xs text-gray-500">
            Location
          </span>
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'CREATED DATE',
      render: (employee) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-700">
            {formatDate(employee.created_at)}
          </span>
          <span className="text-xs text-gray-500">
            Created
          </span>
        </div>
      )
    }
  ];

  const actions: TableAction<Employee>[] = [
    {
      key: 'edit',
      label: 'Edit',
      icon: <Pencil className="w-4 h-4" />,
      onAction: handleEdit
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <Trash className="w-4 h-4" />,
      color: 'danger',
      onAction: handleDelete
    }
  ];

  const paginationData = data ? {
    current_page: data.current_page,
    last_page: data.last_page,
    per_page: data.per_page,
    total: data.total,
    from: data.from,
    to: data.to
  } : undefined;

  return (
    <>
      <ReusableDataTable<Employee>
        data={data?.data || []}
        pagination={paginationData}
        loading={loading}
        error={error}
        columns={columns}
        actions={actions}
        showAddButton={true}
        addButtonLabel="Add Employee"
        onAdd={handleAdd}
        onPageChange={handlePageChange}
        onPerPageChange={handlePerPageChange}
        title={`Total ${data?.total || 0} Employees`}
        emptyStateTitle="No employees found"
        emptyStateDescription="Get started by creating your first employee"
        emptyStateIcon="👥"
      />

      <EmployeeFormModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        editData={editData}
        mode={modalMode}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Employee"
        message={`Are you sure you want to delete "${deleteTarget?.name}" (${deleteTarget?.employee_id})? This will permanently remove the employee and all associated data.`}
        itemName={deleteTarget?.name}
        loading={deleteLoading}
      />
    </>
  );
}