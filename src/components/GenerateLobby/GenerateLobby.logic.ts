import { useState } from 'react';
import { lobbyApi, type GenerateLobbyRequest } from '@services/api';

interface FieldError {
  field: string;
  message: string;
}

// Internal form state interface (uses dateType for UI)
interface GenerateLobbyFormData {
  dateType: string;
  timeSlots: string[];
  mode: string;
  subModes: string[];
  region: string;
  price: number;
}

export const useGenerateLobbyLogic = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState<string | null>(null);

  // Get tomorrow's date as default
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  };

  // Form state (internal - uses dateType)
  const [formData, setFormData] = useState<GenerateLobbyFormData>({
    dateType: getTomorrowDate(),
    timeSlots: [],
    mode: 'BR',
    subModes: [],
    region: 'Asia',
    price: 50,
  });

  const closeModal = () => {
    setError(null);
    setFieldErrors({});
    setSuccess(null);
    // Reset form
    setFormData({
      dateType: getTomorrowDate(),
      timeSlots: [],
      mode: 'BR',
      subModes: [],
      region: 'Asia',
      price: 50,
    });
  };

  const handleTimeSlotAdd = (timeSlot: string) => {
    if (timeSlot.trim() && !formData.timeSlots.includes(timeSlot.trim())) {
      setFormData((prev) => ({
        ...prev,
        timeSlots: [...prev.timeSlots, timeSlot.trim()],
      }));
    }
  };

  const handleTimeSlotRemove = (timeSlot: string) => {
    setFormData((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((ts) => ts !== timeSlot),
    }));
  };

  const handleSubModeToggle = (subMode: string) => {
    setFormData((prev) => {
      const isSelected = prev.subModes.includes(subMode);
      return {
        ...prev,
        subModes: isSelected
          ? prev.subModes.filter((sm) => sm !== subMode)
          : [...prev.subModes, subMode],
      };
    });
  };

  // Map API field names to form field names
  const mapApiFieldToFormField = (apiField: string): string => {
    // Handle array fields like "timeSlots[0]"
    if (apiField.startsWith('timeSlots[')) {
      const match = apiField.match(/timeSlots\[(\d+)\]/);
      if (match) {
        const index = parseInt(match[1]);
        return `timeSlots.${index}`;
      }
      return 'timeSlots';
    }
    
    // Map API field names to form field names
    const fieldMap: Record<string, string> = {
      'date': 'dateType',
      'dateType': 'dateType',
      'timeSlots': 'timeSlots',
      'mode': 'mode',
      'subModes': 'subModes',
      'region': 'region',
      'price': 'price',
    };
    
    return fieldMap[apiField] || apiField;
  };
  
  // Parse errors from API response - handle both array format and object format
  const parseApiErrors = (errors: FieldError[] | Record<string, string[]>): Record<string, string[]> => {
    const parsed: Record<string, string[]> = {};
    
    // Handle array format: [{field: "date", message: "..."}, ...]
    if (Array.isArray(errors)) {
      errors.forEach((error) => {
        const field = mapApiFieldToFormField(error.field);
        if (!parsed[field]) {
          parsed[field] = [];
        }
        parsed[field].push(error.message);
      });
    } 
    // Handle object format: {date: ["error1", "error2"], ...}
    else if (typeof errors === 'object') {
      Object.keys(errors).forEach((field) => {
        const mappedField = mapApiFieldToFormField(field);
        if (!parsed[mappedField]) {
          parsed[mappedField] = [];
        }
        if (Array.isArray(errors[field])) {
          parsed[mappedField].push(...errors[field]);
        }
      });
    }
    
    return parsed;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSuccess(null);

    setIsSubmitting(true);
    try {
      // Transform payload: API expects "date" but we use "dateType" internally
      const apiPayload: GenerateLobbyRequest = {
        date: formData.dateType, // Map dateType to date for API
        timeSlots: formData.timeSlots,
        mode: formData.mode,
        subModes: formData.subModes,
        region: formData.region,
        price: formData.price,
      };
      
      const response = await lobbyApi.generateLobbies(apiPayload);
      if (response.success) {
        setSuccess(response.message || 'Lobbies generated successfully!');
        setFieldErrors({});
      } else {
        setError(response.message || 'Failed to generate lobbies');
      }
    } catch (err: any) {
      console.error('Failed to generate lobbies:', err);
      
      // Check if error has errors array (validation errors) - API format: {errors: [{field, message}, ...]}
      if (err?.errors && Array.isArray(err.errors)) {
        const parsedErrors = parseApiErrors(err.errors);
        setFieldErrors(parsedErrors);
        setError(err?.message || 'Validation failed');
      } 
      // Handle errors from response.data.errors array
      else if (err?.response?.data?.errors) {
        if (Array.isArray(err.response.data.errors)) {
          // Array format: [{field: "date", message: "..."}, ...]
          const parsedErrors = parseApiErrors(err.response.data.errors);
          setFieldErrors(parsedErrors);
        } else if (typeof err.response.data.errors === 'object') {
          // Object format: {date: ["error1", "error2"], ...}
          const parsedErrors = parseApiErrors(err.response.data.errors);
          setFieldErrors(parsedErrors);
        }
        setError(err?.response?.data?.message || err?.message || 'Validation failed');
      } 
      // Check if error object itself has errors property (direct from API)
      else if (err?.errors && typeof err.errors === 'object' && !Array.isArray(err.errors)) {
        const parsedErrors = parseApiErrors(err.errors);
        setFieldErrors(parsedErrors);
        setError(err?.message || 'Validation failed');
      }
      else {
        // Generic error
      setError(err?.message || 'Failed to generate lobbies. Please try again.');
        setFieldErrors({});
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to get error for a specific field
  const getFieldError = (fieldName: string, index?: number): string[] => {
    const key = index !== undefined ? `${fieldName}.${index}` : fieldName;
    return fieldErrors[key] || [];
  };

  return {
    isSubmitting,
    error,
    fieldErrors,
    getFieldError,
    success,
    formData,
    setFormData,
    handleTimeSlotAdd,
    handleTimeSlotRemove,
    handleSubModeToggle,
    handleSubmit,
    closeModal,
  };
};

