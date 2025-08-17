"use client";
import { useEffect, useState } from "react";
import { pageActiveStore } from "@/stores/store";
import ReusableDataTable, { TableColumn, TableAction } from "../../components/main-cms/data-table";
import DepartmentFormModal from "../../components/main-cms/department-form-modal";
import DeleteConfirmationModal from "../../components/main-cms/delete-confirmation-modal";
import { Trash, Pencil } from "lucide-react";

interface Employee {
  id: number;
  employee_id: string;
  departement_id: number;
  name: string;
  address: string;
  created_at: string;
  updated_at: string;
}

interface Department {
  id: number;
  departement_name: string;
  max_clock_in_time: string;
  max_clock_out_time: string;
  created_at: string;
  updated_at: string;
  employees: Employee[];
}

interface PaginationLink {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
}

interface ApiResponse {
  current_page: number;
  data: Department[];
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

export default function DepartmentPage() {
  const { setPageActive } = pageActiveStore();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editData, setEditData] = useState<Department | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchDepartments = async (page: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.BACKEND_URL}/departements?page=${page}&per_page=${perPage}`);
      
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
    setPageActive('Department');
    fetchDepartments(currentPage);
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

  const handleEdit = (department: Department) => {
    setModalMode('edit');
    setEditData(department);
    setIsModalOpen(true);
  };

  const handleDelete = (department: Department) => {
    setDeleteTarget(department);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setDeleteLoading(true);
    try {
      const response = await fetch(`${process.env.BACKEND_URL}/departements/${deleteTarget.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete department');
      }

      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
      fetchDepartments(currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete department');
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
    fetchDepartments(currentPage);
  };

  // Utility functions
  const formatTime = (time: string) => {
    return time.slice(0, 5);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const columns: TableColumn<Department>[] = [
    {
      key: 'departement_name',
      label: 'DEPARTMENT NAME',
      render: (department) => (
        <span className="font-medium text-md text-gray-700 transition-colors">
          {department.departement_name}
        </span>
      )
    },
    {
      key: 'schedule',
      label: 'SCHEDULE',
      render: (department) => (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">
              In: {formatTime(department.max_clock_in_time)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">
              Out: {formatTime(department.max_clock_out_time)}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'employees',
      label: 'EMPLOYEES',
      render: (department) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-gray-600 font-bold text-lg border border-indigo-50 shadow-sm">
            {department.employees.length}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800">
              Staff
            </span>
            <span className="text-xs text-gray-500">
              {department.employees.length === 1 ? 'Member' : 'Members'}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'CREATED DATE',
      render: (department) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-700">
            {formatDate(department.created_at)}
          </span>
          <span className="text-xs text-gray-500">
            Created
          </span>
        </div>
      )
    }
  ];

  const actions: TableAction<Department>[] = [
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
      <ReusableDataTable<Department>
        data={data?.data || []}
        pagination={paginationData}
        loading={loading}
        error={error}
        columns={columns}
        actions={actions}
        showAddButton={true}
        addButtonLabel="Add Department"
        onAdd={handleAdd}
        onPageChange={handlePageChange}
        onPerPageChange={handlePerPageChange}
        title={`Total ${data?.total || 0} Departments`}
        emptyStateTitle="No departments found"
        emptyStateDescription="Get started by creating your first department"
        emptyStateIcon="📋"
      />

      <DepartmentFormModal
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
        title="Delete Department"
        message={`Are you sure you want to delete "${deleteTarget?.departement_name}" department? This will permanently remove the department and all its associated data.`}
        itemName={deleteTarget?.departement_name}
        loading={deleteLoading}
      />
    </>
  );
}