import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const MOCK_USERS = {
  'admin@apexdental.com': {
    id: 'mock-admin-id',
    name: 'Sneha Rao',
    email: 'admin@apexdental.com',
    role: 'Admin',
    contactNumber: '+91 98765-01001',
  },
  'doctor.jane@apexdental.com': {
    id: 'mock-doctor-jane-id',
    name: 'Dr. Jane Patel',
    email: 'doctor.jane@apexdental.com',
    role: 'Dentist',
    contactNumber: '+91 98765-01012',
    specialization: 'Orthodontist',
  },
  'doctor.bob@apexdental.com': {
    id: 'mock-doctor-bob-id',
    name: 'Dr. Bob Malhotra',
    email: 'doctor.bob@apexdental.com',
    role: 'Dentist',
    contactNumber: '+91 98765-01023',
    specialization: 'Endodontist',
  },
  'reception@apexdental.com': {
    id: 'mock-reception-id',
    name: 'Priya Sharma',
    email: 'reception@apexdental.com',
    role: 'Receptionist',
    contactNumber: '+91 98765-01034',
  },
  'finance@apexdental.com': {
    id: 'mock-finance-id',
    name: 'Oscar Nair',
    email: 'finance@apexdental.com',
    role: 'Accountant',
    contactNumber: '+91 98765-01045',
  },
  'assistant@apexdental.com': {
    id: 'mock-assistant-id',
    name: 'Dilip Sen',
    email: 'assistant@apexdental.com',
    role: 'Dental Assistant',
    contactNumber: '+91 98765-01056',
  },
};

// Async Thunks - Mocked for Offline/Local Database Fallback
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const emailLower = credentials.email.toLowerCase().trim();
      const mockUser = MOCK_USERS[emailLower] || {
        id: 'mock-user-id',
        name: emailLower.split('@')[0].replace('.', ' '),
        email: emailLower,
        role: emailLower.includes('doctor') ? 'Dentist' : emailLower.includes('finance') ? 'Accountant' : emailLower.includes('admin') ? 'Admin' : 'Receptionist',
      };
      
      const responseData = {
        success: true,
        token: 'mock-jwt-token-xyz',
        user: mockUser,
      };

      localStorage.setItem('token', responseData.token);
      localStorage.setItem('user', JSON.stringify(responseData.user));
      return responseData;
    } catch (err) {
      return rejectWithValue(err.message || 'Login failed');
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/check',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (!token || !userStr) throw new Error('No cached token found');
      
      return JSON.parse(userStr);
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return rejectWithValue(err.message || 'Token check failed');
    }
  }
);

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
