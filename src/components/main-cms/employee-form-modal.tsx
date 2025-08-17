import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Spinner
} from "@heroui/react";
import { User, Building2, MapPin, Hash } from "lucide-react";

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

interface EmployeeFormData {
  employee_id: string;
  departement_id: number | string | null;
  name: string;
  address: string;
}

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: Employee | null;
  mode: 'create' | 'edit';
}

export default function EmployeeFormModal({
  isOpen,
  onClose,
  onSuccess,
  editData = null,
  mode
}: EmployeeFormModalProps) {
  const [formData, setFormData] = useState<EmployeeFormData>({
    employee_id: '',
    departement_id: null,
    name: '',
    address: ''
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<EmployeeFormData>>({});

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

  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
      
      if (mode === 'edit' && editData) {
        setFormData({
          employee_id: editData.employee_id,
          departement_id: editData.departement_id,
          name: editData.name,
          address: editData.address
        });
      } else {
        const generateEmployeeId = () => {
          const timestamp = Date.now().toString().slice(-6);
          return `EMP${timestamp}`;
        };
        
        setFormData({
          employee_id: generateEmployeeId(),
          departement_id: null,
          name: '',
          address: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, editData]);

  const handleInputChange = (field: keyof EmployeeFormData, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<EmployeeFormData> = {};

    if (!formData.employee_id.trim()) {
      newErrors.employee_id = 'Employee ID is required';
    } else if (formData.employee_id.trim().length < 3) {
      newErrors.employee_id = 'Employee ID must be at least 3 characters';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Employee name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Employee name must be at least 2 characters';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (formData.address.trim().length < 5) {
      newErrors.address = 'Address must be at least 5 characters';
    }

    if (!formData.departement_id) {
      newErrors.departement_id = 'Department is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const url = mode === 'create' 
        ? `${process.env.BACKEND_URL}/employees`
        : `${process.env.BACKEND_URL}/employees/${editData?.id}`;

      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${mode} employee`);
      }

      onSuccess();
      onClose();
      
    } catch (error) {
      console.error(`Error ${mode}ing employee:`, error);
      alert(error instanceof Error ? error.message : `Failed to ${mode} employee`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      size="2xl"
      placement="center"
      backdrop="opaque"
      classNames={{
        backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
        base: "border border-gray-200 bg-white dark:bg-gray-900",
        header: "border-b border-gray-200",
        body: "py-6",
        footer: "border-t border-gray-200"
      }}
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: "easeOut"
            }
          },
          exit: {
            y: -20,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: "easeIn"
            }
          }
        }
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {mode === 'create' ? 'Add New Employee' : 'Edit Employee'}
              </h2>
              <p className="text-sm text-gray-500 font-normal">
                {mode === 'create' 
                  ? 'Create a new employee record' 
                  : 'Update employee information'
                }
              </p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  label="Employee ID"
                  placeholder="Enter employee ID (e.g., EMP001)"
                  value={formData.employee_id}
                  onValueChange={(value) => handleInputChange('employee_id', value)}
                  isInvalid={!!errors.employee_id}
                  errorMessage={errors.employee_id}
                  startContent={
                    <Hash className="w-4 h-4 text-gray-400 pointer-events-none flex-shrink-0" />
                  }
                  classNames={{
                    input: "text-sm",
                    inputWrapper: "h-16 bg-gray-50 border-gray-200 hover:bg-gray-100 group-data-[focused=true]:bg-white",
                    label: "text-gray-700 font-medium"
                  }}
                  radius="lg"
                  size="lg"
                />
              </div>

              <div className="space-y-2">
                <Input
                  label="Full Name"
                  placeholder="Enter employee full name"
                  value={formData.name}
                  onValueChange={(value) => handleInputChange('name', value)}
                  isInvalid={!!errors.name}
                  errorMessage={errors.name}
                  startContent={
                    <User className="w-4 h-4 text-gray-400 pointer-events-none flex-shrink-0" />
                  }
                  classNames={{
                    input: "text-sm",
                    inputWrapper: "h-16 bg-gray-50 border-gray-200 hover:bg-gray-100 group-data-[focused=true]:bg-white",
                    label: "text-gray-700 font-medium"
                  }}
                  radius="lg"
                  size="lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Select
                label="Department"
                placeholder={departmentsLoading ? "Loading departments..." : "Select department"}
                selectedKeys={formData.departement_id ? [formData.departement_id.toString()] : []}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as string;
                  handleInputChange('departement_id', selectedKey ? parseInt(selectedKey) : null);
                }}
                isInvalid={!!errors.departement_id}
                errorMessage={errors.departement_id}
                isLoading={departmentsLoading}
                startContent={
                  <Building2 className="w-4 h-4 text-gray-400 pointer-events-none flex-shrink-0" />
                }
                classNames={{
                  trigger: "h-16 bg-gray-50 border-gray-200 hover:bg-gray-100 data-[focused=true]:bg-white",
                  label: "text-gray-700 font-medium",
                  value: "text-sm"
                }}
                radius="lg"
                size="lg"
              >
                {departments.map((dept) => (
                  <SelectItem key={dept.id}>
                    {dept.departement_name}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Input
                label="Address"
                placeholder="Enter employee address"
                value={formData.address}
                onValueChange={(value) => handleInputChange('address', value)}
                isInvalid={!!errors.address}
                errorMessage={errors.address}
                startContent={
                  <MapPin className="w-4 h-4 text-gray-400 pointer-events-none flex-shrink-0" />
                }
                classNames={{
                  input: "text-sm",
                  inputWrapper: "h-16 bg-gray-50 border-gray-200 hover:bg-gray-100 group-data-[focused=true]:bg-white",
                  label: "text-gray-700 font-medium"
                }}
                radius="lg"
                size="lg"
              />
            </div>

            {formData.departement_id && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-indigo-700 font-medium">Selected Department:</span>
                  <span className="text-indigo-600">
                    {departments.find(d => d.id === formData.departement_id)?.departement_name || 'Loading...'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <Button 
            variant="light" 
            onPress={handleClose}
            disabled={loading}
            className="font-medium"
            radius="lg"
          >
            Cancel
          </Button>
          <Button 
            color="primary" 
            onPress={handleSubmit}
            disabled={loading || departmentsLoading}
            className="font-medium px-6"
            radius="lg"
            startContent={loading ? <Spinner size="sm" color="white" /> : null}
          >
            {loading 
              ? (mode === 'create' ? 'Creating...' : 'Updating...') 
              : (mode === 'create' ? 'Create Employee' : 'Update Employee')
            }
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}