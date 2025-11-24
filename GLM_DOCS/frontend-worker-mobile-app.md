# Frontend Worker Mobile App Development

## Overview

This document outlines the development of a React Native mobile application for RightFit workers, technicians, and contractors. The app will provide mobile access to job management, scheduling, communications, and reporting features for both cleaning and maintenance services.

## Architecture

### Technology Stack
- **React Native**: Cross-platform mobile development
- **TypeScript**: Type-safe development
- **React Navigation**: Navigation and routing
- **React Query**: Server state management
- **React Hook Form**: Form handling
- **React Native Paper**: Material Design UI components
- **Redux Toolkit**: Client state management
- **React Native Vector Icons**: Icon library
- **React Native Maps**: Map integration
- **React Native Camera**: Photo capture
- **Push Notifications**: Real-time notifications
- **SQLite**: Local data storage
- **AsyncStorage**: Simple key-value storage

### Project Structure
```
apps/worker-mobile/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── common/          # Shared components
│   │   ├── forms/           # Form components
│   │   ├── maps/            # Map components
│   │   └── media/           # Camera and media components
│   ├── screens/             # Screen components
│   │   ├── auth/            # Authentication screens
│   │   ├── dashboard/       # Dashboard screens
│   │   ├── jobs/            # Job management screens
│   │   ├── schedule/        # Schedule screens
│   │   ├── messages/        # Communication screens
│   │   ├── profile/         # Profile screens
│   │   └── settings/        # Settings screens
│   ├── navigation/          # Navigation configuration
│   ├── services/            # API services
│   ├── store/               # Redux store
│   ├── utils/               # Utility functions
│   ├── hooks/               # Custom hooks
│   ├── types/               # TypeScript definitions
│   ├── constants/           # App constants
│   └── assets/              # Images, fonts, etc.
├── android/                 # Android-specific code
├── ios/                     # iOS-specific code
├── __tests__/               # Test files
└── e2e/                     # End-to-end tests
```

## Core Features

### 1. Authentication System

#### Login & Registration
```typescript
// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { login, register } from '../../store/slices/authSlice';
import { login as loginApi } from '../../services/authService';
import { LoginRequest } from '../../types/auth';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');

  const dispatch = useDispatch();
  const navigation = useNavigation();

  const handleAuth = async () => {
    if (!email || !password || (isRegistering && !name)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      if (isRegistering) {
        const response = await loginApi.register({ name, email, password });
        dispatch(register(response.user));
        Alert.alert('Success', 'Registration successful! Please login.');
        setIsRegistering(false);
      } else {
        const response = await loginApi.login({ email, password });
        dispatch(login(response));
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isRegistering ? 'Create Account' : 'Welcome Back'}
      </Text>

      {isRegistering && (
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleAuth}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {isRegistering ? 'Register' : 'Login'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.switchButton}
        onPress={() => setIsRegistering(!isRegistering)}
      >
        <Text style={styles.switchText}>
          {isRegistering
            ? 'Already have an account? Login'
            : 'Need an account? Register'
          }
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    alignItems: 'center',
  },
  switchText: {
    color: '#007AFF',
    fontSize: 14,
  },
});
```

#### Biometric Authentication
```typescript
// src/services/biometricService.ts
import ReactNativeBiometrics from 'react-native-biometrics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BIOMETRIC_KEY } from '../constants/storage';

export class BiometricService {
  private rnBiometrics = new ReactNativeBiometrics();

  async isAvailable(): Promise<boolean> {
    try {
      const { available } = await this.rnBiometrics.isSensorAvailable();
      return available;
    } catch (error) {
      return false;
    }
  }

  async enableBiometric(): Promise<boolean> {
    try {
      const { available } = await this.rnBiometrics.isSensorAvailable();
      if (!available) return false;

      const { biometricKeysExist } = await this.rnBiometrics.biometricKeysExist();
      if (!biometricKeysExist) {
        await this.rnBiometrics.createKeys();
      }

      await AsyncStorage.setItem(BIOMETRIC_KEY, 'enabled');
      return true;
    } catch (error) {
      console.error('Biometric setup failed:', error);
      return false;
    }
  }

  async authenticateWithBiometric(): Promise<boolean> {
    try {
      const isEnabled = await AsyncStorage.getItem(BIOMETRIC_KEY);
      if (!isEnabled) return false;

      const { success } = await this.rnBiometrics.simplePrompt({
        promptMessage: 'Use fingerprint to login',
        cancelButtonText: 'Cancel',
      });

      return success;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }
}
```

### 2. Dashboard and Home Screen

#### Worker Dashboard
```typescript
// src/screens/dashboard/DashboardScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import {
  Card,
  Button,
  Avatar,
  List,
  Badge,
  Chip,
  Surface,
} from 'react-native-paper';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { fetchJobs, fetchNotifications } from '../../store/slices/jobsSlice';
import { fetchWorkerProfile } from '../../store/slices/profileSlice';
import { RootState } from '../../store';
import { NavigationProp } from '@react-navigation/native';

interface DashboardScreenProps {
  navigation: NavigationProp<any>;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  navigation,
}) => {
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);

  const {
    jobs,
    todayJobs,
    pendingJobs,
    completedJobs,
    earnings,
    stats,
  } = useSelector((state: RootState) => state.jobs);

  const { profile } = useSelector((state: RootState) => state.profile);
  const { notifications } = useSelector((state: RootState) => state.notifications);

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        dispatch(fetchJobs({ status: 'today' })),
        dispatch(fetchJobs({ status: 'pending' })),
        dispatch(fetchJobs({ status: 'completed' })),
        dispatch(fetchWorkerProfile()),
        dispatch(fetchNotifications()),
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to load dashboard data');
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadDashboardData();
    }, [dispatch])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const screenWidth = Dimensions.get('window').width - 40;

  const earningsData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: earnings.weekly,
      color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    }],
  };

  const jobStatsData = {
    labels: ['Cleaning', 'Maintenance', 'Inspection'],
    datasets: [{
      data: [
        jobs.filter(j => j.type === 'cleaning').length,
        jobs.filter(j => j.type === 'maintenance').length,
        jobs.filter(j => j.type === 'inspection').length,
      ],
    }],
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <Surface style={styles.header}>
        <View style={styles.headerContent}>
          <Avatar.Image
            size={60}
            source={{ uri: profile?.avatar }}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.greeting}>
              Welcome back, {profile?.firstName}!
            </Text>
            <Text style={styles.subtitle}>
              {todayJobs.length} jobs today
            </Text>
            <View style={styles.statusContainer}>
              <Chip
                icon="check-circle"
                mode="outlined"
                textStyle={styles.statusText}
              >
                Active
              </Chip>
            </View>
          </View>
        </View>
      </Surface>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content>
            <Text style={styles.statValue}>${earnings.week}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <Text style={styles.statValue}>{todayJobs.length}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <Text style={styles.statValue}>{pendingJobs.length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <Text style={styles.statValue}>{profile?.rating || '4.8'}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Earnings Chart */}
      <Card style={styles.chartCard}>
        <Card.Title title="Weekly Earnings" />
        <Card.Content>
          <LineChart
            data={earningsData}
            width={screenWidth}
            height={200}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            bezier
            style={styles.chart}
          />
        </Card.Content>
      </Card>

      {/* Today's Jobs */}
      <Card style={styles.card}>
        <Card.Title
          title="Today's Jobs"
          right={() => (
            <Button
              onPress={() => navigation.navigate('Jobs', { filter: 'today' })}
            >
              View All
            </Button>
          )}
        />
        <Card.Content>
          {todayJobs.slice(0, 3).map((job) => (
            <List.Item
              key={job.id}
              title={job.title}
              description={`${job.time} • ${job.location.address}`}
              left={() => (
                <List.Icon
                  icon={job.type === 'cleaning' ? 'broom' : 'wrench'}
                />
              )}
              right={() => (
                <View style={styles.jobActions}>
                  <Badge
                    style={[
                      styles.statusBadge,
                      { backgroundColor: job.priority === 'high' ? '#ff6b6b' : '#4ecdc4' },
                    ]}
                  >
                    {job.priority}
                  </Badge>
                </View>
              )}
              onPress={() => navigation.navigate('JobDetail', { jobId: job.id })}
            />
          ))}
          {todayJobs.length === 0 && (
            <Text style={styles.emptyText}>No jobs scheduled for today</Text>
          )}
        </Card.Content>
      </Card>

      {/* Job Distribution */}
      <Card style={styles.chartCard}>
        <Card.Title title="Job Distribution" />
        <Card.Content>
          <BarChart
            data={jobStatsData}
            width={screenWidth}
            height={200}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
            }}
            style={styles.chart}
          />
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Button
          mode="contained"
          icon="map-marker"
          style={styles.actionButton}
          onPress={() => navigation.navigate('MapView')}
        >
          View Map
        </Button>

        <Button
          mode="outlined"
          icon="clock"
          style={styles.actionButton}
          onPress={() => navigation.navigate('Schedule')}
        >
          Schedule
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    margin: 16,
    elevation: 4,
    borderRadius: 12,
  },
  headerContent: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
  },
  statusText: {
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  chartCard: {
    margin: 16,
    elevation: 2,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  jobActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    marginRight: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    margin: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});
```

### 3. Job Management

#### Job List Screen
```typescript
// src/screens/jobs/JobListScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {
  Searchbar,
  Chip,
  Card,
  List,
  Avatar,
  Badge,
  FAB,
  Portal,
  Modal,
  Button,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobs, updateJobStatus } from '../../store/slices/jobsSlice';
import { RootState } from '../../store';
import { Job, JobStatus, JobType } from '../../types/job';
import { JobListScreenProps } from '../../types/navigation';

const STATUS_FILTERS: { key: JobStatus; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const TYPE_FILTERS: { key: JobType; label: string }[] = [
  { key: 'cleaning', label: 'Cleaning' },
  { key: 'maintenance', label: 'Maintenance' },
  { key: 'inspection', label: 'Inspection' },
];

export const JobListScreen: React.FC<JobListScreenProps> = ({
  navigation,
  route,
}) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | null>(null);
  const [typeFilter, setTypeFilter] = useState<JobType | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const { jobs, loading } = useSelector((state: RootState) => state.jobs);

  const loadJobs = useCallback(async () => {
    try {
      await dispatch(fetchJobs({
        search: searchQuery,
        status: statusFilter,
        type: typeFilter,
      }));
    } catch (error) {
      console.error('Failed to load jobs:', error);
    }
  }, [dispatch, searchQuery, statusFilter, typeFilter]);

  React.useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadJobs();
    setRefreshing(false);
  };

  const handleJobPress = (job: Job) => {
    navigation.navigate('JobDetail', { jobId: job.id });
  };

  const handleStatusUpdate = async (jobId: string, status: JobStatus) => {
    try {
      await dispatch(updateJobStatus({ jobId, status }));
    } catch (error) {
      console.error('Failed to update job status:', error);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.customer.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || job.status === statusFilter;
    const matchesType = !typeFilter || job.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const renderJobItem = ({ item: job }: { item: Job }) => (
    <Card style={styles.jobCard} onPress={() => handleJobPress(job)}>
      <Card.Content>
        <View style={styles.jobHeader}>
          <View style={styles.jobInfo}>
            <Text style={styles.jobTitle}>{job.title}</Text>
            <Text style={styles.jobCustomer}>{job.customer.name}</Text>
            <Text style={styles.jobLocation}>{job.location.address}</Text>
          </View>
          <View style={styles.jobMeta}>
            <Badge
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(job.status) },
              ]}
            >
              {formatStatus(job.status)}
            </Badge>
            <Badge
              style={[
                styles.typeBadge,
                { backgroundColor: getTypeColor(job.type) },
              ]}
            >
              {formatType(job.type)}
            </Badge>
          </View>
        </View>

        <View style={styles.jobDetails}>
          <Text style={styles.jobTime}>🕐 {job.startTime}</Text>
          <Text style={styles.jobDuration}>⏱ {job.duration}</Text>
          <Text style={styles.jobPrice}>💰 ${job.price}</Text>
        </View>

        {job.status === 'pending' && (
          <View style={styles.jobActions}>
            <Button
              mode="outlined"
              compact
              onPress={() => handleStatusUpdate(job.id, 'in_progress')}
              style={styles.actionButton}
            >
              Start
            </Button>
            <Button
              mode="outlined"
              compact
              onPress={() => navigation.navigate('JobNavigation', { jobId: job.id })}
              style={styles.actionButton}
            >
              Navigate
            </Button>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderFilterModal = () => (
    <Portal>
      <Modal
        visible={showFilterModal}
        onDismiss={() => setShowFilterModal(false)}
        contentContainerStyle={styles.modal}
      >
        <Text style={styles.modalTitle}>Filter Jobs</Text>

        <Text style={styles.filterSectionTitle}>Status</Text>
        <View style={styles.chipContainer}>
          <Chip
            selected={!statusFilter}
            onPress={() => setStatusFilter(null)}
            style={styles.chip}
          >
            All
          </Chip>
          {STATUS_FILTERS.map(filter => (
            <Chip
              key={filter.key}
              selected={statusFilter === filter.key}
              onPress={() => setStatusFilter(filter.key)}
              style={styles.chip}
            >
              {filter.label}
            </Chip>
          ))}
        </View>

        <Text style={styles.filterSectionTitle}>Type</Text>
        <View style={styles.chipContainer}>
          <Chip
            selected={!typeFilter}
            onPress={() => setTypeFilter(null)}
            style={styles.chip}
          >
            All
          </Chip>
          {TYPE_FILTERS.map(filter => (
            <Chip
              key={filter.key}
              selected={typeFilter === filter.key}
              onPress={() => setTypeFilter(filter.key)}
              style={styles.chip}
            >
              {filter.label}
            </Chip>
          ))}
        </View>

        <View style={styles.modalActions}>
          <Button
            onPress={() => {
              setStatusFilter(null);
              setTypeFilter(null);
              setShowFilterModal(false);
            }}
          >
            Clear
          </Button>
          <Button
            mode="contained"
            onPress={() => setShowFilterModal(false)}
          >
            Apply
          </Button>
        </View>
      </Modal>
    </Portal>
  );

  if (loading && jobs.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading jobs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search jobs..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.search}
      />

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Text style={styles.filterText}>Filters</Text>
          {(statusFilter || typeFilter) && (
            <Badge style={styles.filterBadge}>•</Badge>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredJobs}
        renderItem={renderJobItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No jobs found. Try adjusting your filters.
          </Text>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateJob')}
      />

      {renderFilterModal()}
    </View>
  );
};

const getStatusColor = (status: JobStatus): string => {
  const colors = {
    pending: '#ff9800',
    in_progress: '#2196f3',
    completed: '#4caf50',
    cancelled: '#f44336',
  };
  return colors[status] || '#9e9e9e';
};

const getTypeColor = (type: JobType): string => {
  const colors = {
    cleaning: '#4caf50',
    maintenance: '#ff9800',
    inspection: '#2196f3',
  };
  return colors[type] || '#9e9e9e';
};

const formatStatus = (status: JobStatus): string => {
  return status.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const formatType = (type: JobType): string => {
  return type.charAt(0).toUpperCase() + type.slice(1);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  search: {
    margin: 16,
    elevation: 2,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterText: {
    fontSize: 16,
    color: '#2196f3',
  },
  filterBadge: {
    marginLeft: 8,
  },
  list: {
    padding: 16,
  },
  jobCard: {
    marginBottom: 12,
    elevation: 2,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  jobCustomer: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  jobLocation: {
    fontSize: 12,
    color: '#888',
  },
  jobMeta: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    marginBottom: 4,
  },
  typeBadge: {
    marginBottom: 4,
  },
  jobDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  jobTime: {
    fontSize: 12,
    color: '#666',
  },
  jobDuration: {
    fontSize: 12,
    color: '#666',
  },
  jobPrice: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  jobActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 40,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196f3',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
});
```

#### Job Detail Screen
```typescript
// src/screens/jobs/JobDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Alert,
  Share,
  Linking,
} from 'react-native';
import {
  Card,
  Button,
  List,
  Avatar,
  Chip,
  Divider,
  Portal,
  Modal,
  IconButton,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useRoute, useNavigation } from '@react-navigation/native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { fetchJobDetail, updateJobStatus, addJobNote } from '../../store/slices/jobsSlice';
import { RootState } from '../../store';
import { Job } from '../../types/job';
import { styles } from '../../styles/jobDetail';

export const JobDetailScreen: React.FC = () => {
  const dispatch = useDispatch();
  const route = useRoute();
  const navigation = useNavigation();
  const { jobId } = route.params as { jobId: string };

  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);

  const { currentJob: job, loading } = useSelector((state: RootState) => state.jobs);

  useEffect(() => {
    dispatch(fetchJobDetail(jobId));
  }, [dispatch, jobId]);

  const handleStatusUpdate = async (status: string) => {
    try {
      await dispatch(updateJobStatus({ jobId, status }));
      Alert.alert('Success', `Job status updated to ${status}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update job status');
    }
  };

  const handleNavigation = () => {
    if (job?.location.coordinates) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${job.location.coordinates.lat},${job.location.coordinates.lng}`;
      Linking.openURL(url);
    }
  };

  const handleCallCustomer = () => {
    if (job?.customer.phone) {
      Linking.openURL(`tel:${job.customer.phone}`);
    }
  };

  const handleShareJob = async () => {
    try {
      await Share.share({
        message: `Job: ${job?.title}\nCustomer: ${job?.customer.name}\nAddress: ${job?.location.address}\nTime: ${job?.startTime}`,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleAddPhoto = () => {
    Alert.alert(
      'Add Photo',
      'Choose photo source',
      [
        { text: 'Camera', onPress: launchCamera },
        { text: 'Gallery', onPress: launchImageLibrary },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;

    try {
      await dispatch(addJobNote({
        jobId,
        note: {
          text: noteText,
          timestamp: new Date().toISOString(),
          type: 'worker',
        },
      }));
      setNoteText('');
      setShowNoteModal(false);
      Alert.alert('Success', 'Note added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add note');
    }
  };

  if (loading || !job) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading job details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerContent}>
            <View style={styles.jobInfo}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <Text style={styles.jobId}>Job ID: {job.id}</Text>
            </View>
            <View style={styles.statusContainer}>
              <Chip
                style={[styles.statusChip, { backgroundColor: getStatusColor(job.status) }]}
                textStyle={styles.statusText}
              >
                {formatStatus(job.status)}
              </Chip>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Customer Information */}
      <Card style={styles.card}>
        <Card.Title title="Customer Information" left={() => <Avatar.Icon icon="account" />} />
        <Card.Content>
          <List.Item
            title={job.customer.name}
            description={job.customer.email}
            left={() => <Avatar.Text label={job.customer.name.charAt(0)} />}
            right={() => (
              <View style={styles.customerActions}>
                <IconButton
                  icon="phone"
                  size={24}
                  onPress={handleCallCustomer}
                />
                <IconButton
                  icon="message"
                  size={24}
                  onPress={() => navigation.navigate('Chat', { customerId: job.customer.id })}
                />
              </View>
            )}
          />
          <List.Item
            title={job.customer.phone}
            description="Phone"
            left={() => <List.Icon icon="phone" />}
          />
        </Card.Content>
      </Card>

      {/* Location & Navigation */}
      <Card style={styles.card}>
        <Card.Title
          title="Location"
          right={() => (
            <Button mode="outlined" onPress={handleNavigation}>
              Navigate
            </Button>
          )}
        />
        <Card.Content>
          <Text style={styles.address}>{job.location.address}</Text>
          {job.location.coordinates && (
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={{
                latitude: job.location.coordinates.lat,
                longitude: job.location.coordinates.lng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={job.location.coordinates}
                title={job.title}
                description={job.location.address}
              />
            </MapView>
          )}
        </Card.Content>
      </Card>

      {/* Schedule Information */}
      <Card style={styles.card}>
        <Card.Title title="Schedule" left={() => <Avatar.Icon icon="calendar" />} />
        <Card.Content>
          <List.Item
            title={job.date}
            description="Date"
            left={() => <List.Icon icon="calendar" />}
          />
          <List.Item
            title={job.startTime}
            description="Start Time"
            left={() => <List.Icon icon="clock-start" />}
          />
          <List.Item
            title={job.duration}
            description="Estimated Duration"
            left={() => <List.Icon icon="timer" />}
          />
          <List.Item
            title={`$${job.price}`}
            description="Job Price"
            left={() => <List.Icon icon="currency-usd" />}
          />
        </Card.Content>
      </Card>

      {/* Job Details */}
      <Card style={styles.card}>
        <Card.Title title="Job Details" left={() => <Avatar.Icon icon="clipboard-text" />} />
        <Card.Content>
          <Text style={styles.description}>{job.description}</Text>

          {job.requirements && (
            <>
              <Text style={styles.sectionTitle}>Requirements</Text>
              {job.requirements.map((requirement, index) => (
                <List.Item
                  key={index}
                  title={requirement}
                  left={() => <List.Icon icon="check-circle" />}
                />
              ))}
            </>
          )}

          {job.materials && job.materials.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Materials</Text>
              {job.materials.map((material, index) => (
                <List.Item
                  key={index}
                  title={material.name}
                  description={`Quantity: ${material.quantity}`}
                  left={() => <List.Icon icon="package" />}
                />
              ))}
            </>
          )}
        </Card.Content>
      </Card>

      {/* Photos */}
      {job.photos && job.photos.length > 0 && (
        <Card style={styles.card}>
          <Card.Title
            title="Photos"
            right={() => (
              <Button mode="outlined" onPress={handleAddPhoto}>
                Add Photo
              </Button>
            )}
          />
          <Card.Content>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {job.photos.map((photo, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setSelectedImage(photo.url);
                    setShowImageModal(true);
                  }}
                >
                  <Avatar.Image
                    size={80}
                    source={{ uri: photo.url }}
                    style={styles.photo}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Card.Content>
        </Card>
      )}

      {/* Notes */}
      <Card style={styles.card}>
        <Card.Title
          title="Notes"
          right={() => (
            <Button mode="outlined" onPress={() => setShowNoteModal(true)}>
              Add Note
            </Button>
          )}
        />
        <Card.Content>
          {job.notes && job.notes.length > 0 ? (
            job.notes.map((note, index) => (
              <View key={index} style={styles.noteItem}>
                <Text style={styles.noteAuthor}>{note.author}</Text>
                <Text style={styles.noteText}>{note.text}</Text>
                <Text style={styles.noteTime}>{note.timestamp}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No notes yet</Text>
          )}
        </Card.Content>
      </Card>

      {/* Actions */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.actionContainer}>
            <Button
              mode="contained"
              style={styles.actionButton}
              onPress={() => handleStatusUpdate('in_progress')}
              disabled={job.status === 'in_progress'}
            >
              Start Job
            </Button>

            <Button
              mode="outlined"
              style={styles.actionButton}
              onPress={() => handleStatusUpdate('completed')}
              disabled={job.status === 'completed'}
            >
              Complete
            </Button>

            <IconButton
              icon="share"
              size={24}
              onPress={handleShareJob}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Image Modal */}
      <Portal>
        <Modal
          visible={showImageModal}
          onDismiss={() => setShowImageModal(false)}
          contentContainerStyle={styles.imageModal}
        >
          {selectedImage && (
            <Avatar.Image
              size={300}
              source={{ uri: selectedImage }}
            />
          )}
        </Modal>
      </Portal>

      {/* Note Modal */}
      <Portal>
        <Modal
          visible={showNoteModal}
          onDismiss={() => setShowNoteModal(false)}
          contentContainerStyle={styles.noteModal}
        >
          <Text style={styles.modalTitle}>Add Note</Text>
          <TextInput
            mode="outlined"
            multiline
            numberOfLines={4}
            value={noteText}
            onChangeText={setNoteText}
            placeholder="Enter your note here..."
            style={styles.noteInput}
          />
          <View style={styles.modalActions}>
            <Button onPress={() => setShowNoteModal(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleAddNote}>Add Note</Button>
          </View>
        </Modal>
      </Portal>
    </ScrollView>
  );
};

const getStatusColor = (status: string): string => {
  const colors = {
    pending: '#ff9800',
    in_progress: '#2196f3',
    completed: '#4caf50',
    cancelled: '#f44336',
  };
  return colors[status] || '#9e9e9e';
};

const formatStatus = (status: string): string => {
  return status.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};
```

### 4. Map and Navigation

#### Job Map View
```typescript
// src/screens/map/MapViewScreen.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import MapView, { Marker, Callout, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useDispatch, useSelector } from 'react-redux';
import { FAB, Portal, Modal, Button, List, Text } from 'react-native-paper';
import Geolocation from 'react-native-geolocation-service';
import { fetchJobs } from '../../store/slices/jobsSlice';
import { RootState } from '../../store';
import { Job } from '../../types/job';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export const MapViewScreen: React.FC = () => {
  const dispatch = useDispatch();
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);

  const { jobs, loading } = useSelector((state: RootState) => state.jobs);

  useEffect(() => {
    dispatch(fetchJobs({ status: 'pending,in_progress' }));
    requestLocationPermission();
  }, [dispatch]);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Access Required',
            message: 'This app needs to access your location to show nearby jobs',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      getCurrentLocation();
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        setRegion({
          ...region,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.log('Location error:', error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const jobMarkers = useMemo(() => {
    return jobs
      .filter(job => job.location?.coordinates)
      .map(job => ({
        ...job,
        latitude: job.location.coordinates.lat,
        longitude: job.location.coordinates.lng,
      }));
  }, [jobs]);

  const calculateRoute = (job: Job) => {
    if (!job.location?.coordinates) return;

    // This would integrate with Google Maps Directions API
    // For now, showing straight line
    setRouteCoordinates([
      { latitude: region.latitude, longitude: region.longitude },
      { latitude: job.location.coordinates.lat, longitude: job.location.coordinates.lng },
    ]);
  };

  const handleMarkerPress = (job: Job) => {
    setSelectedJob(job);
    calculateRoute(job);
  };

  const handleNavigate = () => {
    if (!selectedJob?.location?.coordinates) return;

    const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedJob.location.coordinates.lat},${selectedJob.location.coordinates.lng}`;
    // Linking.openURL(url);
  };

  const renderMarker = (job: any) => (
    <Marker
      key={job.id}
      coordinate={{
        latitude: job.latitude,
        longitude: job.longitude,
      }}
      pinColor={getMarkerColor(job.type, job.status)}
      onPress={() => handleMarkerPress(job)}
    >
      <Callout>
        <View style={styles.callout}>
          <Text style={styles.calloutTitle}>{job.title}</Text>
          <Text style={styles.calloutText}>{job.customer.name}</Text>
          <Text style={styles.calloutText}>{job.location.address}</Text>
          <Text style={styles.calloutTime}>{job.startTime}</Text>
        </View>
      </Callout>
    </Marker>
  );

  const renderJobModal = () => (
    <Portal>
      <Modal
        visible={!!selectedJob}
        onDismiss={() => setSelectedJob(null)}
        contentContainerStyle={styles.modal}
      >
        {selectedJob && (
          <View>
            <Text style={styles.modalTitle}>{selectedJob.title}</Text>

            <List.Item
              title="Customer"
              description={selectedJob.customer.name}
              left={() => <List.Icon icon="account" />}
            />

            <List.Item
              title="Address"
              description={selectedJob.location.address}
              left={() => <List.Icon icon="map-marker" />}
            />

            <List.Item
              title="Time"
              description={selectedJob.startTime}
              left={() => <List.Icon icon="clock" />}
            />

            <List.Item
              title="Price"
              description={`$${selectedJob.price}`}
              left={() => <List.Icon icon="currency-usd" />}
            />

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={handleNavigate}
                style={styles.modalButton}
              >
                Navigate
              </Button>
              <Button
                mode="contained"
                onPress={() => setSelectedJob(null)}
                style={styles.modalButton}
              >
                Close
              </Button>
            </View>
          </View>
        )}
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onRegionChange={setRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {jobMarkers.map(renderMarker)}

        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#2196F3"
            strokeWidth={3}
          />
        )}
      </MapView>

      {/* Current Location FAB */}
      <FAB
        icon="crosshairs-gps"
        style={styles.locationFab}
        onPress={getCurrentLocation}
      />

      {/* Filter FAB */}
      <FAB
        icon="filter"
        style={styles.filterFab}
        onPress={() => setShowFilterModal(true)}
      />

      {/* Job Details Modal */}
      {renderJobModal()}
    </View>
  );
};

const getMarkerColor = (type: string, status: string): string => {
  if (status === 'in_progress') return '#FF5722';
  if (type === 'cleaning') return '#4CAF50';
  if (type === 'maintenance') return '#FF9800';
  if (type === 'inspection') return '#2196F3';
  return '#9E9E9E';
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  callout: {
    width: 200,
    padding: 8,
  },
  calloutTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  calloutText: {
    fontSize: 12,
    marginBottom: 2,
  },
  calloutTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196F3',
  },
  locationFab: {
    position: 'absolute',
    margin: 16,
    right: 16,
    bottom: 16,
    backgroundColor: '#4CAF50',
  },
  filterFab: {
    position: 'absolute',
    margin: 16,
    right: 16,
    bottom: 80,
    backgroundColor: '#FF9800',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});
```

### 5. Schedule Management

#### Schedule Screen
```typescript
// src/screens/schedule/ScheduleScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  Dimensions,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  List,
  Avatar,
  FAB,
  Portal,
  Modal,
  TextInput,
} from 'react-native-paper';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSchedule, updateAvailability } from '../../store/slices/scheduleSlice';
import { RootState } from '../../store';
import { ScheduleItem, AvailabilitySlot } from '../../types/schedule';

const screenWidth = Dimensions.get('window').width;

export const ScheduleScreen: React.FC = () => {
  const dispatch = useDispatch();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'agenda'>('calendar');

  const { schedule, loading, availability } = useSelector((state: RootState) => state.schedule);

  useEffect(() => {
    dispatch(fetchSchedule());
  }, [dispatch]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleUpdateAvailability = (slot: AvailabilitySlot) => {
    dispatch(updateAvailability(slot));
    setShowAvailabilityModal(false);
  };

  const markedDates = schedule.reduce((acc, item) => {
    const date = item.date.split('T')[0];
    if (!acc[date]) {
      acc[date] = {
        marked: true,
        dotColor: item.type === 'cleaning' ? '#4CAF50' :
                 item.type === 'maintenance' ? '#FF9800' : '#2196F3',
      };
    }
    return acc;
  }, {} as any);

  const getItemsForDay = (day: string) => {
    return schedule
      .filter(item => item.date.startsWith(day))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const renderCalendarView = () => (
    <View>
      <Calendar
        current={selectedDate}
        markedDates={markedDates}
        onDayPress={(day) => handleDateSelect(day.dateString)}
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: '#2196F3',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#2196F3',
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8',
          arrowColor: '#2196F3',
          monthTextColor: '#2d4150',
          textDayFontWeight: '300',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '300',
        }}
      />

      {/* Day Details */}
      <Card style={styles.dayDetailsCard}>
        <Card.Title title={`Schedule for ${selectedDate}`} />
        <Card.Content>
          {getItemsForDay(selectedDate).length > 0 ? (
            getItemsForDay(selectedDate).map((item) => (
              <List.Item
                key={item.id}
                title={item.title}
                description={`${item.startTime} - ${item.endTime}`}
                left={() => (
                  <Avatar.Icon
                    icon={item.type === 'cleaning' ? 'broom' : 'wrench'}
                    style={{
                      backgroundColor: item.type === 'cleaning' ? '#4CAF50' : '#FF9800',
                    }}
                  />
                )}
                right={() => (
                  <Chip
                    style={[
                      styles.statusChip,
                      { backgroundColor: getStatusColor(item.status) },
                    ]}
                  >
                    {item.status}
                  </Chip>
                )}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No jobs scheduled for this day</Text>
          )}
        </Card.Content>
      </Card>
    </View>
  );

  const renderAgendaView = () => {
    const agendaItems = schedule.reduce((acc, item) => {
      const date = item.date.split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {} as any);

    return (
      <Agenda
        items={agendaItems}
        selected={selectedDate}
        renderItem={(item) => (
          <Card style={styles.agendaItem}>
            <Card.Content>
              <View style={styles.agendaItemHeader}>
                <Text style={styles.agendaItemTitle}>{item.title}</Text>
                <Chip
                  style={[
                    styles.statusChip,
                    { backgroundColor: getStatusColor(item.status) },
                  ]}
                >
                  {item.status}
                </Chip>
              </View>
              <Text style={styles.agendaItemTime}>{item.startTime} - {item.endTime}</Text>
              <Text style={styles.agendaItemLocation}>{item.location.address}</Text>
            </Card.Content>
          </Card>
        )}
        renderEmptyDate={() => (
          <View style={styles.emptyDate}>
            <Text style={styles.emptyText}>No jobs scheduled</Text>
          </View>
        )}
        rowHasChanged={(r1, r2) => r1.id !== r2.id}
        theme={{
          selectedDayBackgroundColor: '#2196F3',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#2196F3',
          agendaDayNumColor: '#2d4150',
          agendaDayTextColor: '#2d4150',
          agendaKnobColor: '#2196F3',
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* View Mode Toggle */}
      <View style={styles.viewToggle}>
        <Chip
          selected={viewMode === 'calendar'}
          onPress={() => setViewMode('calendar')}
          style={styles.toggleChip}
        >
          Calendar
        </Chip>
        <Chip
          selected={viewMode === 'agenda'}
          onPress={() => setViewMode('agenda')}
          style={styles.toggleChip}
        >
          Agenda
        </Chip>
      </View>

      <ScrollView style={styles.content}>
        {viewMode === 'calendar' ? renderCalendarView() : renderAgendaView()}
      </ScrollView>

      {/* Availability Modal */}
      <Portal>
        <Modal
          visible={showAvailabilityModal}
          onDismiss={() => setShowAvailabilityModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>Set Availability</Text>
          <TextInput
            label="Start Time"
            mode="outlined"
            placeholder="09:00"
            style={styles.input}
          />
          <TextInput
            label="End Time"
            mode="outlined"
            placeholder="17:00"
            style={styles.input}
          />
          <View style={styles.modalActions}>
            <Button onPress={() => setShowAvailabilityModal(false)}>Cancel</Button>
            <Button mode="contained" onPress={() => handleUpdateAvailability({})}>
              Save
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setShowAvailabilityModal(true)}
      />
    </View>
  );
};

const getStatusColor = (status: string): string => {
  const colors = {
    available: '#4CAF50',
    busy: '#FF9800',
    unavailable: '#F44336',
  };
  return colors[status] || '#9E9E9E';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  viewToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  toggleChip: {
    marginHorizontal: 4,
  },
  content: {
    flex: 1,
  },
  dayDetailsCard: {
    margin: 16,
  },
  statusChip: {
    height: 24,
  },
  agendaItem: {
    margin: 16,
    elevation: 2,
  },
  agendaItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  agendaItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  agendaItemTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  agendaItemLocation: {
    fontSize: 14,
    color: '#888',
  },
  emptyDate: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
});
```

## State Management

### Redux Store Configuration
```typescript
// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';

import authSlice from './slices/authSlice';
import jobsSlice from './slices/jobsSlice';
import scheduleSlice from './slices/scheduleSlice';
import notificationsSlice from './slices/notificationsSlice';
import profileSlice from './slices/profileSlice';
import settingsSlice from './slices/settingsSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'settings'],
};

const rootReducer = combineReducers({
  auth: authSlice,
  jobs: jobsSlice,
  schedule: scheduleSlice,
  notifications: notificationsSlice,
  profile: profileSlice,
  settings: settingsSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Auth Slice
```typescript
// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { login as loginApi, register as registerApi, refreshToken } from '../../services/authService';
import { User, LoginRequest, RegisterRequest } from '../../types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest) => {
    const response = await loginApi(credentials);
    return response;
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterRequest) => {
    const response = await registerApi(userData);
    return response;
  }
);

export const refreshAuthToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState }) => {
    const state = getState() as { auth: AuthState };
    const refreshTokenValue = state.auth.refreshToken;

    if (!refreshTokenValue) {
      throw new Error('No refresh token available');
    }

    const response = await refreshToken(refreshTokenValue);
    return response;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Registration failed';
      })
      // Refresh Token
      .addCase(refreshAuthToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(refreshAuthToken.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
```

## Push Notifications

### Notification Service
```typescript
// src/services/notificationService.ts
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { Platform } from 'react-native';

export class NotificationService {
  constructor() {
    this.configure();
  }

  configure() {
    PushNotification.configure({
      onRegister: (token) => {
        console.log('Push notification token:', token);
        // Send token to server
      },
      onNotification: (notification) => {
        console.log('Notification received:', notification);

        if (notification.userInteraction) {
          // User tapped notification
          this.handleNotificationTap(notification);
        }

        // Required on iOS only
        if (Platform.OS === 'ios') {
          notification.finish(PushNotificationIOS.FetchResult.NoData);
        }
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    this.createDefaultChannels();
  }

  createDefaultChannels() {
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'job-assignments',
          channelName: 'Job Assignments',
          channelDescription: 'Notifications for new job assignments',
          playSound: true,
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        (created) => console.log('Job assignments channel created:', created)
      );

      PushNotification.createChannel(
        {
          channelId: 'job-updates',
          channelName: 'Job Updates',
          channelDescription: 'Notifications for job status updates',
          playSound: true,
          soundName: 'default',
          importance: 3,
          vibrate: true,
        },
        (created) => console.log('Job updates channel created:', created)
      );

      PushNotification.createChannel(
        {
          channelId: 'messages',
          channelName: 'Messages',
          channelDescription: 'Notifications for new messages',
          playSound: true,
          soundName: 'default',
          importance: 3,
          vibrate: true,
        },
        (created) => console.log('Messages channel created:', created)
      );
    }
  }

  showJobAssignmentNotification(job: any) {
    PushNotification.localNotification({
      channelId: 'job-assignments',
      title: 'New Job Assigned',
      message: `You have been assigned to ${job.title} at ${job.location.address}`,
      userInfo: { jobId: job.id, type: 'job_assignment' },
      actions: ['Accept', 'Decline'],
    });
  }

  showJobUpdateNotification(job: any) {
    PushNotification.localNotification({
      channelId: 'job-updates',
      title: 'Job Status Updated',
      message: `Job "${job.title}" status changed to ${job.status}`,
      userInfo: { jobId: job.id, type: 'job_update' },
    });
  }

  showMessageNotification(message: any) {
    PushNotification.localNotification({
      channelId: 'messages',
      title: `Message from ${message.senderName}`,
      message: message.text,
      userInfo: { messageId: message.id, type: 'message' },
    });
  }

  private handleNotificationTap(notification: any) {
    const { type, jobId, messageId } = notification.data.userInfo;

    switch (type) {
      case 'job_assignment':
      case 'job_update':
        if (jobId) {
          // Navigate to job detail screen
          // navigation.navigate('JobDetail', { jobId });
        }
        break;
      case 'message':
        if (messageId) {
          // Navigate to messages screen
          // navigation.navigate('Messages');
        }
        break;
    }
  }

  requestPermissions() {
    PushNotification.requestPermissions();
  }

  cancelAllNotifications() {
    PushNotification.cancelAllLocalNotifications();
  }

  getScheduledLocalNotifications(callback: (notifications: any[]) => void) {
    PushNotification.getScheduledLocalNotifications(callback);
  }
}

export default new NotificationService();
```

## Testing

### Component Tests
```typescript
// __tests__/components/JobCard.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import JobCard from '../../src/components/jobs/JobCard';
import authSlice from '../../src/store/slices/authSlice';

const mockStore = configureStore({
  reducer: {
    auth: authSlice,
  },
});

const mockJob = {
  id: '1',
  title: 'Office Cleaning',
  customer: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '123-456-7890',
  },
  location: {
    address: '123 Main St',
    coordinates: { lat: 37.78825, lng: -122.4324 },
  },
  startTime: '2024-01-15T09:00:00Z',
  duration: '2 hours',
  price: 100,
  status: 'pending',
  type: 'cleaning',
  description: 'Regular office cleaning',
};

describe('JobCard', () => {
  it('renders job information correctly', () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <JobCard job={mockJob} onPress={() => {}} />
      </Provider>
    );

    expect(getByText('Office Cleaning')).toBeTruthy();
    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('123 Main St')).toBeTruthy();
    expect(getByText('$100')).toBeTruthy();
  });

  it('calls onPress when card is pressed', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(
      <Provider store={mockStore}>
        <JobCard job={mockJob} onPress={mockOnPress} />
      </Provider>
    );

    fireEvent.press(getByTestId('job-card'));
    expect(mockOnPress).toHaveBeenCalledWith(mockJob);
  });

  it('displays correct status color', () => {
    const { getByTestId } = render(
      <Provider store={mockStore}>
        <JobCard job={mockJob} onPress={() => {}} />
      </Provider>
    );

    const statusBadge = getByTestId('status-badge');
    expect(statusBadge.props.style.backgroundColor).toBe('#ff9800');
  });
});
```

## Performance Optimization

### Image Optimization
```typescript
// src/components/OptimizedImage.tsx
import React, { useState } from 'react';
import { Image, ImageProps, View, ActivityIndicator } from 'react-native';
import FastImage from 'react-native-fast-image';

interface OptimizedImageProps extends ImageProps {
  source: { uri: string };
  thumbnailSource?: { uri: string };
  showLoading?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  thumbnailSource,
  showLoading = true,
  style,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <View style={style}>
      {thumbnailSource && isLoading && (
        <FastImage
          source={thumbnailSource}
          style={[style, { position: 'absolute' }]}
          resizeMode="cover"
        />
      )}

      <FastImage
        source={source}
        style={style}
        resizeMode={props.resizeMode || 'cover'}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        {...props}
      />

      {showLoading && isLoading && (
        <View style={[styles.loadingContainer, style]}>
          <ActivityIndicator size="small" />
        </View>
      )}
    </View>
  );
};

const styles = {
  loadingContainer: {
    position: 'absolute' as const,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
};
```

## Security

### API Security
```typescript
// src/services/secureApiService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/api';

class SecureApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const token = await AsyncStorage.getItem('auth_token');

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);

      if (response.status === 401) {
        // Token expired, attempt refresh
        await this.refreshToken();
        // Retry request with new token
        const newToken = await AsyncStorage.getItem('auth_token');
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${newToken}`,
        };
        return fetch(`${this.baseUrl}${endpoint}`, config);
      }

      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private async refreshToken() {
    const refreshToken = await AsyncStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const { token, refreshToken: newRefreshToken } = await response.json();
    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.setItem('refresh_token', newRefreshToken);
  }

  async get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export default new SecureApiService();
```

## Deployment

### Build Configuration
```json
// metro.config.js
module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};
```

### App.json Configuration
```json
{
  "expo": {
    "name": "RightFit Worker",
    "slug": "rightfit-worker",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "platforms": ["ios", "android"],
    "ios": {
      "bundleIdentifier": "com.rightfit.worker",
      "buildNumber": "1.0.0",
      "supportsTablet": false
    },
    "android": {
      "package": "com.rightfit.worker",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      }
    },
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow $(PRODUCT_NAME) to use your location."
        }
      ],
      [
        "expo-camera",
        {
          "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera."
        }
      ],
      [
        "expo-notifications",
        {
          "sounds": ["./assets/sounds/notification.wav"]
        }
      ]
    ]
  }
}
```

This comprehensive worker mobile app provides a complete solution for managing work assignments, schedules, communications, and reporting with a focus on offline capabilities, real-time updates, and location-based services.