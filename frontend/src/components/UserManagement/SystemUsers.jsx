import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, User, Mail, Building, Eye, EyeOff, Edit, Trash2, Shield } from 'lucide-react';
import EmptyState from '../ui/EmptyState';

const SystemUsers = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    midName: '',
    lastName: '',
    gender: '',
    birthDate: '',
    userName: '',
    password: '',
    confirmPassword: '',
    email: '',
    secondaryEmail: '',
    contactNo: '',
    secondaryContactNo: '',
    role: '',
    systemDateFormat: 'DD/MM/YYYY'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://72.62.227.163:8010/system-users/');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('http://72.62.227.163:8010/roles/');
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const url = isEditing ? `http://72.62.227.163:8010/system-users/${currentUserId}` : 'http://72.62.227.163:8010/system-users/';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchUsers();
        setShowAddForm(false);
        setIsEditing(false);
        setCurrentUserId(null);
        setFormData({
          firstName: '', midName: '', lastName: '', gender: '', birthDate: '',
          userName: '', password: '', confirmPassword: '', email: '',
          secondaryEmail: '', contactNo: '', secondaryContactNo: '',
          role: 'admin', systemDateFormat: 'DD/MM/YYYY'
        });
      } else {
        const errorData = await response.json();
        alert(errorData.detail || 'Error creating user');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error connecting to the server');
    }
  };

  const handleEdit = (user) => {
    setFormData({
      firstName: user.firstName || '',
      midName: user.midName || '',
      lastName: user.lastName || '',
      gender: user.gender || '',
      birthDate: user.birthDate || '',
      userName: user.userName || '',
      password: '', // Don't populate password
      confirmPassword: '',
      email: user.email || '',
      secondaryEmail: user.secondaryEmail || '',
      contactNo: user.contactNo || '',
      secondaryContactNo: user.secondaryContactNo || '',
      role: user.role || 'admin',
      systemDateFormat: user.systemDateFormat || 'DD/MM/YYYY'
    });
    setCurrentUserId(user.id);
    setIsEditing(true);
    setIsViewing(false);
    setShowAddForm(true);
  };

  const handleView = (user) => {
    handleEdit(user);
    setIsViewing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch(`http://72.62.227.163:8010/system-users/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchUsers();
        } else {
          alert('Error deleting user');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error connecting to the server');
      }
    }
  };

  if (showAddForm) {
    return (
      <div className="container-fluid py-4 h-100 overflow-auto bg-light">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 fw-bold text-firo-dark m-0 mb-1">
              {isViewing ? 'View User' : isEditing ? 'Edit User' : 'Add System User'}
            </h1>
            <p className="text-firo-muted m-0 small">
              {isViewing ? 'User details.' : isEditing ? 'Update system user details.' : 'Create a new system user.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Personal Information Section */}
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-white border-bottom-0 pt-4 pb-0 px-4">
              <h5 className="text-primary fw-bold d-flex align-items-center gap-2 m-0">
                <User size={18} /> Personal Information
              </h5>
              <hr className="text-muted opacity-25 mt-3 mb-0" />
            </div>
            <div className="card-body p-4">
              <div className="row g-4">
                <div className="col-md-4">
                  <label className="form-label text-muted small fw-semibold text-uppercase">First Name *</label>
                  <input type="text" className="form-control rounded-3" name="firstName" value={formData.firstName} onChange={handleChange} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label text-muted small fw-semibold text-uppercase">Mid Name</label>
                  <input type="text" className="form-control rounded-3" name="midName" value={formData.midName} onChange={handleChange} />
                </div>
                <div className="col-md-4">
                  <label className="form-label text-muted small fw-semibold text-uppercase">Last Name *</label>
                  <input type="text" className="form-control rounded-3" name="lastName" value={formData.lastName} onChange={handleChange} required />
                </div>

                <div className="col-md-4">
                  <label className="form-label text-muted small fw-semibold text-uppercase">Gender</label>
                  <select className="form-select rounded-3" name="gender" value={formData.gender} onChange={handleChange}>
                    <option value="">Select Gender..</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label text-muted small fw-semibold text-uppercase">Birth Date</label>
                  <input type="date" className="form-control rounded-3" name="birthDate" value={formData.birthDate} onChange={handleChange} />
                </div>
                <div className="col-md-4">
                  <label className="form-label text-muted small fw-semibold text-uppercase">User Name *</label>
                  <input type="text" className="form-control rounded-3 bg-light" name="userName" value={formData.userName} onChange={handleChange} required />
                </div>

                <div className="col-md-4">
                  <label className="form-label text-muted small fw-semibold text-uppercase">Password *</label>
                  <div className="position-relative">
                    <input type={showPassword ? "text" : "password"} className="form-control rounded-3 bg-light" name="password" value={formData.password} onChange={handleChange} required />
                    <button type="button" className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted p-0 pe-3" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="col-md-4">
                  <label className="form-label text-muted small fw-semibold text-uppercase">Confirm Password *</label>
                  <div className="position-relative">
                    <input type={showConfirmPassword ? "text" : "password"} className="form-control rounded-3" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
                    <button type="button" className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted p-0 pe-3" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-white border-bottom-0 pt-4 pb-0 px-4">
              <h5 className="text-primary fw-bold d-flex align-items-center gap-2 m-0">
                <Mail size={18} /> Contact Information
              </h5>
              <hr className="text-muted opacity-25 mt-3 mb-0" />
            </div>
            <div className="card-body p-4">
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label text-muted small fw-semibold text-uppercase">Email *</label>
                  <input type="email" className="form-control rounded-3" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted small fw-semibold text-uppercase">Secondary Email</label>
                  <input type="email" className="form-control rounded-3" name="secondaryEmail" value={formData.secondaryEmail} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted small fw-semibold text-uppercase">Contact No</label>
                  <input type="text" className="form-control rounded-3" name="contactNo" value={formData.contactNo} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted small fw-semibold text-uppercase">Secondary Contact No</label>
                  <input type="text" className="form-control rounded-3" name="secondaryContactNo" value={formData.secondaryContactNo} onChange={handleChange} />
                </div>
              </div>
            </div>
          </div>

          {/* Organization & Role Section */}
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-white border-bottom-0 pt-4 pb-0 px-4">
              <h5 className="text-primary fw-bold d-flex align-items-center gap-2 m-0">
                <Building size={18} /> Organization & Role
              </h5>
              <hr className="text-muted opacity-25 mt-3 mb-0" />
            </div>
            <div className="card-body p-4">
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label text-muted small fw-semibold text-uppercase">Role *</label>
                  <select
                    className="form-select rounded-3"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    disabled={isViewing}
                  >
                    <option value="">-- Select a Role --</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted small fw-semibold text-uppercase">System Date Format</label>
                  <select className="form-select rounded-3" name="systemDateFormat" value={formData.systemDateFormat} onChange={handleChange}>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-3 mb-5">
            <button type="button" className="btn btn-light rounded-pill px-4 fw-medium" onClick={() => setShowAddForm(false)}>
              {isViewing ? 'Close' : 'Cancel'}
            </button>
            {!isViewing && (
              <button type="submit" className="btn btn-primary bg-firo-primary rounded-pill px-4 fw-medium d-flex align-items-center gap-2 border-0">
                {isEditing ? 'Update User' : 'Create User'}
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 h-100 overflow-auto">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h1 className="h3 fw-bold text-firo-dark m-0 mb-1">System Users</h1>
          <p className="text-firo-muted m-0 small">Manage system users and access controls.</p>
        </div>
          <div className="d-flex gap-2">
            <button 
              className="btn btn-primary bg-firo-primary border-0 rounded-pill px-4 py-2 d-flex align-items-center gap-2 fw-medium shadow-sm transition-all hover-translate-y"
              onClick={() => {
                setFormData({
                  firstName: '', midName: '', lastName: '', gender: '', birthDate: '',
                  userName: '', password: '', confirmPassword: '', email: '',
                  secondaryEmail: '', contactNo: '', secondaryContactNo: '',
                  role: 'admin', systemDateFormat: 'DD/MM/YYYY'
                });
                setIsEditing(false);
                setIsViewing(false);
                setCurrentUserId(null);
                setShowAddForm(true);
              }}
            >
              <Plus size={18} /> Add User
            </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <div className="card-body p-0">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center p-4 border-bottom border-light">
            <h5 className="m-0 fw-bold text-firo-dark">User List</h5>
            <div className="d-flex gap-3 align-items-center mt-3 mt-md-0">
              <div className="position-relative">
                <Search className="position-absolute top-50 translate-middle-y text-muted ms-3" size={16} />
                <input 
                  type="text" 
                  className="form-control rounded-pill ps-5 bg-light border-0" 
                  placeholder="Search users..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '250px' }}
                />
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-light bg-opacity-50">
            {users.length === 0 ? (
              <EmptyState 
                icon={Users}
                title="No users found"
                description="There are currently no users in the system. Click 'Add User' to create one."
                actionLabel="Add User"
                onAction={() => setShowAddForm(true)}
              />
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle m-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="text-muted small fw-semibold text-uppercase px-4 py-3">Name</th>
                      <th className="text-muted small fw-semibold text-uppercase px-4 py-3">Username</th>
                      <th className="text-muted small fw-semibold text-uppercase px-4 py-3">Email</th>
                      <th className="text-muted small fw-semibold text-uppercase px-4 py-3">Role</th>
                      <th className="text-muted small fw-semibold text-uppercase px-4 py-3 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(user => 
                      (user.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                      (user.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (user.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (user.role || '').toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((user, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3">{user.firstName} {user.lastName}</td>
                        <td className="px-4 py-3">{user.userName}</td>
                        <td className="px-4 py-3">{user.email}</td>
                        <td className="px-4 py-3"><span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-1">{user.role}</span></td>
                        <td className="px-4 py-3 text-end">
                          <button className="btn btn-link text-primary p-1 me-2" title="View" onClick={() => handleView(user)}>
                            <Eye size={16} />
                          </button>
                          <button className="btn btn-link text-warning p-1 me-2" title="Edit" onClick={() => handleEdit(user)}>
                            <Edit size={16} />
                          </button>
                          <button className="btn btn-link text-danger p-1" title="Delete" onClick={() => handleDelete(user.id)}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemUsers;
