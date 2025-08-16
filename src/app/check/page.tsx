"use client";
import { useEffect, useState } from "react";
import { pageActiveStore } from "@/stores/store";
import { 
  Card, 
  CardBody, 
  Button, 
  Select, 
  SelectItem, 
  Spinner,
  Chip,
  Divider
} from "@heroui/react";
import { 
  Clock, 
  User, 
  CheckCircle, 
  LogIn, 
  LogOut, 
  Calendar,
  Building2,
  AlertCircle,
  RefreshCw
} from "lucide-react";

interface Employee {
  id: number;
  employee_id: string;
  departement_id: number;
  name: string;
  address: string;
  created_at: string;
  updated_at: string;
  departement?: {
    id: number;
    departement_name: string;
    max_clock_in_time: string;
    max_clock_out_time: string;
  };
}

interface AttendanceRecord {
  id: number;
  employee_id: number;
  date: string;
  clock_in_time: string;
  clock_out_time: string | null;
  created_at: string;
  updated_at: string;
}

interface AttendanceResponse {
  message: string;
  attendance: AttendanceRecord;
}

interface TodayAttendanceResponse {
  data: AttendanceRecord | null;
}

export default function AttendancePage() {
  const { setPageActive } = pageActiveStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  
  // Loading states
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkOutLoading, setCheckOutLoading] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  
  // Status states
  const [lastAction, setLastAction] = useState<{
    type: 'check-in' | 'check-out';
    message: string;
    time: string;
  } | null>(null);

  // Update current time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
      setCurrentDate(now.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setPageActive('Attendance');
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchTodayAttendance();
    }
  }, [selectedEmployee]);

  const fetchEmployees = async () => {
    try {
      setEmployeesLoading(true);
      const response = await fetch('http://localhost:8000/api/employees?per_page=100');
      
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      
      const result = await response.json();
      setEmployees(result.data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      alert('Failed to load employees');
    } finally {
      setEmployeesLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    if (!selectedEmployee) return;

    try {
      setAttendanceLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`http://localhost:8000/api/attendance/today?employee_id=${selectedEmployee.id}&date=${today}`);
      
      if (response.ok) {
        const result: TodayAttendanceResponse = await response.json();
        setTodayAttendance(result.data);
      } else {
        setTodayAttendance(null);
      }
    } catch (error) {
      console.error('Error fetching today attendance:', error);
      setTodayAttendance(null);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!selectedEmployee) {
      alert('Please select an employee first');
      return;
    }

    try {
      setCheckInLoading(true);
      const response = await fetch('http://localhost:8000/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_id: selectedEmployee.id
        })
      });

      const result: AttendanceResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to check in');
      }

      setLastAction({
        type: 'check-in',
        message: result.message,
        time: result.attendance.clock_in_time
      });

      setTodayAttendance(result.attendance);
    } catch (error) {
      console.error('Error checking in:', error);
      alert(error instanceof Error ? error.message : 'Failed to check in');
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!selectedEmployee) {
      alert('Please select an employee first');
      return;
    }

    if (!todayAttendance) {
      alert('No check-in record found for today');
      return;
    }

    try {
      setCheckOutLoading(true);
      const response = await fetch('http://localhost:8000/api/attendance', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_id: selectedEmployee.id
        })
      });

      const result: AttendanceResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to check out');
      }

      setLastAction({
        type: 'check-out',
        message: result.message,
        time: result.attendance.clock_out_time || ''
      });

      setTodayAttendance(result.attendance);
    } catch (error) {
      console.error('Error checking out:', error);
      alert(error instanceof Error ? error.message : 'Failed to check out');
    } finally {
      setCheckOutLoading(false);
    }
  };

  const getAttendanceStatus = () => {
    if (!todayAttendance) return 'Not checked in';
    if (!todayAttendance.clock_out_time) return 'Checked in';
    return 'Completed';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Checked in': return 'warning';
      case 'Completed': return 'success';
      default: return 'default';
    }
  };

  const formatTime = (timeString: string) => {
    return timeString ? timeString.slice(0, 5) : '-';
  };

  const canCheckIn = selectedEmployee && !todayAttendance;
  const canCheckOut = selectedEmployee && todayAttendance && !todayAttendance.clock_out_time;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <Card className="border border-gray-200 shadow-sm">
        <CardBody className="p-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className="w-6 h-6 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">Employee Attendance</h1>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-mono font-bold text-indigo-600">{currentTime}</p>
              <p className="text-sm text-gray-600">{currentDate}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Employee Selection */}
      <Card className="border border-gray-200 shadow-sm">
        <CardBody className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Select Employee</h2>
            </div>
            
            <Select
              label="Employee"
              placeholder="Choose an employee to record attendance"
              selectedKeys={selectedEmployee ? [selectedEmployee.id.toString()] : []}
              onSelectionChange={(keys) => {
                const selectedKey = Array.from(keys)[0] as string;
                const employee = employees.find(emp => emp.id.toString() === selectedKey);
                setSelectedEmployee(employee || null);
                setLastAction(null);
              }}
              isLoading={employeesLoading}
              startContent={<User className="w-4 h-4 text-gray-400" />}
              classNames={{
                trigger: "h-16 bg-gray-50 border-gray-200 hover:bg-gray-100",
                label: "text-gray-700 font-medium",
                value: "text-sm"
              }}
              radius="lg"
              size="lg"
            >
              {employees.map((employee) => (
                <SelectItem 
                  key={employee.id.toString()} 
                  value={employee.id.toString()}
                  textValue={`${employee.name} (${employee.employee_id})`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{employee.name}</span>
                    <span className="text-xs text-gray-500">
                      ID: {employee.employee_id} | {employee.departement?.departement_name || 'No Department'}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Selected Employee Info & Attendance Status */}
      {selectedEmployee && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Employee Info */}
          <Card className="border border-gray-200 shadow-sm">
            <CardBody className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Employee Info</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Name:</span>
                    <span className="font-medium text-gray-900">{selectedEmployee.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Employee ID:</span>
                    <span className="font-medium text-gray-900">{selectedEmployee.employee_id}</span>
                  </div>
                  {selectedEmployee.departement && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Department:</span>
                        <span className="font-medium text-gray-900">{selectedEmployee.departement.departement_name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Working Hours:</span>
                        <span className="font-medium text-gray-900">
                          {formatTime(selectedEmployee.departement.max_clock_in_time)} - {formatTime(selectedEmployee.departement.max_clock_out_time)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Today's Attendance */}
          <Card className="border border-gray-200 shadow-sm">
            <CardBody className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Today's Attendance</h3>
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    onPress={fetchTodayAttendance}
                    isLoading={attendanceLoading}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>

                {attendanceLoading ? (
                  <div className="flex justify-center py-4">
                    <Spinner size="sm" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Status:</span>
                      <Chip
                        size="sm"
                        color={getStatusColor(getAttendanceStatus())}
                        variant="flat"
                      >
                        {getAttendanceStatus()}
                      </Chip>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Check In:</span>
                      <span className="font-medium text-gray-900">
                        {todayAttendance?.clock_in_time ? formatTime(todayAttendance.clock_in_time) : '-'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Check Out:</span>
                      <span className="font-medium text-gray-900">
                        {todayAttendance?.clock_out_time ? formatTime(todayAttendance.clock_out_time) : '-'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Action Buttons */}
      {selectedEmployee && (
        <Card className="border border-gray-200 shadow-sm">
          <CardBody className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  color="primary"
                  size="lg"
                  onPress={handleCheckIn}
                  isLoading={checkInLoading}
                  isDisabled={!canCheckIn}
                  startContent={!checkInLoading && <LogIn className="w-5 h-5" />}
                  className="h-16 font-medium"
                  radius="lg"
                >
                  {checkInLoading ? 'Checking In...' : 'Check In'}
                </Button>

                <Button
                  color="secondary"
                  size="lg"
                  onPress={handleCheckOut}
                  isLoading={checkOutLoading}
                  isDisabled={!canCheckOut}
                  startContent={!checkOutLoading && <LogOut className="w-5 h-5" />}
                  className="h-16 font-medium"
                  radius="lg"
                >
                  {checkOutLoading ? 'Checking Out...' : 'Check Out'}
                </Button>
              </div>

              {!canCheckIn && !canCheckOut && todayAttendance && (
                <div className="flex items-center gap-2 justify-center text-green-600 bg-green-50 p-3 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Attendance completed for today</span>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Last Action Status */}
      {lastAction && (
        <Card className="border border-green-200 bg-green-50 shadow-sm">
          <CardBody className="p-6">
            <div className="flex items-center gap-3">
              {lastAction.type === 'check-in' ? 
                <LogIn className="w-6 h-6 text-green-600" /> : 
                <LogOut className="w-6 h-6 text-green-600" />
              }
              <div>
                <p className="font-medium text-green-800">{lastAction.message}</p>
                <p className="text-sm text-green-600">
                  Time: {formatTime(lastAction.time)}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Instructions */}
      {!selectedEmployee && (
        <Card className="border border-blue-200 bg-blue-50 shadow-sm">
          <CardBody className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800 mb-2">How to use:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>1. Select an employee from the dropdown above</li>
                  <li>2. Click "Check In" when the employee arrives</li>
                  <li>3. Click "Check Out" when the employee leaves</li>
                  <li>4. View attendance status and working hours information</li>
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}