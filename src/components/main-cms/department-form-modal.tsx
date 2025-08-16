import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Spinner
} from "@heroui/react";
import { Clock, Building2 } from "lucide-react";

interface Department {
  id: number;
  departement_name: string;
  max_clock_in_time: string;
  max_clock_out_time: string;
  created_at: string;
  updated_at: string;
  employees: any[];
}

interface DepartmentFormData {
  departement_name: string;
  max_clock_in_time: string;
  max_clock_out_time: string;
}

interface DepartmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: Department | null;
  mode: 'create' | 'edit';
}

export default function DepartmentFormModal({
  isOpen,
  onClose,
  onSuccess,
  editData = null,
  mode
}: DepartmentFormModalProps) {
  const [formData, setFormData] = useState<DepartmentFormData>({
    departement_name: '',
    max_clock_in_time: '08:00',
    max_clock_out_time: '17:00'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<DepartmentFormData>>({});

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && editData) {
        setFormData({
          departement_name: editData.departement_name,
          max_clock_in_time: editData.max_clock_in_time,
          max_clock_out_time: editData.max_clock_out_time
        });
      } else {
        setFormData({
          departement_name: '',
          max_clock_in_time: '08:00',
          max_clock_out_time: '17:00'
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, editData]);

  const handleInputChange = (field: keyof DepartmentFormData, value: string) => {
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
    const newErrors: Partial<DepartmentFormData> = {};

    if (!formData.departement_name.trim()) {
      newErrors.departement_name = 'Department name is required';
    } else if (formData.departement_name.trim().length < 2) {
      newErrors.departement_name = 'Department name must be at least 2 characters';
    }

    if (!formData.max_clock_in_time) {
      newErrors.max_clock_in_time = 'Clock in time is required';
    }

    if (!formData.max_clock_out_time) {
      newErrors.max_clock_out_time = 'Clock out time is required';
    }

    if (formData.max_clock_in_time && formData.max_clock_out_time) {
      const clockIn = new Date(`2024-01-01T${formData.max_clock_in_time}:00`);
      const clockOut = new Date(`2024-01-01T${formData.max_clock_out_time}:00`);

      if (clockIn >= clockOut) {
        newErrors.max_clock_out_time = 'Clock out time must be after clock in time';
      }
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
        ? 'http://localhost:8000/api/departements'
        : `http://localhost:8000/api/departements/${editData?.id}`;

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
        throw new Error(errorData.message || `Failed to ${mode} department`);
      }

      onSuccess();
      onClose();
      
    } catch (error) {
      console.error(`Error ${mode}ing department:`, error);
      alert(error instanceof Error ? error.message : `Failed to ${mode} department`);
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
              <Building2 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {mode === 'create' ? 'Add New Department' : 'Edit Department'}
              </h2>
              <p className="text-sm text-gray-500 font-normal">
                {mode === 'create' 
                  ? 'Create a new department with working hours' 
                  : 'Update department information and working hours'
                }
              </p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-6">
            <div className="space-y-2">
              <Input
                label="Department Name"
                placeholder="Enter department name (e.g., IT, HR, Finance)"
                value={formData.departement_name}
                onValueChange={(value) => handleInputChange('departement_name', value)}
                isInvalid={!!errors.departement_name}
                errorMessage={errors.departement_name}
                startContent={
                  <Building2 className="w-4 h-4 text-gray-400 pointer-events-none flex-shrink-0" />
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

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Working Hours</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Input
                    type="time"
                    label="Clock In Time"
                    value={formData.max_clock_in_time}
                    onValueChange={(value) => handleInputChange('max_clock_in_time', value)}
                    isInvalid={!!errors.max_clock_in_time}
                    errorMessage={errors.max_clock_in_time}
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
                    type="time"
                    label="Clock Out Time"
                    value={formData.max_clock_out_time}
                    onValueChange={(value) => handleInputChange('max_clock_out_time', value)}
                    isInvalid={!!errors.max_clock_out_time}
                    errorMessage={errors.max_clock_out_time}
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

              {formData.max_clock_in_time && formData.max_clock_out_time && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-indigo-700 font-medium">Working Hours:</span>
                    <span className="text-indigo-600">
                      {formData.max_clock_in_time} - {formData.max_clock_out_time}
                    </span>
                  </div>
                </div>
              )}
            </div>
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
            disabled={loading}
            className="font-medium px-6"
            radius="lg"
            startContent={loading ? <Spinner size="sm" color="white" /> : null}
          >
            {loading 
              ? (mode === 'create' ? 'Creating...' : 'Updating...') 
              : (mode === 'create' ? 'Create Department' : 'Update Department')
            }
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}