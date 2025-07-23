'use client';

import React, { useState, useEffect } from 'react';
import { useRBAC, Permission } from './RBACSystem';

// Audit log entry interface
interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  resourceType: 'property' | 'user' | 'dispute' | 'system' | 'transaction';
  resourceId: string;
  resourceName: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure' | 'pending';
  metadata: Record<string, any>;
}

// Export configuration interface
interface ExportConfig {
  dateRange: {
    start: Date;
    end: Date;
  };
  filters: {
    users: string[];
    actions: string[];
    resourceTypes: string[];
    status: string[];
  };
  format: 'csv' | 'json' | 'excel';
  includeMetadata: boolean;
}

// Mock audit log data (will be replaced with real backend)
const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    userId: '1',
    userName: 'Super Admin',
    userRole: 'super_admin',
    action: 'property_approved',
    resourceType: 'property',
    resourceId: 'GJ-24-001-001-001',
    resourceName: 'Residential Plot - Vadodara',
    details: 'Property approved after AI validation and swarm consensus',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    status: 'success',
    metadata: {
      aiValidationScore: 94.2,
      swarmConsensusScore: 96.8,
      blockchainTransaction: '0x1234567890abcdef...',
      processingTime: '2.3s'
    }
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    userId: '2',
    userName: 'Revenue Officer',
    userRole: 'admin',
    action: 'user_created',
    resourceType: 'user',
    resourceId: '5',
    resourceName: 'New Land Inspector',
    details: 'Created new user account for land inspection department',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    status: 'success',
    metadata: {
      department: 'Land Records',
      permissions: ['view_properties', 'approve_properties', 'view_audit_logs']
    }
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 10800000), // 3 hours ago
    userId: '3',
    userName: 'Land Inspector',
    userRole: 'official',
    action: 'property_rejected',
    resourceType: 'property',
    resourceId: 'GJ-24-001-001-002',
    resourceName: 'Commercial Building - Ahmedabad',
    details: 'Property rejected due to incomplete documentation',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Linux x86_64) AppleWebKit/537.36',
    status: 'success',
    metadata: {
      rejectionReason: 'Missing boundary survey certificate',
      aiValidationScore: 67.5,
      swarmConsensusScore: 45.2
    }
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 14400000), // 4 hours ago
    userId: '1',
    userName: 'Super Admin',
    userRole: 'super_admin',
    action: 'system_configuration_changed',
    resourceType: 'system',
    resourceId: 'config_001',
    resourceName: 'System Configuration',
    details: 'Updated AI validation threshold from 85% to 90%',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    status: 'success',
    metadata: {
      oldValue: 85,
      newValue: 90,
      impact: 'Increased validation stringency'
    }
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 18000000), // 5 hours ago
    userId: '4',
    userName: 'Auditor',
    userRole: 'viewer',
    action: 'audit_report_generated',
    resourceType: 'system',
    resourceId: 'report_001',
    resourceName: 'Monthly Audit Report',
    details: 'Generated comprehensive audit report for January 2025',
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
    status: 'success',
    metadata: {
      reportPeriod: 'January 2025',
      totalTransactions: 1250,
      successRate: 98.4,
      averageProcessingTime: '1.8s'
    }
  }
];

export const AuditLogExport: React.FC = () => {
  const { hasPermission, currentUser } = useRBAC();
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(MOCK_AUDIT_LOGS);
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    dateRange: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      end: new Date()
    },
    filters: {
      users: [],
      actions: [],
      resourceTypes: [],
      status: []
    },
    format: 'csv',
    includeMetadata: false
  });
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Check permissions
  const canViewAuditLogs = hasPermission(Permission.VIEW_AUDIT_LOGS);
  const canExportReports = hasPermission(Permission.EXPORT_REPORTS);

  if (!canViewAuditLogs) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">You don't have permission to view audit logs.</p>
      </div>
    );
  }

  // Get unique values for filters
  const uniqueUsers = Array.from(new Set(auditLogs.map(log => log.userName)));
  const uniqueActions = Array.from(new Set(auditLogs.map(log => log.action)));
  const uniqueResourceTypes = Array.from(new Set(auditLogs.map(log => log.resourceType)));
  const uniqueStatuses = Array.from(new Set(auditLogs.map(log => log.status)));

  // Filter logs based on configuration
  useEffect(() => {
    let filtered = auditLogs.filter(log => {
      // Date range filter
      if (log.timestamp < exportConfig.dateRange.start || log.timestamp > exportConfig.dateRange.end) {
        return false;
      }

      // User filter
      if (exportConfig.filters.users.length > 0 && !exportConfig.filters.users.includes(log.userName)) {
        return false;
      }

      // Action filter
      if (exportConfig.filters.actions.length > 0 && !exportConfig.filters.actions.includes(log.action)) {
        return false;
      }

      // Resource type filter
      if (exportConfig.filters.resourceTypes.length > 0 && !exportConfig.filters.resourceTypes.includes(log.resourceType)) {
        return false;
      }

      // Status filter
      if (exportConfig.filters.status.length > 0 && !exportConfig.filters.status.includes(log.status)) {
        return false;
      }

      return true;
    });

    setFilteredLogs(filtered);
  }, [auditLogs, exportConfig]);

  // Generate CSV content
  const generateCSV = (logs: AuditLogEntry[]): string => {
    const headers = [
      'Timestamp',
      'User ID',
      'User Name',
      'User Role',
      'Action',
      'Resource Type',
      'Resource ID',
      'Resource Name',
      'Details',
      'IP Address',
      'Status'
    ];

    if (exportConfig.includeMetadata) {
      headers.push('Metadata');
    }

    const rows = logs.map(log => {
      const row = [
        log.timestamp.toISOString(),
        log.userId,
        log.userName,
        log.userRole,
        log.action,
        log.resourceType,
        log.resourceId,
        log.resourceName,
        log.details,
        log.ipAddress,
        log.status
      ];

      if (exportConfig.includeMetadata) {
        row.push(JSON.stringify(log.metadata));
      }

      return row.map(field => `"${field}"`).join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  };

  // Generate JSON content
  const generateJSON = (logs: AuditLogEntry[]): string => {
    return JSON.stringify(logs, null, 2);
  };

  // Export function
  const handleExport = async () => {
    if (filteredLogs.length === 0) {
      alert('No logs match the current filters.');
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate export progress
      for (let i = 0; i <= 100; i += 10) {
        setExportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      let content: string;
      let filename: string;
      let mimeType: string;

      switch (exportConfig.format) {
        case 'csv':
          content = generateCSV(filteredLogs);
          filename = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
          mimeType = 'text/csv';
          break;
        case 'json':
          content = generateJSON(filteredLogs);
          filename = `audit_logs_${new Date().toISOString().split('T')[0]}.json`;
          mimeType = 'application/json';
          break;
        default:
          content = generateCSV(filteredLogs);
          filename = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
          mimeType = 'text/csv';
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Log the export action
      const exportLog: AuditLogEntry = {
        id: Date.now().toString(),
        timestamp: new Date(),
        userId: currentUser?.id || 'unknown',
        userName: currentUser?.name || 'Unknown User',
        userRole: currentUser?.role || 'unknown',
        action: 'audit_log_exported',
        resourceType: 'system',
        resourceId: 'export_001',
        resourceName: 'Audit Log Export',
        details: `Exported ${filteredLogs.length} audit log entries in ${exportConfig.format.toUpperCase()} format`,
        ipAddress: '192.168.1.100', // TODO: Get real IP
        userAgent: navigator.userAgent,
        status: 'success',
        metadata: {
          exportFormat: exportConfig.format,
          recordCount: filteredLogs.length,
          dateRange: exportConfig.dateRange,
          filters: exportConfig.filters
        }
      };

      setAuditLogs(prev => [exportLog, ...prev]);

    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  // Get action color
  const getActionColor = (action: string) => {
    if (action.includes('approved')) return 'text-green-600';
    if (action.includes('rejected')) return 'text-red-600';
    if (action.includes('created')) return 'text-blue-600';
    if (action.includes('updated')) return 'text-yellow-600';
    if (action.includes('deleted')) return 'text-red-600';
    return 'text-gray-600';
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'failure': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audit Log Export</h2>
          <p className="text-gray-600">
            {filteredLogs.length} of {auditLogs.length} log entries
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          {canExportReports && (
            <button
              onClick={handleExport}
              disabled={isExporting || filteredLogs.length === 0}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {isExporting ? `Exporting... ${exportProgress}%` : `Export ${exportConfig.format.toUpperCase()}`}
            </button>
          )}
        </div>
      </div>

      {/* Export Configuration */}
      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Export Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={exportConfig.dateRange.start.toISOString().split('T')[0]}
                  onChange={(e) => setExportConfig({
                    ...exportConfig,
                    dateRange: { ...exportConfig.dateRange, start: new Date(e.target.value) }
                  })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
                <input
                  type="date"
                  value={exportConfig.dateRange.end.toISOString().split('T')[0]}
                  onChange={(e) => setExportConfig({
                    ...exportConfig,
                    dateRange: { ...exportConfig.dateRange, end: new Date(e.target.value) }
                  })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>

            {/* Users Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Users</label>
              <select
                multiple
                value={exportConfig.filters.users}
                onChange={(e) => setExportConfig({
                  ...exportConfig,
                  filters: { ...exportConfig.filters, users: Array.from(e.target.selectedOptions, option => option.value) }
                })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                {uniqueUsers.map(user => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>
            </div>

            {/* Actions Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Actions</label>
              <select
                multiple
                value={exportConfig.filters.actions}
                onChange={(e) => setExportConfig({
                  ...exportConfig,
                  filters: { ...exportConfig.filters, actions: Array.from(e.target.selectedOptions, option => option.value) }
                })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                {uniqueActions.map(action => (
                  <option key={action} value={action}>{action.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            {/* Resource Types Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Resource Types</label>
              <select
                multiple
                value={exportConfig.filters.resourceTypes}
                onChange={(e) => setExportConfig({
                  ...exportConfig,
                  filters: { ...exportConfig.filters, resourceTypes: Array.from(e.target.selectedOptions, option => option.value) }
                })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                {uniqueResourceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                multiple
                value={exportConfig.filters.status}
                onChange={(e) => setExportConfig({
                  ...exportConfig,
                  filters: { ...exportConfig.filters, status: Array.from(e.target.selectedOptions, option => option.value) }
                })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Export Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
              <select
                value={exportConfig.format}
                onChange={(e) => setExportConfig({
                  ...exportConfig,
                  format: e.target.value as 'csv' | 'json' | 'excel'
                })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="excel">Excel</option>
              </select>
            </div>

            {/* Include Metadata */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeMetadata"
                checked={exportConfig.includeMetadata}
                onChange={(e) => setExportConfig({
                  ...exportConfig,
                  includeMetadata: e.target.checked
                })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="includeMetadata" className="ml-2 block text-sm text-gray-900">
                Include Metadata
              </label>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="mt-6">
            <button
              onClick={() => setExportConfig({
                dateRange: {
                  start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                  end: new Date()
                },
                filters: {
                  users: [],
                  actions: [],
                  resourceTypes: [],
                  status: []
                },
                format: 'csv',
                includeMetadata: false
              })}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* Export Progress */}
      {isExporting && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                ></div>
              </div>
            </div>
            <span className="text-sm text-gray-600">{exportProgress}%</span>
          </div>
        </div>
      )}

      {/* Audit Logs Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.timestamp.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{log.userName}</div>
                    <div className="text-sm text-gray-500">{log.userRole}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getActionColor(log.action)}`}>
                      {log.action.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{log.resourceName}</div>
                    <div className="text-sm text-gray-500">{log.resourceType} - {log.resourceId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate" title={log.details}>
                      {log.details}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty state */}
      {filteredLogs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No audit logs found</h3>
          <p className="text-gray-500">Try adjusting your filters or date range.</p>
        </div>
      )}
    </div>
  );
}; 