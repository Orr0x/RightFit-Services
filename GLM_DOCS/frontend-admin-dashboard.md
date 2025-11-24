# Frontend Admin Dashboard Development

## Overview

This document outlines the development of a comprehensive admin dashboard for the RightFit Services platform. The dashboard provides system administrators with tools to manage users, monitor operations, configure services, and analyze business metrics across all service lines (cleaning, maintenance, and customer services).

## Architecture

### Technology Stack
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Type-safe development
- **Material-UI v5**: Premium React component library
- **React Router v6**: Declarative routing
- **Redux Toolkit**: State management with RTK Query
- **React Hook Form**: Form management with validation
- **Recharts**: Data visualization and charting
- **React Query**: Server state management
- **Socket.io**: Real-time updates and notifications
- **Firebase**: Real-time database for analytics
- **Storybook**: Component development and documentation

### Project Structure
```
apps/web-admin/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── common/          # Shared components
│   │   ├── charts/          # Chart components
│   │   ├── forms/           # Form components
│   │   ├── tables/          # Table components
│   │   ├── layout/          # Layout components
│   │   └── widgets/         # Dashboard widgets
│   ├── pages/               # Page components
│   │   ├── dashboard/       # Dashboard pages
│   │   ├── users/           # User management
│   │   ├── services/        # Service management
│   │   ├── analytics/       # Analytics and reporting
│   │   ├── settings/        # System settings
│   │   ├── security/        # Security and audit
│   │   └── billing/         # Billing and payments
│   ├── hooks/               # Custom hooks
│   ├── services/            # API services
│   ├── store/               # Redux store configuration
│   ├── utils/               # Utility functions
│   ├── types/               # TypeScript definitions
│   ├── constants/           # App constants
│   ├── styles/              # Styled components and themes
│   └── assets/              # Images, icons, fonts
├── public/                  # Static assets
├── .storybook/              # Storybook configuration
└── __tests__/               # Test files
```

## Core Features

### 1. Authentication and Security

#### Multi-Factor Authentication
```typescript
// src/pages/auth/MultiFactorAuth.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  Phone,
  Security,
  VerifiedUser,
  ArrowBack,
  ArrowForward,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verifyMFA, setupMFA, validateTOTP } from '../../store/slices/authSlice';
import { RootState } from '../../store';

interface MFAFormData {
  code: string;
  phoneNumber: string;
  backupCode: string;
}

export const MultiFactorAuth: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, mfaRequired, mfaSetupRequired } = useSelector((state: RootState) => state.auth);

  const [activeStep, setActiveStep] = useState(0);
  const [qrCode, setQrCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { control, handleSubmit, formState: { errors } } = useForm<MFAFormData>();

  const steps = [
    'Verify Identity',
    'Setup Authenticator',
    'Backup Codes',
    'Complete Setup'
  ];

  useEffect(() => {
    if (mfaSetupRequired) {
      handleSetupMFA();
    }
  }, [mfaSetupRequired]);

  const handleSetupMFA = async () => {
    try {
      setLoading(true);
      const response = await dispatch(setupMFA()).unwrap();
      setQrCode(response.qrCode);
      setBackupCodes(response.backupCodes);
    } catch (error) {
      setError('Failed to setup MFA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (data: MFAFormData) => {
    try {
      setLoading(true);
      await dispatch(verifyMFA({ code: data.code })).unwrap();
      navigate('/admin/dashboard');
    } catch (error) {
      setError('Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateTOTP = async (data: MFAFormData) => {
    try {
      setLoading(true);
      const isValid = await dispatch(validateTOTP({ code: data.code })).unwrap();
      if (isValid) {
        setActiveStep((prev) => prev + 1);
      } else {
        setError('Invalid code from authenticator app');
      }
    } catch (error) {
      setError('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'primary.main' }}>
              <Security />
            </Avatar>
            <Typography variant="h5" gutterBottom>
              Multi-Factor Authentication Required
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              For enhanced security, please verify your identity using your authenticator app.
            </Typography>

            <Controller
              name="code"
              control={control}
              rules={{ required: 'Verification code is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Authentication Code"
                  placeholder="Enter 6-digit code"
                  margin="normal"
                  error={!!errors.code}
                  helperText={errors.code?.message}
                  inputProps={{ maxLength: 6, style: { letterSpacing: '0.5em' } }}
                />
              )}
            />

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleSubmit(handleVerifyCode)}
              disabled={loading}
              sx={{ mt: 2 }}
            >
              Verify and Continue
            </Button>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h5" gutterBottom>
              Setup Authenticator App
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </Typography>

            {qrCode && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Paper elevation={3} sx={{ p: 2 }}>
                  <img src={qrCode} alt="QR Code" style={{ width: 200, height: 200 }} />
                </Paper>
              </Box>
            )}

            <Controller
              name="code"
              control={control}
              rules={{ required: 'Verification code is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Enter Code from App"
                  placeholder="6-digit verification code"
                  margin="normal"
                  error={!!errors.code}
                  helperText={errors.code?.message}
                />
              )}
            />

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleSubmit(handleValidateTOTP)}
              disabled={loading}
              sx={{ mt: 2 }}
            >
              Verify Setup
            </Button>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ py: 4 }}>
            <Typography variant="h5" gutterBottom>
              Save Your Backup Codes
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              These backup codes can be used to access your account if you lose your authenticator device.
            </Typography>

            <Paper elevation={1} sx={{ p: 3, bgcolor: 'grey.50' }}>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {backupCodes.map((code, index) => (
                  <Box key={index} sx={{ py: 1 }}>
                    {code}
                  </Box>
                ))}
              </Typography>
            </Paper>

            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Store these codes in a safe place. Each code can only be used once.
              </Typography>
            </Alert>

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={() => setActiveStep((prev) => prev + 1)}
              sx={{ mt: 3 }}
            >
              I've Saved My Codes
            </Button>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'success.main' }}>
              <VerifiedUser />
            </Avatar>
            <Typography variant="h5" gutterBottom>
              MFA Setup Complete!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your account is now protected with multi-factor authentication.
            </Typography>

            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/admin/dashboard')}
            >
              Continue to Dashboard
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card sx={{ maxWidth: 600, width: '100%', mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderStepContent(activeStep)}

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            {activeStep > 0 && (
              <Button
                startIcon={<ArrowBack />}
                onClick={() => setActiveStep((prev) => prev - 1)}
              >
                Back
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
```

### 2. Admin Dashboard

#### Main Dashboard with Widgets
```typescript
// src/pages/dashboard/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Refresh,
  TrendingUp,
  Users,
  Assignment,
  AttachMoney,
  Security,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import {
  fetchDashboardMetrics,
  fetchSystemHealth,
  fetchRecentActivity,
} from '../../store/slices/dashboardSlice';
import {
  MetricCard,
  ActivityFeed,
  SystemHealthWidget,
  RevenueChart,
  UserActivityChart,
  ServiceDistributionChart,
} from '../../components/widgets';
import { RootState } from '../../store';

interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  totalJobs: number;
  completedJobs: number;
  revenue: number;
  pendingApprovals: number;
  systemAlerts: number;
}

export const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);

  const {
    metrics,
    systemHealth,
    recentActivity,
    loading,
    error,
  } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        dispatch(fetchDashboardMetrics({ timeRange })),
        dispatch(fetchSystemHealth()),
        dispatch(fetchRecentActivity()),
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  if (loading && !metrics) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading dashboard...</Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load dashboard data. Please try again.
        </Alert>
      </Box>
    );
  }

  const quickActions = [
    { title: 'User Management', icon: Users, path: '/admin/users', color: '#2196F3' },
    { title: 'Job Approvals', icon: Assignment, path: '/admin/jobs/pending', color: '#FF9800' },
    { title: 'Billing', icon: AttachMoney, path: '/admin/billing', color: '#4CAF50' },
    { title: 'Security', icon: Security, path: '/admin/security', color: '#F44336' },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Admin Dashboard
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            label={`Last updated: ${new Date().toLocaleTimeString()}`}
            variant="outlined"
            size="small"
          />
          <IconButton onClick={handleRefresh} disabled={refreshing}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* System Alerts */}
      {systemHealth?.criticalIssues?.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle2">
            {systemHealth.criticalIssues.length} critical system issue(s) require attention
          </Typography>
        </Alert>
      )}

      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Users"
            value={metrics?.totalUsers || 0}
            change={metrics?.userGrowth || 0}
            icon={<Users />}
            color="#2196F3"
            path="/admin/users"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Jobs"
            value={metrics?.activeJobs || 0}
            change={metrics?.jobGrowth || 0}
            icon={<Assignment />}
            color="#FF9800"
            path="/admin/jobs"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Revenue (MTD)"
            value={`$${metrics?.revenue?.toLocaleString() || 0}`}
            change={metrics?.revenueGrowth || 0}
            icon={<AttachMoney />}
            color="#4CAF50"
            path="/admin/billing"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="System Health"
            value={`${metrics?.systemHealth || 0}%`}
            change={0}
            icon={<TrendingUp />}
            color={metrics?.systemHealth > 90 ? '#4CAF50' : '#FF9800'}
            path="/admin/system/health"
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            {quickActions.map((action) => (
              <Grid item xs={12} sm={6} md={3} key={action.title}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
                  }}
                  onClick={() => navigate(action.path)}
                >
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Box sx={{ color: action.color, mb: 1 }}>
                      <action.icon fontSize="large" />
                    </Box>
                    <Typography variant="body2">{action.title}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Charts and Analytics */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <RevenueChart data={metrics?.revenueData || []} timeRange={timeRange} />
        </Grid>

        <Grid item xs={12} md={4}>
          <ServiceDistributionChart data={metrics?.serviceDistribution || []} />
        </Grid>

        <Grid item xs={12} md={8}>
          <UserActivityChart data={metrics?.userActivity || []} />
        </Grid>

        <Grid item xs={12} md={4}>
          <ActivityFeed activities={recentActivity || []} />
        </Grid>
      </Grid>

      {/* System Health Widget */}
      <Box sx={{ mt: 3 }}>
        <SystemHealthWidget healthData={systemHealth} />
      </Box>
    </Box>
  );
};
```

### 3. User Management

#### Advanced User Management Interface
```typescript
// src/pages/users/UserManagement.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  ListItemText,
  Badge,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Search,
  FilterList,
  MoreVert,
  Edit,
  Block,
  Security,
  PersonAdd,
  Download,
  Refresh,
  Visibility,
  Email,
  Phone,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUsers,
  updateUserStatus,
  deleteUser,
  exportUsers,
  bulkUpdateUsers,
} from '../../store/slices/userSlice';
import { RootState } from '../../store';
import { User, UserRole, UserStatus } from '../../types/user';

interface UserFormData {
  search: string;
  role: UserRole[];
  status: UserStatus[];
  dateRange: string;
}

const roles = ['admin', 'manager', 'worker', 'customer'];
const statuses = ['active', 'inactive', 'suspended', 'pending'];

export const UserManagement: React.FC = () => {
  const dispatch = useDispatch();
  const { users, loading, totalUsers, error } = useSelector((state: RootState) => state.users);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const { control, handleSubmit, watch, reset } = useForm<UserFormData>({
    defaultValues: {
      search: '',
      role: [],
      status: [],
      dateRange: 'all',
    },
  });

  const filters = watch();

  useEffect(() => {
    loadUsers();
  }, [page, rowsPerPage, filters]);

  const loadUsers = async () => {
    try {
      await dispatch(fetchUsers({
        page,
        limit: rowsPerPage,
        search: filters.search,
        role: filters.role,
        status: filters.status,
        dateRange: filters.dateRange,
      })).unwrap();
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleUserAction = (action: string, user: User) => {
    setSelectedUser(user);
    switch (action) {
      case 'edit':
        setEditDialogOpen(true);
        break;
      case 'suspend':
        handleUpdateUserStatus(user.id, 'suspended');
        break;
      case 'activate':
        handleUpdateUserStatus(user.id, 'active');
        break;
      case 'delete':
        setDeleteDialogOpen(true);
        break;
      default:
        break;
    }
    setAnchorEl(null);
  };

  const handleUpdateUserStatus = async (userId: string, status: UserStatus) => {
    try {
      await dispatch(updateUserStatus({ userId, status })).unwrap();
      loadUsers();
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await dispatch(deleteUser(selectedUser.id)).unwrap();
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleExportUsers = async () => {
    try {
      const blob = await dispatch(exportUsers(filters)).unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export users:', error);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return;

    try {
      await dispatch(bulkUpdateUsers({
        userIds: selectedUsers,
        action,
      })).unwrap();
      setSelectedUsers([]);
      loadUsers();
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  const getStatusColor = (status: UserStatus): string => {
    const colors = {
      active: '#4CAF50',
      inactive: '#9E9E9E',
      suspended: '#F44336',
      pending: '#FF9800',
    };
    return colors[status] || '#9E9E9E';
  };

  const getRoleColor = (role: UserRole): string => {
    const colors = {
      admin: '#F44336',
      manager: '#FF9800',
      worker: '#2196F3',
      customer: '#4CAF50',
    };
    return colors[role] || '#9E9E9E';
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          User Management
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExportUsers}
            disabled={loading}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => {/* Navigate to create user */}}
          >
            Add User
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Controller
              name="search"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  placeholder="Search users..."
                  size="small"
                  sx={{ minWidth: 250 }}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              )}
            />

            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Roles</InputLabel>
                  <Select
                    {...field}
                    multiple
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {roles.map((role) => (
                      <MenuItem key={role} value={role}>
                        <Checkbox checked={(field.value as string[]).includes(role)} />
                        <ListItemText primary={role.charAt(0).toUpperCase() + role.slice(1)} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    {...field}
                    multiple
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {statuses.map((status) => (
                      <MenuItem key={status} value={status}>
                        <Checkbox checked={(field.value as string[]).includes(status)} />
                        <ListItemText primary={status.charAt(0).toUpperCase() + status.slice(1)} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />

            <IconButton onClick={handleSubmit(loadUsers)} disabled={loading}>
              <Refresh />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Alert
          severity="info"
          sx={{ mb: 3 }}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" onClick={() => handleBulkAction('activate')}>
                Activate
              </Button>
              <Button size="small" onClick={() => handleBulkAction('suspend')}>
                Suspend
              </Button>
              <Button size="small" color="error" onClick={() => handleBulkAction('delete')}>
                Delete
              </Button>
            </Box>
          }
        >
          {selectedUsers.length} user(s) selected
        </Alert>
      )}

      {/* Users Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedUsers.length === users.length}
                    onChange={handleSelectAllUsers}
                  />
                </TableCell>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell>Last Active</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2">{user.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      size="small"
                      sx={{
                        backgroundColor: getRoleColor(user.role),
                        color: 'white',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.status}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(user.status),
                        color: 'white',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {user.lastActiveAt
                      ? new Date(user.lastActiveAt).toLocaleDateString()
                      : 'Never'
                    }
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setAnchorEl(e.currentTarget);
                        setSelectedUser(user);
                      }}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {users.length} of {totalUsers} users
          </Typography>
          <Pagination
            count={Math.ceil(totalUsers / rowsPerPage)}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => handleUserAction('edit', selectedUser!)}>
          <Edit sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => handleUserAction('view', selectedUser!)}>
          <Visibility sx={{ mr: 1 }} /> View Details
        </MenuItem>
        {selectedUser?.status === 'active' && (
          <MenuItem onClick={() => handleUserAction('suspend', selectedUser!)}>
            <Block sx={{ mr: 1 }} /> Suspend
          </MenuItem>
        )}
        {selectedUser?.status === 'suspended' && (
          <MenuItem onClick={() => handleUserAction('activate', selectedUser!)}>
            <Security sx={{ mr: 1 }} /> Activate
          </MenuItem>
        )}
        <MenuItem onClick={() => handleUserAction('delete', selectedUser!)} sx={{ color: 'error.main' }}>
          <Block sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user "{selectedUser?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
```

### 4. Analytics and Reporting

#### Advanced Analytics Dashboard
```typescript
// src/pages/analytics/AnalyticsDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  DatePicker,
  Tab,
  Tabs,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Download,
  Refresh,
  TrendingUp,
  TrendingDown,
  Info,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
} from 'recharts';

import {
  fetchAnalyticsData,
  generateReport,
  exportAnalytics,
} from '../../store/slices/analyticsSlice';
import {
  MetricCard,
  CustomTooltip,
  ChartContainer,
  ReportBuilder,
} from '../../components/analytics';
import { RootState } from '../../store';

interface AnalyticsData {
  revenue: Array<{ date: string; amount: number; cleaning: number; maintenance: number }>;
  users: Array<{ date: string; total: number; active: number; new: number }>;
  jobs: Array<{ date: string; completed: number; pending: number; cancelled: number }>;
  performance: Array<{ metric: string; current: number; target: number; previous: number }>;
  distribution: Array<{ name: string; value: number; color: string }>;
  trends: Array<{ period: string; growth: number; revenue: number }>;
}

const COLORS = ['#2196F3', '#FF9800', '#4CAF50', '#F44336', '#9C27B0', '#00BCD4'];

export const AnalyticsDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { analyticsData, loading, error } = useSelector((state: RootState) => state.analytics);

  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState(0);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState(['revenue', 'users', 'jobs']);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      await dispatch(fetchAnalyticsData({ timeRange, metrics: selectedMetrics })).unwrap();
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    }
  };

  const handleExportData = async () => {
    try {
      const blob = await dispatch(exportAnalytics({
        timeRange,
        metrics: selectedMetrics,
        format: 'xlsx',
      })).unwrap();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_${timeRange}_${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export analytics:', error);
    }
  };

  const handleGenerateReport = async (reportConfig: any) => {
    try {
      const blob = await dispatch(generateReport(reportConfig)).unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportConfig.name}_${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load analytics data. Please try again.
        </Alert>
      </Box>
    );
  }

  const { revenue, users, jobs, performance, distribution, trends } = analyticsData as AnalyticsData;

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Analytics & Reporting
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
            >
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
              <MenuItem value="1y">Last Year</MenuItem>
              <MenuItem value="all">All Time</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExportData}
          >
            Export
          </Button>

          <Button
            variant="contained"
            onClick={() => setReportDialogOpen(true)}
          >
            Generate Report
          </Button>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Revenue"
            value={`$${revenue?.reduce((sum, item) => sum + item.amount, 0).toLocaleString() || 0}`}
            change={trends?.[trends.length - 1]?.growth || 0}
            icon={<TrendingUp />}
            color="#4CAF50"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Users"
            value={users?.[users.length - 1]?.active?.toLocaleString() || 0}
            change={users ? ((users[users.length - 1]?.active - users[0]?.active) / users[0]?.active * 100) : 0}
            icon={<TrendingUp />}
            color="#2196F3"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Completed Jobs"
            value={jobs?.reduce((sum, item) => sum + item.completed, 0) || 0}
            change={jobs ? ((jobs[jobs.length - 1]?.completed - jobs[0]?.completed) / jobs[0]?.completed * 100) : 0}
            icon={<TrendingUp />}
            color="#FF9800"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Performance Score"
            value={`${performance?.reduce((sum, item) => sum + item.current / item.target * 100, 0) / performance?.length || 0}%`}
            change={5.2}
            icon={<TrendingUp />}
            color="#9C27B0"
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, value) => setActiveTab(value)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Revenue Analytics" />
          <Tab label="User Analytics" />
          <Tab label="Job Analytics" />
          <Tab label="Performance" />
          <Tab label="Custom Reports" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Revenue Trend
                </Typography>
                <ChartContainer>
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={revenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="cleaning"
                        stackId="1"
                        stroke="#2196F3"
                        fill="#2196F3"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="maintenance"
                        stackId="1"
                        stroke="#FF9800"
                        fill="#FF9800"
                        fillOpacity={0.6}
                      />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#4CAF50"
                        strokeWidth={2}
                        dot={{ fill: '#4CAF50' }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Revenue Distribution
                </Typography>
                <ChartContainer>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={distribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  User Growth
                </Typography>
                <ChartContainer>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={users}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#2196F3"
                        fill="#2196F3"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="active"
                        stroke="#4CAF50"
                        fill="#4CAF50"
                        fillOpacity={0.6}
                      />
                      <Line
                        type="monotone"
                        dataKey="new"
                        stroke="#FF9800"
                        strokeWidth={2}
                        dot={{ fill: '#FF9800' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Job Analytics
                </Typography>
                <ChartContainer>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={jobs}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="completed" fill="#4CAF50" />
                      <Bar dataKey="pending" fill="#FF9800" />
                      <Bar dataKey="cancelled" fill="#F44336" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance Metrics
                </Typography>
                <ChartContainer>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={performance}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar
                        name="Current"
                        dataKey="current"
                        stroke="#2196F3"
                        fill="#2196F3"
                        fillOpacity={0.6}
                      />
                      <Radar
                        name="Target"
                        dataKey="target"
                        stroke="#4CAF50"
                        fill="#4CAF50"
                        fillOpacity={0.3}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={4}>
        <ReportBuilder
          onGenerateReport={handleGenerateReport}
          availableMetrics={['revenue', 'users', 'jobs', 'performance']}
        />
      </TabPanel>

      {/* Report Generation Dialog */}
      <ReportBuilder
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        onGenerate={handleGenerateReport}
      />
    </Box>
  );
};

// Helper component for tab panels
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && children}
  </div>
);
```

### 5. System Settings and Configuration

#### System Configuration Interface
```typescript
// src/pages/settings/SystemSettings.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ExpandMore,
  Save,
  Restore,
  Security,
  Notifications,
  Palette,
  Language,
  Storage,
  Api,
  IntegrationInstructions,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSystemSettings,
  updateSystemSettings,
  resetToDefaults,
  testEmailSettings,
  exportSettings,
  importSettings,
} from '../../store/slices/settingsSlice';
import { RootState } from '../../store';

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    defaultLanguage: string;
    timezone: string;
    dateFormat: string;
    timeFormat: string;
  };
  security: {
    passwordMinLength: number;
    passwordRequireSpecialChars: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    requireMFA: boolean;
    allowedIPs: string[];
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    emailSettings: {
      smtpHost: string;
      smtpPort: number;
      smtpUser: string;
      smtpPassword: string;
      fromEmail: string;
      fromName: string;
    };
    templates: {
      welcomeEmail: string;
      jobAssigned: string;
      jobCompleted: string;
      invoiceGenerated: string;
    };
  };
  appearance: {
    primaryColor: string;
    secondaryColor: string;
    logoUrl: string;
    faviconUrl: string;
    theme: 'light' | 'dark' | 'auto';
  };
  integrations: {
    stripe: {
      enabled: boolean;
      publicKey: string;
      secretKey: string;
      webhookSecret: string;
    };
    googleMaps: {
      enabled: boolean;
      apiKey: string;
    };
    sendGrid: {
      enabled: boolean;
      apiKey: string;
    };
    twilio: {
      enabled: boolean;
      accountSid: string;
      authToken: string;
      phoneNumber: string;
    };
  };
  backup: {
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    retentionDays: number;
    backupLocation: 'local' | 'cloud' | 'both';
    cloudSettings: {
      provider: 'aws' | 'gcp' | 'azure';
      bucket: string;
      region: string;
    };
  };
}

export const SystemSettings: React.FC = () => {
  const dispatch = useDispatch();
  const { settings, loading, error, saveSuccess } = useSelector((state: RootState) => state.settings);

  const [activeSection, setActiveSection] = useState<string>('general');
  const [testEmailDialogOpen, setTestEmailDialogOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  const { control, handleSubmit, reset, formState: { isDirty } } = useForm<SystemSettings>({
    defaultValues: settings,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      reset(settings);
    }
  }, [settings, reset]);

  const loadSettings = async () => {
    try {
      await dispatch(fetchSystemSettings()).unwrap();
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSaveSettings = async (data: SystemSettings) => {
    try {
      await dispatch(updateSystemSettings(data)).unwrap();
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleResetToDefaults = async (section: string) => {
    if (window.confirm(`Are you sure you want to reset ${section} settings to defaults?`)) {
      try {
        await dispatch(resetToDefaults(section)).unwrap();
        loadSettings();
      } catch (error) {
        console.error('Failed to reset settings:', error);
      }
    }
  };

  const handleTestEmail = async () => {
    try {
      await dispatch(testEmailSettings(testEmail)).unwrap();
      alert('Test email sent successfully!');
      setTestEmailDialogOpen(false);
    } catch (error) {
      alert('Failed to send test email');
    }
  };

  const handleExportSettings = async () => {
    try {
      const blob = await dispatch(exportSettings()).unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system-settings-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export settings:', error);
    }
  };

  const sections = [
    { id: 'general', title: 'General Settings', icon: <Language /> },
    { id: 'security', title: 'Security', icon: <Security /> },
    { id: 'notifications', title: 'Notifications', icon: <Notifications /> },
    { id: 'appearance', title: 'Appearance', icon: <Palette /> },
    { id: 'integrations', title: 'Integrations', icon: <IntegrationInstructions /> },
    { id: 'backup', title: 'Backup & Recovery', icon: <Storage /> },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          System Settings
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Restore />}
            onClick={handleExportSettings}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSubmit(handleSaveSettings)}
            disabled={!isDirty || loading}
          >
            Save Changes
          </Button>
        </Box>
      </Box>

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully!
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Settings Navigation */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ p: 0 }}>
              {sections.map((section) => (
                <Box
                  key={section.id}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    backgroundColor: activeSection === section.id ? 'action.selected' : 'transparent',
                    '&:hover': { backgroundColor: 'action.hover' },
                  }}
                  onClick={() => setActiveSection(section.id)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {section.icon}
                    <Typography variant="body1">{section.title}</Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Settings Content */}
        <Grid item xs={12} md={9}>
          <form onSubmit={handleSubmit(handleSaveSettings)}>
            {activeSection === 'general' && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    General Settings
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="general.siteName"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Site Name"
                            margin="normal"
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Controller
                        name="general.defaultLanguage"
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth margin="normal">
                            <InputLabel>Default Language</InputLabel>
                            <Select {...field} label="Default Language">
                              <MenuItem value="en">English</MenuItem>
                              <MenuItem value="es">Spanish</MenuItem>
                              <MenuItem value="fr">French</MenuItem>
                              <MenuItem value="de">German</MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Controller
                        name="general.siteDescription"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            multiline
                            rows={3}
                            label="Site Description"
                            margin="normal"
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {activeSection === 'security' && (
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">Security Settings</Typography>
                    <Button
                      size="small"
                      onClick={() => handleResetToDefaults('security')}
                      startIcon={<Restore />}
                    >
                      Reset to Defaults
                    </Button>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="security.passwordMinLength"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            type="number"
                            label="Minimum Password Length"
                            margin="normal"
                            inputProps={{ min: 6, max: 32 }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Controller
                        name="security.maxLoginAttempts"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            type="number"
                            label="Max Login Attempts"
                            margin="normal"
                            inputProps={{ min: 3, max: 10 }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Controller
                        name="security.requireMFA"
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={<Switch {...field} checked={field.value} />}
                            label="Require Multi-Factor Authentication"
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Controller
                        name="security.passwordRequireSpecialChars"
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={<Switch {...field} checked={field.value} />}
                            label="Require Special Characters in Password"
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {activeSection === 'notifications' && (
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">Notification Settings</Typography>
                    <Button
                      size="small"
                      onClick={() => setTestEmailDialogOpen(true)}
                    >
                      Test Email
                    </Button>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Controller
                        name="notifications.emailEnabled"
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={<Switch {...field} checked={field.value} />}
                            label="Enable Email Notifications"
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Controller
                        name="notifications.smsEnabled"
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={<Switch {...field} checked={field.value} />}
                            label="Enable SMS Notifications"
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Controller
                        name="notifications.pushEnabled"
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={<Switch {...field} checked={field.value} />}
                            label="Enable Push Notifications"
                          />
                        )}
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="h6" gutterBottom>
                    Email Settings
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="notifications.emailSettings.smtpHost"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="SMTP Host"
                            margin="normal"
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Controller
                        name="notifications.emailSettings.smtpPort"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            type="number"
                            label="SMTP Port"
                            margin="normal"
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {activeSection === 'integrations' && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Third-Party Integrations
                  </Typography>

                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography>Stripe Payment Processing</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Controller
                            name="integrations.stripe.enabled"
                            control={control}
                            render={({ field }) => (
                              <FormControlLabel
                                control={<Switch {...field} checked={field.value} />}
                                label="Enable Stripe Integration"
                              />
                            )}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Controller
                            name="integrations.stripe.publicKey"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="Stripe Public Key"
                                margin="normal"
                                type="password"
                              />
                            )}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Controller
                            name="integrations.stripe.secretKey"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="Stripe Secret Key"
                                margin="normal"
                                type="password"
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>

                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography>Google Maps Integration</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Controller
                            name="integrations.googleMaps.enabled"
                            control={control}
                            render={({ field }) => (
                              <FormControlLabel
                                control={<Switch {...field} checked={field.value} />}
                                label="Enable Google Maps Integration"
                              />
                            )}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Controller
                            name="integrations.googleMaps.apiKey"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="Google Maps API Key"
                                margin="normal"
                                type="password"
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </CardContent>
              </Card>
            )}
          </form>
        </Grid>
      </Grid>

      {/* Test Email Dialog */}
      <Dialog open={testEmailDialogOpen} onClose={() => setTestEmailDialogOpen(false)}>
        <DialogTitle>Test Email Configuration</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Test Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestEmailDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleTestEmail} variant="contained">Send Test Email</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
```

## State Management

### Redux Store Configuration
```typescript
// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authSlice from './slices/authSlice';
import dashboardSlice from './slices/dashboardSlice';
import userSlice from './slices/userSlice';
import analyticsSlice from './slices/analyticsSlice';
import settingsSlice from './slices/settingsSlice';
import { apiSlice } from './api/apiSlice';

const persistConfig = {
  key: 'admin-root',
  storage,
  whitelist: ['auth', 'settings'],
};

const rootReducer = {
  auth: persistReducer(persistConfig, authSlice),
  dashboard: dashboardSlice,
  users: userSlice,
  analytics: analyticsSlice,
  settings: settingsSlice,
  [apiSlice.reducerPath]: apiSlice.reducer,
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

## Security Features

### Activity Logging and Audit Trail
```typescript
// src/services/auditService.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const auditApi = createApi({
  reducerPath: 'auditApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/admin/audit',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['AuditLog'],
  endpoints: (builder) => ({
    getAuditLogs: builder.query<AuditLog[], {
      page?: number;
      limit?: number;
      userId?: string;
      action?: string;
      resource?: string;
      dateRange?: string;
    }>({
      query: (params) => ({
        url: '',
        params,
      }),
      providesTags: ['AuditLog'],
    }),

    logActivity: builder.mutation<void, {
      action: string;
      resource: string;
      resourceId?: string;
      details?: Record<string, any>;
      severity?: 'low' | 'medium' | 'high' | 'critical';
    }>({
      query: (data) => ({
        url: '',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AuditLog'],
    }),

    getSecurityEvents: builder.query<AuditLog[], {
      page?: number;
      limit?: number;
      severity?: 'high' | 'critical';
      dateRange?: string;
    }>({
      query: (params) => ({
        url: '/security-events',
        params,
      }),
      providesTags: ['AuditLog'],
    }),
  }),
});

export const {
  useGetAuditLogsQuery,
  useLogActivityMutation,
  useGetSecurityEventsQuery,
} = auditApi;
```

## Performance Optimization

### Dashboard Widget Optimization
```typescript
// src/components/widgets/OptimizedWidget.tsx
import React, { memo, useMemo, useCallback } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { debounce } from 'lodash';

interface OptimizedWidgetProps {
  title: string;
  data: any[];
  type: 'chart' | 'metric' | 'table';
  onDataPointClick?: (data: any) => void;
  className?: string;
}

export const OptimizedWidget = memo<OptimizedWidgetProps>(({
  title,
  data,
  type,
  onDataPointClick,
  className,
}) => {
  // Memoize expensive computations
  const processedData = useMemo(() => {
    if (!data) return [];

    return data.map(item => ({
      ...item,
      // Process data here
    }));
  }, [data]);

  // Debounce click handler
  const handleClick = useCallback(
    debounce((dataPoint) => {
      onDataPointClick?.(dataPoint);
    }, 300),
    [onDataPointClick]
  );

  // Memoize chart rendering
  const renderContent = useMemo(() => {
    switch (type) {
      case 'chart':
        return <ChartComponent data={processedData} onClick={handleClick} />;
      case 'metric':
        return <MetricComponent data={processedData[0]} />;
      case 'table':
        return <TableComponent data={processedData} />;
      default:
        return null;
    }
  }, [type, processedData, handleClick]);

  return (
    <Card className={className}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ minHeight: 200 }}>
          {renderContent}
        </Box>
      </CardContent>
    </Card>
  );
});

OptimizedWidget.displayName = 'OptimizedWidget';
```

## Testing

### Component Testing with Jest and React Testing Library
```typescript
// __tests__/components/Dashboard.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import AdminDashboard from '../../src/pages/dashboard/AdminDashboard';
import dashboardSlice from '../../src/store/slices/dashboardSlice';

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      dashboard: dashboardSlice,
    },
    preloadedState: initialState,
  });
};

const theme = createTheme();

const renderWithProviders = (
  ui: React.ReactElement,
  { initialState = {}, store = createMockStore(initialState) } = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  );

  return render(ui, { wrapper: Wrapper });
};

describe('AdminDashboard', () => {
  const mockInitialState = {
    dashboard: {
      metrics: {
        totalUsers: 1000,
        activeUsers: 800,
        totalJobs: 500,
        completedJobs: 450,
        revenue: 50000,
        systemHealth: 95,
      },
      loading: false,
      error: null,
    },
  };

  it('renders dashboard with metrics', () => {
    renderWithProviders(<AdminDashboard />, { initialState: mockInitialState });

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('1,000')).toBeInTheDocument(); // Total Users
    expect(screen.getByText('$50,000')).toBeInTheDocument(); // Revenue
  });

  it('shows loading state', () => {
    const loadingState = {
      dashboard: {
        ...mockInitialState.dashboard,
        loading: true,
        metrics: null,
      },
    };

    renderWithProviders(<AdminDashboard />, { initialState: loadingState });

    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('handles refresh button click', async () => {
    const mockStore = createMockStore(mockInitialState);

    renderWithProviders(<AdminDashboard />, { store: mockStore });

    const refreshButton = screen.getByLabelText('refresh');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      const actions = mockStore.getActions();
      expect(actions).toContainEqual(expect.objectContaining({
        type: 'dashboard/fetchDashboardMetrics/pending',
      }));
    });
  });

  it('navigates to user management when clicking user metric card', () => {
    renderWithProviders(<AdminDashboard />, { initialState: mockInitialState });

    const userMetricCard = screen.getByText('Total Users').closest('[role="button"]');
    fireEvent.click(userMetricCard!);

    expect(window.location.pathname).toBe('/admin/users');
  });
});
```

## Deployment

### Production Build Configuration
```javascript
// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './src/index.tsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
      chunkFilename: isProduction ? '[name].[contenthash].chunk.js' : '[name].chunk.js',
      clean: true,
      publicPath: '/',
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.(js|jsx)$/,
          use: 'babel-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader', 'postcss-loader'],
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        minify: isProduction,
      }),
      ...(isProduction ? [new BundleAnalyzerPlugin({ analyzerMode: 'static' })] : []),
    ],
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      },
      runtimeChunk: 'single',
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    devServer: {
      port: 3001,
      historyApiFallback: true,
      proxy: {
        '/api': 'http://localhost:3000',
      },
    },
    performance: {
      maxAssetSize: 512000,
      maxEntrypointSize: 512000,
      hints: isProduction ? 'warning' : false,
    },
  };
};
```

This comprehensive admin dashboard provides system administrators with powerful tools to manage the entire RightFit platform, with advanced security features, real-time analytics, and extensive configuration options.