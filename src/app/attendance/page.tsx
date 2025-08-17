"use client";
import { useEffect, useState } from "react";
import { pageActiveStore } from "@/stores/store";
import ReusableDataTable, { TableColumn } from "../../components/main-cms/data-table";
import { Button, Input, Select, SelectItem, Chip, Card, CardBody } from "@heroui/react";
import { Calendar, Clock, Users, Filter, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface Department {
  id: number;
  departement_name: string;
  max_clock_in_time: string;
  max_clock_out_time: string;
  created_at: string;
  updated_at: string;
}

interface AttendanceRecord {
  id: string | number;
  employee_id: number;
  employee_name: string;
  departement: Department | null;
  date: string;
  clock_in_time: string;
  status_in: string;
  clock_out_time: string;
  status_out: string;
}

interface PaginationLink {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
}

interface ApiResponse {
  current_page: number;
  data: AttendanceRecord[];
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

interface AttendanceStats {
  onTime: number;
  late: number;
  early: number;
  total: number;
}

export default function AttendanceReportPage() {
  const { setPageActive } = pageActiveStore();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [departmentsLoading, setDepartmentsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [hasFilter, setHasFilter] = useState<boolean>(false);

  const [stats, setStats] = useState<AttendanceStats>({
    onTime: 0,
    late: 0,
    early: 0,
    total: 0
  });

  useEffect(() => {
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(lastWeek.toISOString().split('T')[0]);
  }, []);

  const fetchDepartments = async () => {
    try {
      setDepartmentsLoading(true);
      const response = await fetch(`${process.env.BACKEND_URL}/departements?per_page=100`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }
      
      const result = await response.json();
      setDepartments(result.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setDepartmentsLoading(false);
    }
  };

  const fetchAttendanceReport = async (page: number) => {
    if (!startDate || !endDate) return;

    try {
      setLoading(true);
      let url = `${process.env.BACKEND_URL}/attendance/report?page=${page}&per_page=${perPage}&start_date=${startDate}&end_date=${endDate}`;
      
      if (selectedDepartment) {
        url += `&department_id=${selectedDepartment}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch attendance data');
      }
      
      const result: ApiResponse = await response.json();
      
      const dataWithIds = result.data.map((record, index) => ({
        ...record,
        id: `${record.employee_id}_${record.date}_${index}`
      }));
      
      setData({
        ...result,
        data: dataWithIds
      });
      calculateStats(dataWithIds);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (records: AttendanceRecord[]) => {
    const stats = records.reduce((acc, record) => {
      acc.total++;
      
      if (record.status_in === 'tepat waktu') {
        acc.onTime++;
      } else if (record.status_in === 'terlambat') {
        acc.late++;
      }
      
      return acc;
    }, { onTime: 0, late: 0, early: 0, total: 0 });

    setStats(stats);
  };

  useEffect(() => {
    setPageActive('Attendance History');
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      setHasFilter(true);
      fetchAttendanceReport(currentPage);
    }
  }, [currentPage, perPage, startDate, endDate, selectedDepartment]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
    fetchAttendanceReport(1);
  };

  const handleClearFilters = () => {
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);
    
    setStartDate(lastWeek.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
    setSelectedDepartment('');
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString ? timeString.slice(0, 5) : '-';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'tepat waktu':
        return 'success';
      case 'terlambat':
        return 'danger';
      case 'lebih awal':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'tepat waktu':
        return <CheckCircle className="w-3 h-3" />;
      case 'terlambat':
        return <XCircle className="w-3 h-3" />;
      case 'lebih awal':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const columns: TableColumn<AttendanceRecord>[] = [
    {
      key: 'employee_info',
      label: 'EMPLOYEE',
      render: (record) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800">
            {record.employee_name}
          </span>
          <span className="text-sm text-gray-500">
            ID: {record.employee_id}
          </span>
        </div>
      )
    },
    {
      key: 'department',
      label: 'DEPARTMENT',
      render: (record) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-700">
            {record.departement?.departement_name || 'N/A'}
          </span>
          {record.departement && (
            <span className="text-xs text-gray-500">
              {formatTime(record.departement.max_clock_in_time)} - {formatTime(record.departement.max_clock_out_time)}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'date',
      label: 'DATE',
      render: (record) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-700">
            {formatDate(record.date)}
          </span>
        </div>
      )
    },
    {
      key: 'clock_in',
      label: 'CLOCK IN',
      render: (record) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-gray-700">
              {formatTime(record.clock_in_time)}
            </span>
          </div>
          <Chip
            size="sm"
            color={getStatusColor(record.status_in)}
            variant="flat"
            startContent={getStatusIcon(record.status_in)}
            classNames={{
              base: "px-2 py-1",
              content: "text-xs font-medium"
            }}
          >
            {record.status_in}
          </Chip>
        </div>
      )
    },
    {
      key: 'clock_out',
      label: 'CLOCK OUT',
      render: (record) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-gray-700">
              {formatTime(record.clock_out_time)}
            </span>
          </div>
          <Chip
            size="sm"
            color={getStatusColor(record.status_out)}
            variant="flat"
            startContent={getStatusIcon(record.status_out)}
            classNames={{
              base: "px-2 py-1",
              content: "text-xs font-medium"
            }}
          >
            {record.status_out}
          </Chip>
        </div>
      )
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
    <div className="space-y-6">
      <div className="px-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border border-none-50 shadow-none">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Records</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="border border-none-50 shadow-none">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">On Time</p>
                  <p className="text-2xl font-bold text-green-600">{stats.onTime}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="border border-none-50 shadow-none">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Late</p>
                  <p className="text-2xl font-bold text-red-600">{stats.late}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="border border-none-50 shadow-none">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">On Time Rate</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {stats.total > 0 ? Math.round((stats.onTime / stats.total) * 100) : 0}%
                  </p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-full">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <Card className="border border-indigo-50 shadow-none">
          <CardBody className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                type="date"
                label="Start Date"
                value={startDate}
                onValueChange={setStartDate}
                classNames={{
                  inputWrapper: "h-16 bg-gray-50 border-none-50",
                  label: "text-gray-700 font-medium"
                }}
                radius="lg"
              />

              <Input
                type="date"
                label="End Date"
                value={endDate}
                onValueChange={setEndDate}
                classNames={{
                  inputWrapper: "h-16 bg-gray-50 border-none-50",
                  label: "text-gray-700 font-medium"
                }}
                radius="lg"
              />

              <Select
                label="Department"
                placeholder="Select department"
                selectedKeys={selectedDepartment ? [selectedDepartment] : []}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as string;
                  setSelectedDepartment(selectedKey || '');
                }}
                isLoading={departmentsLoading}
                classNames={{
                  trigger: "h-16 bg-gray-50 border-none-50",
                  label: "text-gray-700 font-medium"
                }}
                radius="lg"
              >
                {[
                  <SelectItem key="" >All Departments</SelectItem>,
                  ...departments.map((dept) => (
                    <SelectItem key={dept.id.toString()}>
                      {dept.departement_name}
                    </SelectItem>
                  ))
                ]}
              </Select>

              <div className="flex gap-2">
                <Button
                  color="primary"
                  onPress={handleFilterChange}
                  className="font-medium flex-1"
                  radius="lg"
                  startContent={<Filter className="w-4 h-4" />}
                >
                  Apply Filter
                </Button>
                <Button
                  variant="light"
                  onPress={handleClearFilters}
                  className="font-medium"
                  radius="lg"
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <ReusableDataTable<AttendanceRecord>
        data={data?.data || []}
        pagination={paginationData}
        loading={loading}
        error={error}
        columns={columns}
        onPageChange={handlePageChange}
        onPerPageChange={handlePerPageChange}
        title={`Attendance Report - ${data?.total || 0} Records`}
        emptyStateTitle="No attendance records found"
        emptyStateDescription={hasFilter ? "Try adjusting your filter criteria" : "No attendance data available for the selected period"}
        emptyStateIcon="📅"
      />
    </div>
  );
}