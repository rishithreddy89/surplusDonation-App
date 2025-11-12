const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
console.log('API Base URL:', API_BASE_URL);

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'donor' | 'ngo' | 'logistics' | 'admin';
  location: string;
  donorType?: 'individual' | 'restaurant' | 'grocery' | 'hotel';
  ngoRegistrationId?: string;
  vehicleType?: 'bike' | 'car' | 'van' | 'truck';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  location: string;
  donorType?: string;
  ngoRegistrationId?: string;
  vehicleType?: string;
  isVerified?: boolean;
  isAadhaarVerified?: boolean;
  aadhaarMasked?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: User;
  };
  errors?: any[];
}

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    console.log('Registering with data:', data);
    console.log('Fetching:', `${API_BASE_URL}/auth/register`);
    
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Registration error response:', errorData);
      return errorData;
    }
    
    const result = await response.json();
    console.log('Registration success:', result);
    return result;
  } catch (error) {
    console.error('Network error during registration:', error);
    return {
      success: false,
      message: 'Network error. Please check if the backend server is running on port 3000.',
      errors: [],
    };
  }
};

export const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('Login error:', result);
    }
    
    return result;
  } catch (error) {
    console.error('Network error during login:', error);
    throw error;
  }
};

export const getProfile = async (token: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  
  return response.json();
};

// Token management
export const setAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const removeAuthToken = () => {
  localStorage.removeItem('auth_token');
};

export const setUser = (user: User) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const removeUser = () => {
  localStorage.removeItem('user');
};

export const logout = () => {
  removeAuthToken();
  removeUser();
};

// Surplus interfaces
export interface SurplusData {
  title: string;
  description: string;
  category: 'food' | 'clothing' | 'medical' | 'educational' | 'other';
  quantity: number;
  unit: string;
  expiryDate?: string;
  location: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  images?: string[];
}

export interface Surplus {
  _id: string;
  donorId: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate?: string;
  location: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  status: string;
  claimedBy?: string;
  logisticsPartnerId?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

// Donor API functions
export const createSurplus = async (data: SurplusData): Promise<ApiResponse<Surplus>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/donor/surplus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Create surplus error:', result);
    }

    return result;
  } catch (error) {
    console.error('Network error during surplus creation:', error);
    throw error;
  }
};

export const getDonorSurplus = async (filters?: { status?: string; category?: string }): Promise<ApiResponse<Surplus[]>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);

    const url = `${API_BASE_URL}/donor/surplus${params.toString() ? `?${params.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response.json();
  } catch (error) {
    console.error('Network error during fetch surplus:', error);
    throw error;
  }
};

export const getDonorImpact = async (): Promise<ApiResponse<any>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/donor/impact`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response.json();
  } catch (error) {
    console.error('Network error during fetch impact:', error);
    throw error;
  }
};

export const trackDonationById = async (id: string): Promise<ApiResponse<any>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/donor/tracking/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response.json();
  } catch (error) {
    console.error('Network error during track donation:', error);
    throw error;
  }
};

export const getDonorLeaderboard = async (limit = 10): Promise<ApiResponse<any>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/donor/leaderboard?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response.json();
  } catch (error) {
    console.error('Network error during fetch leaderboard:', error);
    throw error;
  }
};

export const getNGOLeaderboard = async (limit = 10): Promise<ApiResponse<any>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/ngo/leaderboard?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response.json();
  } catch (error) {
    console.error('Network error during fetch NGO leaderboard:', error);
    throw error;
  }
};

// Profile API functions
export interface UpdateProfileData {
  name?: string;
  location?: string;
  donorType?: string;
  phone?: string;
}

export const updateProfile = async (data: UpdateProfileData): Promise<ApiResponse<User>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.success && result.data?.user) {
      // Update local storage
      setUser(result.data.user);
    }

    return result;
  } catch (error) {
    console.error('Network error during profile update:', error);
    throw error;
  }
};

export const getCurrentProfile = async (): Promise<ApiResponse<User>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response.json();
  } catch (error) {
    console.error('Network error during fetch profile:', error);
    throw error;
  }
};

// NGO interfaces and API functions
export interface RequestData {
  title: string;
  description: string;
  category: 'food' | 'clothing' | 'medical' | 'educational' | 'other';
  quantity: number;
  unit: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  location: {
    address: string;
  };
  neededBy?: string;
}

export interface NGORequest {
  _id: string;
  ngoId: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  urgency: string;
  status: string;
  location: {
    address: string;
  };
  neededBy?: string;
  createdAt: string;
  updatedAt: string;
}

// NGO API functions
export const getAvailableSurplus = async (filters?: { category?: string; search?: string }): Promise<ApiResponse<Surplus[]>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);

    const url = `${API_BASE_URL}/ngo/surplus${params.toString() ? `?${params.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response.json();
  } catch (error) {
    console.error('Network error during fetch surplus:', error);
    throw error;
  }
};

export const createNGORequest = async (data: RequestData): Promise<ApiResponse<NGORequest>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/ngo/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Create request error:', result);
    }

    return result;
  } catch (error) {
    console.error('Network error during request creation:', error);
    throw error;
  }
};

export const getNGORequests = async (filters?: { status?: string }): Promise<ApiResponse<NGORequest[]>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);

    const url = `${API_BASE_URL}/ngo/request${params.toString() ? `?${params.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response.json();
  } catch (error) {
    console.error('Network error during fetch requests:', error);
    throw error;
  }
};

export const claimSurplus = async (id: string, deliveryLocation: { address: string }): Promise<ApiResponse<any>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/ngo/claim/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({ deliveryLocation }),
    });

    return response.json();
  } catch (error) {
    console.error('Network error during claim surplus:', error);
    throw error;
  }
};

export const getClaimedSurplus = async (): Promise<ApiResponse<Surplus[]>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/ngo/claimed-surplus`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response.json();
  } catch (error) {
    console.error('Network error during fetch claimed surplus:', error);
    throw error;
  }
};

export const confirmSurplusReceived = async (surplusId: string): Promise<ApiResponse<any>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/ngo/surplus/${surplusId}/confirm-received`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response.json();
  } catch (error) {
    console.error('Network error during confirm received:', error);
    throw error;
  }
};

export const getNGOImpact = async (): Promise<ApiResponse<any>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/ngo/impact`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response.json();
  } catch (error) {
    console.error('Network error during fetch NGO impact:', error);
    throw error;
  }
};

export const getUrgentNeeds = async (): Promise<ApiResponse<NGORequest[]>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/ngo/urgent-needs`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response.json();
  } catch (error) {
    console.error('Network error during fetch urgent needs:', error);
    throw error;
  }
};

export const markRequestReceived = async (requestId: string): Promise<ApiResponse<NGORequest>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/ngo/request/${requestId}/received`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response.json();
  } catch (error) {
    console.error('Network error during mark received:', error);
    throw error;
  }
};

// Notification interfaces
export interface Notification {
  _id: string;
  userId: string;
  type: 'surplus_claimed' | 'request_received' | 'delivery_update' | 'task_assigned' | 'volunteer_pickup' | 'general';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

// Notification API functions
export const getNotifications = async (unreadOnly = false): Promise<ApiResponse<{ notifications: Notification[]; unreadCount: number }>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const params = new URLSearchParams();
    if (unreadOnly) params.append('unreadOnly', 'true');

    const response = await fetch(`${API_BASE_URL}/notifications?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response.json();
  } catch (error) {
    console.error('Network error during fetch notifications:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (id: string): Promise<ApiResponse<Notification>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response.json();
  } catch (error) {
    console.error('Network error during mark notification:', error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (): Promise<ApiResponse<any>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response.json();
  } catch (error) {
    console.error('Network error during mark all notifications:', error);
    throw error;
  }
};

export const acceptSurplusRequest = async (id: string): Promise<ApiResponse<any>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/donor/surplus/${id}/accept`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response.json();
  } catch (error) {
    console.error('Network error during accept request:', error);
    throw error;
  }
};

export const rejectSurplusRequest = async (id: string): Promise<ApiResponse<any>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/donor/surplus/${id}/reject`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response.json();
  } catch (error) {
    console.error('Network error during reject request:', error);
    throw error;
  }
};

export const directDonateToNGO = async (id: string): Promise<ApiResponse<any>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/donor/surplus/${id}/direct-donate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response.json();
  } catch (error) {
    console.error('Network error during direct donate:', error);
    throw error;
  }
};

// Logistics interfaces and API functions
export interface Task {
  _id: string;
  surplusId: any;
  donorId: any;
  ngoId: any;
  logisticsPartnerId?: any;
  status: 'pending' | 'assigned' | 'picked-up' | 'in-transit' | 'delivered' | 'cancelled';
  pickupLocation: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  deliveryLocation: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  scheduledPickup?: string;
  actualPickup?: string;
  scheduledDelivery?: string;
  actualDelivery?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const getAvailableTasks = async (): Promise<ApiResponse<Task[]>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/logistics/tasks`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response.json();
  } catch (error) {
    console.error('Network error during fetch tasks:', error);
    throw error;
  }
};

export const getMyTasks = async (filters?: { status?: string }): Promise<ApiResponse<Task[]>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);

    const url = `${API_BASE_URL}/logistics/my-tasks${params.toString() ? `?${params.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response.json();
  } catch (error) {
    console.error('Network error during fetch my tasks:', error);
    throw error;
  }
};

export const acceptTask = async (taskId: string): Promise<ApiResponse<Task>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/logistics/tasks/accept/${taskId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response.json();
  } catch (error) {
    console.error('Network error during accept task:', error);
    throw error;
  }
};

export const updateTaskStatus = async (taskId: string, status: string): Promise<ApiResponse<Task>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/logistics/tasks/status/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });

    return response.json();
  } catch (error) {
    console.error('Network error during update task status:', error);
    throw error;
  }
};

export const getLogisticsPerformance = async (): Promise<ApiResponse<any>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/logistics/performance`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response.json();
  } catch (error) {
    console.error('Network error during fetch performance:', error);
    throw error;
  }
};

// Aadhaar verification interfaces and functions
export interface AadhaarStatus {
  aadhaarMasked: string | null;
  isVerified: boolean;
  verifiedAt: string | null;
}

export const startAadhaarVerification = async (aadhaar: string): Promise<ApiResponse<any>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/aadhaar/start-aadhaar-verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({ aadhaar }),
    });

    // Handle rate limiting (429) or other non-JSON responses
    if (response.status === 429) {
      return {
        success: false,
        message: 'Too many OTP requests. Please wait 15 minutes before trying again.'
      };
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else {
      // Handle non-JSON responses
      const text = await response.text();
      return {
        success: false,
        message: text || 'An error occurred'
      };
    }
  } catch (error) {
    console.error('Network error during start Aadhaar verification:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error occurred'
    };
  }
};

export const confirmAadhaarVerification = async (aadhaar: string, otp: string): Promise<ApiResponse<any>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/aadhaar/confirm-aadhaar-verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({ aadhaar, otp }),
    });

    return response.json();
  } catch (error) {
    console.error('Network error during confirm Aadhaar verification:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error occurred'
    };
  }
};

export const getAadhaarStatus = async (): Promise<ApiResponse<AadhaarStatus>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/aadhaar/aadhaar-status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response.json();
  } catch (error) {
    console.error('Network error during get Aadhaar status:', error);
    throw error;
  }
};

// Chatbot interfaces and functions
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export const sendChatMessage = async (message: string, conversationHistory: ChatMessage[] = []): Promise<ApiResponse<{ response: string; timestamp: string }>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/chatbot/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({ message, conversationHistory }),
    });

    return response.json();
  } catch (error) {
    console.error('Network error during chat:', error);
    throw error;
  }
};

export const getChatSuggestions = async (): Promise<ApiResponse<{ suggestions: string[] }>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/chatbot/suggestions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response.json();
  } catch (error) {
    console.error('Network error during fetch suggestions:', error);
    throw error;
  }
};

// Helper function for API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const token = getAuthToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    return response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Advertisement APIs
export const createAdvertisement = async (data: any) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/advertisements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    return response.json();
  } catch (error) {
    console.error('Network error during create advertisement:', error);
    throw error;
  }
};

export const getAllAdvertisements = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/advertisements`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response.json();
  } catch (error) {
    console.error('Network error during fetch advertisements:', error);
    throw error;
  }
};

export const getActiveAdvertisements = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/advertisements/active`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response.json();
  } catch (error) {
    console.error('Network error during fetch active advertisements:', error);
    throw error;
  }
};

export const updateAdvertisement = async (id: string, data: any) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/advertisements/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    return response.json();
  } catch (error) {
    console.error('Network error during update advertisement:', error);
    throw error;
  }
};

export const toggleAdvertisementStatus = async (id: string) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/advertisements/${id}/toggle`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response.json();
  } catch (error) {
    console.error('Network error during toggle advertisement:', error);
    throw error;
  }
};

export const deleteAdvertisement = async (id: string) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/advertisements/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response.json();
  } catch (error) {
    console.error('Network error during delete advertisement:', error);
    throw error;
  }
};

export const trackAdvertisementClick = async (id: string) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/advertisements/${id}/click`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response.json();
  } catch (error) {
    console.error('Network error during track click:', error);
    throw error;
  }
};

// ==================== Complaints API ====================

export interface Complaint {
  _id: string;
  userId: string;
  userRole: 'donor' | 'ngo' | 'logistics' | 'admin';
  title: string;
  description: string;
  category: 'service' | 'delivery' | 'quality' | 'behavior' | 'technical' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'resolved' | 'closed';
  relatedTo?: {
    type: 'surplus' | 'request' | 'task' | 'user';
    id: string;
  };
  proofUrls: string[];
  adminResponse?: string;
  adminId?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const createComplaint = async (complaintData: any) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/complaints`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(complaintData),
    });

    return response.json();
  } catch (error) {
    console.error('Network error during create complaint:', error);
    throw error;
  }
};

export const getUserComplaints = async (filters?: any) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const queryParams = new URLSearchParams(filters).toString();
    const url = `${API_BASE_URL}/complaints/my-complaints${queryParams ? `?${queryParams}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response.json();
  } catch (error) {
    console.error('Network error during get complaints:', error);
    throw error;
  }
};

export const getAllComplaints = async (filters?: any) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const queryParams = new URLSearchParams(filters).toString();
    const url = `${API_BASE_URL}/complaints/all${queryParams ? `?${queryParams}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response.json();
  } catch (error) {
    console.error('Network error during get all complaints:', error);
    throw error;
  }
};

export const updateComplaintStatus = async (id: string, data: any) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/complaints/${id}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    return response.json();
  } catch (error) {
    console.error('Network error during update complaint:', error);
    throw error;
  }
};

export const getComplaintStats = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/complaints/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response.json();
  } catch (error) {
    console.error('Network error during get complaint stats:', error);
    throw error;
  }
};

// ==================== Feedback API ====================

export interface Feedback {
  _id: string;
  userId: string;
  userRole: 'donor' | 'ngo' | 'logistics' | 'admin';
  type: 'general' | 'feature-request' | 'improvement' | 'appreciation' | 'bug-report';
  rating: number;
  title: string;
  description: string;
  relatedTo?: {
    type: 'surplus' | 'request' | 'task' | 'delivery';
    id: string;
  };
  proofUrls: string[];
  isPublic: boolean;
  helpful: number;
  adminReviewed: boolean;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export const createFeedback = async (feedbackData: any) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/feedback`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(feedbackData),
    });

    return response.json();
  } catch (error) {
    console.error('Network error during create feedback:', error);
    throw error;
  }
};

export const getUserFeedback = async (filters?: any) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const queryParams = new URLSearchParams(filters).toString();
    const url = `${API_BASE_URL}/feedback/my-feedback${queryParams ? `?${queryParams}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response.json();
  } catch (error) {
    console.error('Network error during get feedback:', error);
    throw error;
  }
};

export const getAllFeedback = async (filters?: any) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const queryParams = new URLSearchParams(filters).toString();
    const url = `${API_BASE_URL}/feedback/all${queryParams ? `?${queryParams}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response.json();
  } catch (error) {
    console.error('Network error during get all feedback:', error);
    throw error;
  }
};

export const getPublicFeedback = async (minRating?: number) => {
  try {
    const queryParams = minRating ? `?minRating=${minRating}` : '';
    const url = `${API_BASE_URL}/feedback/public${queryParams}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.json();
  } catch (error) {
    console.error('Network error during get public feedback:', error);
    throw error;
  }
};

export const markFeedbackHelpful = async (id: string) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/feedback/${id}/helpful`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response.json();
  } catch (error) {
    console.error('Network error during mark helpful:', error);
    throw error;
  }
};

export const reviewFeedback = async (id: string, data: any) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/feedback/${id}/review`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    return response.json();
  } catch (error) {
    console.error('Network error during review feedback:', error);
    throw error;
  }
};

export const getFeedbackStats = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/feedback/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response.json();
  } catch (error) {
    console.error('Network error during get feedback stats:', error);
    throw error;
  }
};

// ==================== Donation Feedback API ====================

export const submitDonationFeedback = async (surplusId: string, feedbackData: any) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/ngo/surplus/${surplusId}/feedback`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(feedbackData),
    });

    return response.json();
  } catch (error) {
    console.error('Network error during submit donation feedback:', error);
    throw error;
  }
};

export const volunteerPickupTask = async (taskId: string) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/logistics/volunteer/pickup/${taskId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    return response.json();
  } catch (error) {
    console.error('Network error during volunteer pickup:', error);
    throw error;
  }
};

export const completeVolunteerDelivery = async (taskId: string) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/logistics/volunteer/complete/${taskId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    return response.json();
  } catch (error) {
    console.error('Network error during volunteer delivery completion:', error);
    throw error;
  }
};

export const getVolunteerStats = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/logistics/volunteer/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    return response.json();
  } catch (error) {
    console.error('Network error during fetch volunteer stats:', error);
    throw error;
  }
};

export const getLeaderboard = async (period: string = 'all') => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/logistics/volunteer/leaderboard?period=${period}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    return response.json();
  } catch (error) {
    console.error('Network error during fetch leaderboard:', error);
    throw error;
  }
};

export const getPublicProfile = async (userId: string) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/logistics/volunteer/profile/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    return response.json();
  } catch (error) {
    console.error('Network error during fetch public profile:', error);
    throw error;
  }
};

export const generateImpactCard = async (donationId: string) => {
  return apiRequest(`/donor/impact-card/${donationId}`, { method: 'GET' });
};

export const getPublicDonorProfile = async (donorId: string) => {
  return apiRequest(`/donor/public-profile/${donorId}`, { method: 'GET' });
};

export const getTaxReceipts = async () => {
  return apiRequest('/donor/tax-receipts', { method: 'GET' });
};

export const requestTaxReceipt = async (surplusId: string, data: { donorPAN: string; donorAddress?: string }) => {
  return apiRequest(`/donor/tax-receipt/${surplusId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const get80GEligibleNGOs = async () => {
  return apiRequest('/donor/80g-ngos', { method: 'GET' });
};

export const verifyPAN = async (pan: string) => {
  return apiRequest('/donor/verify-pan', {
    method: 'POST',
    body: JSON.stringify({ pan }),
  });
};

export const downloadTaxReceipt = async (receiptId: string) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/donor/tax-receipt/download/${receiptId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to download receipt');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `80G-Tax-Receipt-${receiptId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return { success: true };
  } catch (error) {
    console.error('Download error:', error);
    return { success: false, message: 'Failed to download receipt' };
  }
};
