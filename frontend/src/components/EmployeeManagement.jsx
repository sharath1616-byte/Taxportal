import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';
import SimpleNavbar from './SimpleNavbar';
import { 
  Users, 
  Plus, 
  Search,
  Settings,
  Mail,
  Phone,
  Shield,
  UserCheck,
  UserX,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Building,
  Lock,
  Unlock
} from 'lucide-react';

const EmployeeManagement = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newEmployeeForm, setNewEmployeeForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: ''
  });

  // Mock employees data
  const mockEmployees = [
    {
      id: 1,
      firstName: 'Jennifer',
      lastName: 'Adams',
      email: 'jennifer.adams@taxfirm.com',
      phone: '+1 (555) 234-5678',
      position: 'Senior Tax Analyst',
      department: 'Tax Services',
      status: 'active',
      joinDate: '2023-08-15',
      lastLogin: '2024-02-01',
      accessLevel: 'full',
      clientAccess: [1, 2, 3], // Access to client IDs
      permissions: {
        viewClients: true,
        editClients: true,
        viewDocuments: true,
        downloadDocuments: true,
        createInvoices: true,
        sendMessages: true,
        manageEmployees: false
      }
    },
    {
      id: 2,
      firstName: 'David',
      lastName: 'Martinez',
      email: 'david.martinez@taxfirm.com',
      phone: '+1 (555) 345-6789',
      position: 'Junior Accountant',
      department: 'Bookkeeping',
      status: 'active',
      joinDate: '2023-11-20',
      lastLogin: '2024-01-30',
      accessLevel: 'limited',
      clientAccess: [1, 3], // Limited access to specific clients
      permissions: {
        viewClients: true,
        editClients: false,
        viewDocuments: true,
        downloadDocuments: false,
        createInvoices: false,
        sendMessages: true,
        manageEmployees: false
      }
    },
    {
      id: 3,
      firstName: 'Lisa',
      lastName: 'Thompson',
      email: 'lisa.thompson@taxfirm.com',
      phone: '+1 (555) 456-7890',
      position: 'Administrative Assistant',
      department: 'Administration',
      status: 'pending',
      joinDate: '2024-02-01',
      lastLogin: null,
      accessLevel: 'limited',
      clientAccess: [], // No client access yet
      permissions: {
        viewClients: true,
        editClients: false,
        viewDocuments: false,
        downloadDocuments: false,
        createInvoices: false,
        sendMessages: false,
        manageEmployees: false
      }
    }
  ];

  // Mock clients data
  const mockClients = [
    { id: 1, name: 'Sarah Johnson', company: 'Johnson Consulting LLC' },
    { id: 2, name: 'Michael Chen', company: 'TechCorp Industries' },
    { id: 3, name: 'Emily Rodriguez', company: 'StartUp Innovations' },
    { id: 4, name: 'Robert Williams', company: 'Williams & Associates' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setEmployees(mockEmployees);
    setClients(mockClients);
  };

  const filteredEmployees = employees.filter(employee => 
    `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddEmployee = (e) => {
    e.preventDefault();
    const newEmployee = {
      id: Date.now(),
      ...newEmployeeForm,
      status: 'pending',
      joinDate: new Date().toISOString().split('T')[0],
      lastLogin: null,
      accessLevel: 'limited',
      clientAccess: [],
      permissions: {
        viewClients: false,
        editClients: false,
        viewDocuments: false,
        downloadDocuments: false,
        createInvoices: false,
        sendMessages: false,
        manageEmployees: false
      }
    };
    
    setEmployees([...employees, newEmployee]);
    setNewEmployeeForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      position: '',
      department: ''
    });
    setShowAddEmployee(false);
  };

  const updateEmployeeAccess = (employeeId, updates) => {
    setEmployees(employees.map(emp => 
      emp.id === employeeId ? { ...emp, ...updates } : emp
    ));
  };

  const toggleEmployeeStatus = (employeeId) => {
    setEmployees(employees.map(emp => 
      emp.id === employeeId 
        ? { ...emp, status: emp.status === 'active' ? 'inactive' : 'active' }
        : emp
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccessLevelColor = (level) => {
    switch (level) {
      case 'full': return 'bg-blue-100 text-blue-800';
      case 'limited': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const AccessManagementModal = ({ employee, onClose, onSave }) => {
    const [accessData, setAccessData] = useState({
      accessLevel: employee?.accessLevel || 'limited',
      clientAccess: employee?.clientAccess || [],
      permissions: employee?.permissions || {}
    });

    const handleClientAccessToggle = (clientId) => {
      const updatedAccess = accessData.clientAccess.includes(clientId)
        ? accessData.clientAccess.filter(id => id !== clientId)
        : [...accessData.clientAccess, clientId];
      
      setAccessData({ ...accessData, clientAccess: updatedAccess });
    };

    const handlePermissionChange = (permission, value) => {
      setAccessData({
        ...accessData,
        permissions: { ...accessData.permissions, [permission]: value }
      });
    };

    const handleSave = () => {
      onSave(employee.id, accessData);
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <CardTitle>Manage Access - {employee?.firstName} {employee?.lastName}</CardTitle>
            <CardDescription>Configure client access and permissions for this employee</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Access Level */}
            <div>
              <h3 className="font-medium mb-3">Access Level</h3>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="full"
                    checked={accessData.accessLevel === 'full'}
                    onChange={(e) => setAccessData({ ...accessData, accessLevel: e.target.value })}
                  />
                  <span>Full Access - All clients and features</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="limited"
                    checked={accessData.accessLevel === 'limited'}
                    onChange={(e) => setAccessData({ ...accessData, accessLevel: e.target.value })}
                  />
                  <span>Limited Access - Specific clients only</span>
                </label>
              </div>
            </div>

            {/* Client Access */}
            {accessData.accessLevel === 'limited' && (
              <div>
                <h3 className="font-medium mb-3">Client Access</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {clients.map(client => (
                    <label key={client.id} className="flex items-center space-x-2">
                      <Checkbox
                        checked={accessData.clientAccess.includes(client.id)}
                        onCheckedChange={() => handleClientAccessToggle(client.id)}
                      />
                      <span className="text-sm">
                        {client.name} - {client.company}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Permissions */}
            <div>
              <h3 className="font-medium mb-3">Permissions</h3>
              <div className="space-y-3">
                {[
                  { key: 'viewClients', label: 'View Client Information' },
                  { key: 'editClients', label: 'Edit Client Information' },
                  { key: 'viewDocuments', label: 'View Documents' },
                  { key: 'downloadDocuments', label: 'Download Documents' },
                  { key: 'createInvoices', label: 'Create & Send Invoices' },
                  { key: 'sendMessages', label: 'Send Messages to Clients' },
                  { key: 'manageEmployees', label: 'Manage Other Employees' }
                ].map(permission => (
                  <div key={permission.key} className="flex items-center justify-between">
                    <span className="text-sm">{permission.label}</span>
                    <Switch
                      checked={accessData.permissions[permission.key] || false}
                      onCheckedChange={(value) => handlePermissionChange(permission.key, value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <div className="flex justify-end space-x-2 p-6 pt-0">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
            <p className="text-gray-600 mt-2">Manage your team and their client access permissions</p>
          </div>
          <Button onClick={() => setShowAddEmployee(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search employees by name, email, or position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Employee List */}
        <div className="space-y-4">
          {filteredEmployees.map((employee) => (
            <Card key={employee.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {employee.firstName} {employee.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{employee.position} • {employee.department}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="w-4 h-4 mr-1" />
                          {employee.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="w-4 h-4 mr-1" />
                          {employee.phone}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex space-x-2 mb-2">
                        <Badge className={getStatusColor(employee.status)}>
                          {employee.status}
                        </Badge>
                        <Badge className={getAccessLevelColor(employee.accessLevel)}>
                          {employee.accessLevel} access
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        <p>Joined: {employee.joinDate}</p>
                        <p>Last Login: {employee.lastLogin || 'Never'}</p>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setShowAccessModal(true);
                        }}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Manage Access
                      </Button>
                      
                      <Button
                        variant={employee.status === 'active' ? 'destructive' : 'default'}
                        size="sm"
                        onClick={() => toggleEmployeeStatus(employee.id)}
                      >
                        {employee.status === 'active' ? (
                          <>
                            <UserX className="w-4 h-4 mr-2" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4 mr-2" />
                            Activate
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Access Summary */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Client Access</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {employee.accessLevel === 'full' ? 'All Clients' : `${employee.clientAccess.length} Clients`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Permissions</p>
                      <p className="text-lg font-semibold text-green-600">
                        {Object.values(employee.permissions).filter(Boolean).length}/7
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Document Access</p>
                      <div className="flex items-center">
                        {employee.permissions.viewDocuments ? (
                          <Eye className="w-4 h-4 text-green-500 mr-1" />
                        ) : (
                          <Lock className="w-4 h-4 text-red-500 mr-1" />
                        )}
                        <span className="text-sm">
                          {employee.permissions.viewDocuments ? 'Allowed' : 'Restricted'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Invoice Creation</p>
                      <div className="flex items-center">
                        {employee.permissions.createInvoices ? (
                          <Unlock className="w-4 h-4 text-green-500 mr-1" />
                        ) : (
                          <Lock className="w-4 h-4 text-red-500 mr-1" />
                        )}
                        <span className="text-sm">
                          {employee.permissions.createInvoices ? 'Allowed' : 'Restricted'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Employee Modal */}
        {showAddEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md m-4">
              <CardHeader>
                <CardTitle>Add New Employee</CardTitle>
                <CardDescription>Invite a new team member to join your practice</CardDescription>
              </CardHeader>
              <form onSubmit={handleAddEmployee}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="First Name"
                      value={newEmployeeForm.firstName}
                      onChange={(e) => setNewEmployeeForm({...newEmployeeForm, firstName: e.target.value})}
                      required
                    />
                    <Input
                      placeholder="Last Name"
                      value={newEmployeeForm.lastName}
                      onChange={(e) => setNewEmployeeForm({...newEmployeeForm, lastName: e.target.value})}
                      required
                    />
                  </div>
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={newEmployeeForm.email}
                    onChange={(e) => setNewEmployeeForm({...newEmployeeForm, email: e.target.value})}
                    required
                  />
                  <Input
                    placeholder="Phone Number"
                    value={newEmployeeForm.phone}
                    onChange={(e) => setNewEmployeeForm({...newEmployeeForm, phone: e.target.value})}
                  />
                  <Input
                    placeholder="Position/Title"
                    value={newEmployeeForm.position}
                    onChange={(e) => setNewEmployeeForm({...newEmployeeForm, position: e.target.value})}
                    required
                  />
                  <Input
                    placeholder="Department"
                    value={newEmployeeForm.department}
                    onChange={(e) => setNewEmployeeForm({...newEmployeeForm, department: e.target.value})}
                  />
                </CardContent>
                <div className="flex justify-end space-x-2 p-6 pt-0">
                  <Button type="button" variant="outline" onClick={() => setShowAddEmployee(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Send Invitation
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Access Management Modal */}
        {showAccessModal && selectedEmployee && (
          <AccessManagementModal
            employee={selectedEmployee}
            onClose={() => {
              setShowAccessModal(false);
              setSelectedEmployee(null);
            }}
            onSave={updateEmployeeAccess}
          />
        )}
      </div>
    </div>
  );
};

export default EmployeeManagement;