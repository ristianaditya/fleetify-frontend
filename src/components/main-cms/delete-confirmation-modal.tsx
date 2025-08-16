import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner
} from "@heroui/react";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
  loading?: boolean;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Delete",
  message,
  itemName,
  loading = false
}: DeleteConfirmationModalProps) {
  
  const handleConfirm = () => {
    onConfirm();
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
      size="md"
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
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {title}
            </h2>
          </div>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-3">
            <p className="text-gray-600">
              {message || `Are you sure you want to delete this item? This action cannot be undone.`}
            </p>
            
            {itemName && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  <span className="font-medium">Item to be deleted:</span> {itemName}
                </p>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  This action is permanent and cannot be undone.
                </p>
              </div>
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
            color="danger" 
            onPress={handleConfirm}
            disabled={loading}
            className="font-medium px-6"
            radius="lg"
            startContent={loading ? <Spinner size="sm" color="white" /> : null}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}