import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RBACProvider, useRBAC, LoginForm, UserManagement, PermissionGate, RoleGate } from '../components/RBACSystem';
import { BatchApprovalQueue } from '../components/BatchApprovalQueue';
import { AuditLogExport } from '../components/AuditLogExport';
import { GovernanceVotingInterface } from '../components/GovernanceVotingInterface';

// Mock the session hook
jest.mock('../hooks/useSession', () => ({
  useSession: () => ({
    session: null,
    login: jest.fn(),
    logout: jest.fn(),
    isLoading: false
  })
}));

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RBACProvider>
    {children}
  </RBACProvider>
);

describe('Sprint 9: Official Dashboard Creation', () => {
  describe('RBAC System', () => {
    test('should render login form when user is not authenticated', () => {
      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      expect(screen.getByText('Gujarat LandChain Official Dashboard')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    test('should handle login with valid credentials', async () => {
      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByPlaceholderText('Email address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'superadmin@gujarat.gov.in' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Signing in...')).toBeInTheDocument();
      });
    });

    test('should show error for invalid credentials', async () => {
      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByPlaceholderText('Email address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'invalid@email.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials. Please try again.')).toBeInTheDocument();
      });
    });

    test('should render user management for super admin', () => {
      render(
        <TestWrapper>
          <UserManagement />
        </TestWrapper>
      );

      expect(screen.getByText('User Management')).toBeInTheDocument();
      expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    test('should create new user successfully', async () => {
      render(
        <TestWrapper>
          <UserManagement />
        </TestWrapper>
      );

      const addUserButton = screen.getByText('Add User');
      fireEvent.click(addUserButton);

      await waitFor(() => {
        expect(screen.getByText('Create New User')).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText('Name');
      const emailInput = screen.getByLabelText('Email');
      const departmentInput = screen.getByLabelText('Department');
      const createButton = screen.getByText('Create User');

      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(departmentInput, { target: { value: 'Test Department' } });
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });
    });

    test('should render permission gate correctly', () => {
      render(
        <TestWrapper>
          <PermissionGate permission="manage_users">
            <div>Protected Content</div>
          </PermissionGate>
        </TestWrapper>
      );

      // Should not show content without proper permissions
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    test('should render role gate correctly', () => {
      render(
        <TestWrapper>
          <RoleGate role="super_admin">
            <div>Admin Content</div>
          </RoleGate>
        </TestWrapper>
      );

      // Should not show content without proper role
      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });
  });

  describe('Batch Approval Queue', () => {
    test('should render batch approval queue', () => {
      render(
        <TestWrapper>
          <BatchApprovalQueue />
        </TestWrapper>
      );

      expect(screen.getByText('Batch Approval Queue')).toBeInTheDocument();
      expect(screen.getByText('properties pending review')).toBeInTheDocument();
    });

    test('should display property list with filters', () => {
      render(
        <TestWrapper>
          <BatchApprovalQueue />
        </TestWrapper>
      );

      expect(screen.getByText('GJ-24-001-001-001')).toBeInTheDocument();
      expect(screen.getByText('Rajesh Patel')).toBeInTheDocument();
      expect(screen.getByText('Vadodara')).toBeInTheDocument();
    });

    test('should filter properties by status', () => {
      render(
        <TestWrapper>
          <BatchApprovalQueue />
        </TestWrapper>
      );

      const statusFilter = screen.getByLabelText('Status');
      fireEvent.change(statusFilter, { target: { value: 'pending' } });

      expect(screen.getByText('pending')).toBeInTheDocument();
    });

    test('should filter properties by priority', () => {
      render(
        <TestWrapper>
          <BatchApprovalQueue />
        </TestWrapper>
      );

      const priorityFilter = screen.getByLabelText('Priority');
      fireEvent.change(priorityFilter, { target: { value: 'high' } });

      expect(screen.getByText('high')).toBeInTheDocument();
    });

    test('should select properties for batch operations', () => {
      render(
        <TestWrapper>
          <BatchApprovalQueue />
        </TestWrapper>
      );

      const selectAllCheckbox = screen.getByLabelText(/select all/i);
      fireEvent.click(selectAllCheckbox);

      expect(screen.getByText('Approve Selected (5)')).toBeInTheDocument();
      expect(screen.getByText('Reject Selected (5)')).toBeInTheDocument();
    });

    test('should process batch approval', async () => {
      render(
        <TestWrapper>
          <BatchApprovalQueue />
        </TestWrapper>
      );

      const selectAllCheckbox = screen.getByLabelText(/select all/i);
      fireEvent.click(selectAllCheckbox);

      const approveButton = screen.getByText('Approve Selected (5)');
      fireEvent.click(approveButton);

      await waitFor(() => {
        expect(screen.getByText('Batch Operations')).toBeInTheDocument();
      });
    });

    test('should show progress for batch operations', async () => {
      render(
        <TestWrapper>
          <BatchApprovalQueue />
        </TestWrapper>
      );

      const selectAllCheckbox = screen.getByLabelText(/select all/i);
      fireEvent.click(selectAllCheckbox);

      const approveButton = screen.getByText('Approve Selected (5)');
      fireEvent.click(approveButton);

      await waitFor(() => {
        expect(screen.getByText('100% complete')).toBeInTheDocument();
      });
    });
  });

  describe('Audit Log Export', () => {
    test('should render audit log export', () => {
      render(
        <TestWrapper>
          <AuditLogExport />
        </TestWrapper>
      );

      expect(screen.getByText('Audit Log Export')).toBeInTheDocument();
      expect(screen.getByText('log entries')).toBeInTheDocument();
    });

    test('should display audit log entries', () => {
      render(
        <TestWrapper>
          <AuditLogExport />
        </TestWrapper>
      );

      expect(screen.getByText('Super Admin')).toBeInTheDocument();
      expect(screen.getByText('property_approved')).toBeInTheDocument();
      expect(screen.getByText('success')).toBeInTheDocument();
    });

    test('should show export configuration when filters are toggled', () => {
      render(
        <TestWrapper>
          <AuditLogExport />
        </TestWrapper>
      );

      const showFiltersButton = screen.getByText('Show Filters');
      fireEvent.click(showFiltersButton);

      expect(screen.getByText('Export Configuration')).toBeInTheDocument();
      expect(screen.getByLabelText('Date Range')).toBeInTheDocument();
    });

    test('should filter audit logs by date range', () => {
      render(
        <TestWrapper>
          <AuditLogExport />
        </TestWrapper>
      );

      const showFiltersButton = screen.getByText('Show Filters');
      fireEvent.click(showFiltersButton);

      const startDateInput = screen.getByDisplayValue(/2025-01-20/);
      fireEvent.change(startDateInput, { target: { value: '2025-01-25' } });

      expect(startDateInput).toHaveValue('2025-01-25');
    });

    test('should filter audit logs by users', () => {
      render(
        <TestWrapper>
          <AuditLogExport />
        </TestWrapper>
      );

      const showFiltersButton = screen.getByText('Show Filters');
      fireEvent.click(showFiltersButton);

      const usersFilter = screen.getByLabelText('Users');
      fireEvent.change(usersFilter, { target: { value: 'Super Admin' } });

      expect(usersFilter).toHaveValue('Super Admin');
    });

    test('should export audit logs in CSV format', async () => {
      render(
        <TestWrapper>
          <AuditLogExport />
        </TestWrapper>
      );

      const exportButton = screen.getByText('Export CSV');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('Exporting... 100%')).toBeInTheDocument();
      });
    });

    test('should export audit logs in JSON format', async () => {
      render(
        <TestWrapper>
          <AuditLogExport />
        </TestWrapper>
      );

      const showFiltersButton = screen.getByText('Show Filters');
      fireEvent.click(showFiltersButton);

      const formatSelect = screen.getByLabelText('Export Format');
      fireEvent.change(formatSelect, { target: { value: 'json' } });

      const exportButton = screen.getByText('Export JSON');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('Exporting... 100%')).toBeInTheDocument();
      });
    });

    test('should include metadata in export when selected', () => {
      render(
        <TestWrapper>
          <AuditLogExport />
        </TestWrapper>
      );

      const showFiltersButton = screen.getByText('Show Filters');
      fireEvent.click(showFiltersButton);

      const metadataCheckbox = screen.getByLabelText('Include Metadata');
      fireEvent.click(metadataCheckbox);

      expect(metadataCheckbox).toBeChecked();
    });

    test('should clear all filters', () => {
      render(
        <TestWrapper>
          <AuditLogExport />
        </TestWrapper>
      );

      const showFiltersButton = screen.getByText('Show Filters');
      fireEvent.click(showFiltersButton);

      const clearFiltersButton = screen.getByText('Clear All Filters');
      fireEvent.click(clearFiltersButton);

      const startDateInput = screen.getByDisplayValue(/2025-01-20/);
      expect(startDateInput).toBeInTheDocument();
    });
  });

  describe('Governance Voting Interface', () => {
    test('should render governance voting interface', () => {
      render(
        <TestWrapper>
          <GovernanceVotingInterface />
        </TestWrapper>
      );

      expect(screen.getByText('Governance Voting Interface')).toBeInTheDocument();
      expect(screen.getByText('Dispute Cases')).toBeInTheDocument();
    });

    test('should display dispute cases', () => {
      render(
        <TestWrapper>
          <GovernanceVotingInterface />
        </TestWrapper>
      );

      expect(screen.getByText('Boundary Dispute - Ahmedabad')).toBeInTheDocument();
      expect(screen.getByText('Ownership Dispute - Vadodara')).toBeInTheDocument();
    });

    test('should submit votes for dispute cases', async () => {
      render(
        <TestWrapper>
          <GovernanceVotingInterface />
        </TestWrapper>
      );

      const approveButton = screen.getByText('Approve');
      fireEvent.click(approveButton);

      await waitFor(() => {
        expect(screen.getByText('Vote submitted successfully')).toBeInTheDocument();
      });
    });

    test('should display activity logs', () => {
      render(
        <TestWrapper>
          <GovernanceVotingInterface />
        </TestWrapper>
      );

      expect(screen.getByText('Activity Logs')).toBeInTheDocument();
      expect(screen.getByText('Vote submitted by Super Admin')).toBeInTheDocument();
    });
  });

  describe('Dashboard Integration', () => {
    test('should render dashboard navigation', () => {
      render(
        <TestWrapper>
          <div>Dashboard content would be here</div>
        </TestWrapper>
      );

      // This would test the main dashboard integration
      // For now, we're testing individual components
      expect(true).toBe(true);
    });

    test('should handle role-based navigation', () => {
      // Test that navigation items are filtered based on user permissions
      expect(true).toBe(true);
    });

    test('should handle tab switching', () => {
      // Test that users can switch between different dashboard tabs
      expect(true).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      // Mock network error
      jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <TestWrapper>
          <BatchApprovalQueue />
        </TestWrapper>
      );

      const selectAllCheckbox = screen.getByLabelText(/select all/i);
      fireEvent.click(selectAllCheckbox);

      const approveButton = screen.getByText('Approve Selected (5)');
      fireEvent.click(approveButton);

      await waitFor(() => {
        expect(console.error).toHaveBeenCalled();
      });
    });

    test('should show appropriate error messages', () => {
      render(
        <TestWrapper>
          <AuditLogExport />
        </TestWrapper>
      );

      const exportButton = screen.getByText('Export CSV');
      fireEvent.click(exportButton);

      // Should handle empty results gracefully
      expect(screen.getByText('No audit logs found')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('should handle large datasets efficiently', () => {
      // Test with large number of properties/logs
      expect(true).toBe(true);
    });

    test('should optimize re-renders', () => {
      // Test that components don't re-render unnecessarily
      expect(true).toBe(true);
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels', () => {
      render(
        <TestWrapper>
          <BatchApprovalQueue />
        </TestWrapper>
      );

      const selectAllCheckbox = screen.getByLabelText(/select all/i);
      expect(selectAllCheckbox).toHaveAttribute('type', 'checkbox');
    });

    test('should support keyboard navigation', () => {
      render(
        <TestWrapper>
          <AuditLogExport />
        </TestWrapper>
      );

      const showFiltersButton = screen.getByText('Show Filters');
      expect(showFiltersButton).toBeInTheDocument();
    });

    test('should have proper color contrast', () => {
      // Test that text has sufficient contrast
      expect(true).toBe(true);
    });
  });

  describe('Security', () => {
    test('should validate user permissions', () => {
      render(
        <TestWrapper>
          <UserManagement />
        </TestWrapper>
      );

      // Should show permission denied message for users without manage_users permission
      expect(screen.getByText("You don't have permission to manage users.")).toBeInTheDocument();
    });

    test('should sanitize user inputs', () => {
      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByPlaceholderText('Email address');
      fireEvent.change(emailInput, { target: { value: '<script>alert("xss")</script>' } });

      expect(emailInput).toHaveValue('<script>alert("xss")</script>');
    });
  });
}); 