import React, { useState, useContext } from 'react';
import { createPortal } from 'react-dom';
import { Users, Plus, Search, Edit, Eye, EyeOff, Power, QrCode, X } from 'lucide-react';
import classNames from 'classnames';
import { QRCodeSVG } from 'qrcode.react';
import { AuthContext } from '../../context/AuthContext';

const EmployeeManagement = () => {
  const { privileges, user } = useContext(AuthContext) || { privileges: {}, user: {} };
  
  // If no privileges object, default to allowing everything for safety in case context is missing
  // But since we want to restrict based on privileges, we assume empty privileges = NO access, EXCEPT for 'raviram' bypass.
  const hasPrivilege = (action) => {
    if (user?.role?.toLowerCase() === 'admin') return true;
    return !!privileges[`Employee Management_${action}`];
  };

  const canAdd = hasPrivilege('Add');
  const canEdit = hasPrivilege('Edit');
  const canDelete = hasPrivilege('Delete');
  const canView = hasPrivilege('View');

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const initialFormData = {
    id: '',
    name: '',
    department: '',
    designation: '',
    joiningDate: '',
    salary: '',
    supervisor: '',
    contact: '',
    status: 'Active',
    username: '',
    password: '',
    role: '',
    payMode: '',
    upiNo: '',
    accountNumber: '',
    educationalQualification: '',
    skills: '',
    yearsOfExperience: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/roles/`);
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/employees/`);
      if (response.ok) {
        const data = await response.json();
        const mappedData = data.map(emp => ({
          id: emp.employeeId,
          name: emp.fullName,
          department: emp.department,
          designation: emp.designation,
          joiningDate: emp.joiningDate || '',
          salary: emp.salaryDetails || '',
          supervisor: emp.supervisorAssignment || '',
          contact: emp.contactInformation || '',
          status: emp.employmentStatus,
          username: emp.username || '',
          password: emp.password || '',
          role: emp.role || '',
          payMode: emp.payMode || '',
          upiNo: emp.upiNo || '',
          accountNumber: emp.accountNumber || '',
          educationalQualification: emp.educationalQualification || '',
          skills: emp.skills || '',
          yearsOfExperience: emp.yearsOfExperience || ''
        }));
        setEmployees(mappedData);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };
  const [isEditing, setIsEditing] = useState(false);
  const [viewEmployee, setViewEmployee] = useState(null);
  const [qrEmployee, setQrEmployee] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    fetchEmployees();
    fetchRoles();
  }, []);

  const handleToggleStatus = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/employees/${id}/status`, {
        method: 'PUT'
      });
      if (response.ok) {
        await fetchEmployees();
      }
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const openModal = () => {
    setFormData(initialFormData);
    setErrorMsg('');
    setIsEditing(false);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowModal(false);
    document.body.style.overflow = 'unset';
  };

  const handleEdit = (emp) => {
    setFormData({
      id: emp.id,
      name: emp.name,
      department: emp.department,
      designation: emp.designation,
      joiningDate: emp.joiningDate,
      salary: emp.salary,
      supervisor: emp.supervisor,
      contact: emp.contact,
      status: emp.status,
      username: emp.username,
      password: emp.password,
      role: emp.role,
      payMode: emp.payMode,
      upiNo: emp.upiNo,
      accountNumber: emp.accountNumber,
      educationalQualification: emp.educationalQualification,
      skills: emp.skills,
      yearsOfExperience: emp.yearsOfExperience
    });
    setIsEditing(true);
    setErrorMsg('');
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const handleView = (emp) => {
    setViewEmployee(emp);
    document.body.style.overflow = 'hidden';
  };

  const handleQR = (emp) => {
    setQrEmployee(emp);
    document.body.style.overflow = 'hidden';
  };

  const handleSaveEmployee = () => {
    // Basic validation
    if (!formData.id || !formData.name || !formData.department || !formData.designation) {
      setErrorMsg('Please fill in at least the Employee ID, Name, Department, and Designation.');
      return;
    }
    // Show confirmation instead of directly saving
    setShowConfirmModal(true);
  };

  const submitEmployee = async () => {
    try {
      const payload = {
        employeeId: formData.id,
        fullName: formData.name,
        department: formData.department,
        designation: formData.designation,
        joiningDate: formData.joiningDate,
        salaryDetails: formData.salary,
        supervisorAssignment: formData.supervisor,
        contactInformation: formData.contact,
        employmentStatus: formData.status,
        username: formData.username,
        password: formData.password,
        role: formData.role,
        payMode: formData.payMode,
        upiNo: formData.upiNo,
        accountNumber: formData.accountNumber,
        educationalQualification: formData.educationalQualification,
        skills: formData.skills,
        yearsOfExperience: formData.yearsOfExperience
      };

      let url = `${import.meta.env.VITE_API_URL}/employees/`;
      let method = 'POST';

      if (isEditing) {
        url = `${import.meta.env.VITE_API_URL}/employees/${formData.id}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchEmployees();
        setShowConfirmModal(false);
        closeModal();
        setShowSuccessModal(true);
      } else {
        const errorData = await response.json();
        setErrorMsg(errorData.detail || `Error ${isEditing ? 'updating' : 'creating'} employee`);
        setShowConfirmModal(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMsg('Error connecting to the server');
      setShowConfirmModal(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold text-firo-dark m-0 mb-1">Employee Management</h1>
          <p className="text-firo-muted m-0 small">Maintain complete employee information, attendance, and payroll records.</p>
        </div>
        {canAdd && (
          <button 
            className="btn btn-primary bg-firo-primary border-0 rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow-sm"
            onClick={openModal}
          >
            <Plus size={18} /> Add Employee
          </button>
        )}
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="p-4 border-bottom bg-white d-flex align-items-center justify-content-between flex-wrap gap-3">
          <h5 className="m-0 fw-bold text-firo-dark">Employee Records</h5>
          <div className="position-relative" style={{ width: '250px' }}>
            <Search size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-firo-muted" />
            <input 
              type="text" 
              className="form-control rounded-pill ps-5 bg-firo-bg border-0" 
              placeholder="Search employees..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3 px-4">Emp ID</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">Name</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">Dept / Desig</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">Contact</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">Education</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">Skills</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">Experience</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">Pay Mode</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">Status</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3 text-end px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id}>
                  <td className="px-4 fw-medium text-firo-dark">{emp.id}</td>
                  <td>
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '36px', height: '36px' }}>
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <div className="fw-semibold text-firo-dark">{emp.name}</div>
                        <div className="small text-firo-muted">Joined {emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="fw-medium text-firo-dark">{emp.department}</div>
                    <div className="small text-firo-muted">{emp.designation}</div>
                  </td>
                  <td>
                    <div className="small text-firo-dark">{emp.contact}</div>
                    <div className="small text-firo-muted">Sup: {emp.supervisor}</div>
                  </td>
                  <td>
                    <div className="small text-firo-dark">{emp.educationalQualification || 'N/A'}</div>
                  </td>
                  <td>
                    <div className="small text-firo-dark">{emp.skills || 'N/A'}</div>
                  </td>
                  <td>
                    <div className="small text-firo-dark">{emp.yearsOfExperience || 'N/A'}</div>
                  </td>
                  <td>
                    <div className="fw-medium text-firo-dark">{emp.payMode || 'N/A'}</div>
                    {emp.payMode === 'UPI' && emp.upiNo && <div className="small text-firo-muted">{emp.upiNo}</div>}
                    {emp.payMode === 'Bank Transfer' && emp.accountNumber && <div className="small text-firo-muted">{emp.accountNumber}</div>}
                  </td>
                  <td>
                    <span className={classNames('badge rounded-pill px-3 py-2 fw-medium', {
                      'bg-success bg-opacity-10 text-success': emp.status === 'Active',
                      'bg-danger bg-opacity-10 text-danger': emp.status === 'Inactive'
                    })}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="text-end px-4">
                    <div className="d-flex align-items-center justify-content-end gap-2">
                      {canView && (
                        <button className="btn btn-sm btn-light text-firo-primary rounded-circle p-2" title="View Profile" onClick={() => handleView(emp)}>
                          <Eye size={16} />
                        </button>
                      )}
                      {canEdit && (
                        <button className="btn btn-sm btn-light text-firo-primary rounded-circle p-2" title="Edit Record" onClick={() => handleEdit(emp)}>
                          <Edit size={16} />
                        </button>
                      )}
                      {canView && (
                        <button className="btn btn-sm btn-light text-firo-primary rounded-circle p-2" title="QR Code" onClick={() => handleQR(emp)}>
                          <QrCode size={16} />
                        </button>
                      )}
                      {canDelete && (
                        <button 
                          className={classNames('btn btn-sm rounded-circle p-2', {
                            'btn-light text-danger': emp.status === 'Active',
                            'btn-light text-success': emp.status === 'Inactive'
                          })}
                          title={emp.status === 'Active' ? 'Deactivate' : 'Activate'}
                          onClick={() => handleToggleStatus(emp.id)}
                        >
                          <Power size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-firo-muted">
                    No employees found matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && createPortal(
        <>
          <div 
            className="modal-backdrop fade show" 
            style={{ 
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', zIndex: 9998, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)', transform: 'translateZ(0)'
            }}
          ></div>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ zIndex: 9999 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
              <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
                <div className="modal-header border-bottom-0 pb-0 mt-2 mx-2">
                  <h5 className="modal-title fw-bold text-firo-dark fs-4">Add Employee</h5>
                  <button type="button" className="btn btn-link text-firo-muted p-0" onClick={closeModal} aria-label="Close">
                    <X size={24} />
                  </button>
                </div>
                <div className="modal-body py-4 px-4">
                  {errorMsg && (
                    <div className="alert alert-danger py-2 border-0 rounded-3 small fw-medium mb-4">
                      {errorMsg}
                    </div>
                  )}
                  <form onSubmit={(e) => e.preventDefault()}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Employee ID *</label>
                        <input type="text" name="id" value={formData.id} onChange={handleInputChange} className="form-control rounded-3 py-2 bg-firo-bg border-0" placeholder="e.g. EMP-004" autoFocus />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Full Name *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-control rounded-3 py-2 bg-firo-bg border-0" placeholder="e.g. Alice Smith" />
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Department *</label>
                        <select name="department" value={formData.department} onChange={handleInputChange} className="form-select rounded-3 py-2 bg-firo-bg border-0">
                          <option value="">Select dept...</option>
                          <option value="Engineering">Engineering</option>
                          <option value="HR">HR</option>
                          <option value="Finance">Finance</option>
                          <option value="Sales">Sales</option>
                          <option value="Operations">Operations</option>
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Designation *</label>
                        <input type="text" name="designation" value={formData.designation} onChange={handleInputChange} className="form-control rounded-3 py-2 bg-firo-bg border-0" placeholder="e.g. Senior Developer" />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Joining Date</label>
                        <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleInputChange} className="form-control rounded-3 py-2 bg-firo-bg border-0" />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Salary Details</label>
                        <input type="text" name="salary" value={formData.salary} onChange={handleInputChange} className="form-control rounded-3 py-2 bg-firo-bg border-0" placeholder="e.g. $80,000" />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Supervisor Assignment</label>
                        <input type="text" name="supervisor" value={formData.supervisor} onChange={handleInputChange} className="form-control rounded-3 py-2 bg-firo-bg border-0" placeholder="e.g. Sarah Smith" />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Contact Information</label>
                        <input type="email" name="contact" value={formData.contact} onChange={handleInputChange} className="form-control rounded-3 py-2 bg-firo-bg border-0" placeholder="alice@atmeng.com" />
                      </div>
                    </div>

                    <div className="row g-3 mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Employment Status</label>
                        <select name="status" value={formData.status} onChange={handleInputChange} className="form-select rounded-3 py-2 bg-firo-bg border-0">
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Role</label>
                        <select name="role" value={formData.role} onChange={handleInputChange} className="form-select rounded-3 py-2 bg-firo-bg border-0">
                          <option value="">Select Role...</option>
                          {roles.map(r => (
                            <option key={r.id} value={r.name}>{r.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <h6 className="fw-bold text-firo-dark mt-4 mb-3 border-bottom pb-2">Professional Details</h6>
                    <div className="row g-3 mb-3">
                      <div className="col-12 col-md-4">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Educational Qualification</label>
                        <input type="text" name="educationalQualification" value={formData.educationalQualification} onChange={handleInputChange} className="form-control rounded-3 py-2 bg-firo-bg border-0" placeholder="e.g. B.Tech" />
                      </div>
                      <div className="col-12 col-md-4">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Skill</label>
                        <input type="text" name="skills" value={formData.skills} onChange={handleInputChange} className="form-control rounded-3 py-2 bg-firo-bg border-0" placeholder="e.g. React" />
                      </div>
                      <div className="col-12 col-md-4">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Years of Experience</label>
                        <input type="text" name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleInputChange} className="form-control rounded-3 py-2 bg-firo-bg border-0" placeholder="e.g. 3 Years" />
                      </div>
                    </div>

                    <h6 className="fw-bold text-firo-dark mt-4 mb-3 border-bottom pb-2">Payment Details</h6>
                    <div className="row g-3 mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Pay Mode</label>
                        <select name="payMode" value={formData.payMode} onChange={handleInputChange} className="form-select rounded-3 py-2 bg-firo-bg border-0">
                          <option value="">Select Pay Mode...</option>
                          <option value="UPI">UPI</option>
                          <option value="Cash">Cash</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                        </select>
                      </div>
                      {formData.payMode === 'UPI' && (
                        <div className="col-12 col-md-6">
                          <label className="form-label text-firo-muted small fw-semibold text-uppercase">UPI No</label>
                          <input type="text" name="upiNo" value={formData.upiNo} onChange={handleInputChange} className="form-control rounded-3 py-2 bg-firo-bg border-0" placeholder="e.g. 9876543210@upi" />
                        </div>
                      )}
                      {formData.payMode === 'Bank Transfer' && (
                        <div className="col-12 col-md-6">
                          <label className="form-label text-firo-muted small fw-semibold text-uppercase">Account Number</label>
                          <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} className="form-control rounded-3 py-2 bg-firo-bg border-0" placeholder="Enter Account Number" />
                        </div>
                      )}
                    </div>
                    
                    <h6 className="fw-bold text-firo-dark mt-4 mb-3 border-bottom pb-2">Login Credentials (Optional)</h6>
                    <div className="row g-3 mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Username</label>
                        <input type="text" name="username" value={formData.username} onChange={handleInputChange} className="form-control rounded-3 py-2 bg-firo-bg border-0" placeholder="e.g. jdoe123" />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Password</label>
                        <div className="position-relative">
                          <input 
                            type={showPassword ? "text" : "password"} 
                            name="password" 
                            value={formData.password} 
                            onChange={handleInputChange} 
                            className="form-control rounded-3 py-2 bg-firo-bg border-0" 
                            placeholder="••••••••" 
                            style={{ paddingRight: '40px' }}
                          />
                          <button
                            type="button"
                            className="btn border-0 position-absolute end-0 top-50 translate-middle-y text-muted"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ background: 'none' }}
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
                <div className="modal-footer border-top-0 pt-0 pb-4 px-4 d-flex gap-2">
                  <button type="button" className="btn btn-light rounded-pill px-4 flex-grow-1" onClick={closeModal}>Cancel</button>
                  <button type="button" className="btn btn-primary bg-firo-primary border-0 rounded-pill px-4 flex-grow-1" onClick={handleSaveEmployee}>Save Employee</button>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {showConfirmModal && createPortal(
        <>
          <div 
            className="modal-backdrop fade show" 
            style={{ 
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', zIndex: 9998, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)', transform: 'translateZ(0)'
            }}
          ></div>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ zIndex: 9999 }}>
            <div className="modal-dialog modal-dialog-centered modal-sm" role="document" style={{ maxWidth: '350px' }}>
              <div className="modal-content rounded-4 border-0 shadow-lg p-4 text-center">
                <h5 className="fw-bold text-dark mb-3">Confirm Action</h5>
                <p className="text-muted small mb-4">Are you sure you want to add this member?</p>
                <div className="d-flex justify-content-center gap-3">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowConfirmModal(false)}>Cancel</button>
                  <button type="button" className="btn text-white rounded-pill px-4" style={{ backgroundColor: '#5c54ed' }} onClick={submitEmployee}>OK</button>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {showSuccessModal && createPortal(
        <>
          <div 
            className="modal-backdrop fade show" 
            style={{ 
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', zIndex: 9998, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)', transform: 'translateZ(0)'
            }}
          ></div>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ zIndex: 9999 }}>
            <div className="modal-dialog modal-dialog-centered" role="document" style={{ maxWidth: '400px' }}>
              <div className="modal-content rounded-4 border-0 shadow-lg p-4 text-center" style={{ backgroundColor: '#7a5af8', color: 'white' }}>
                <h4 className="fw-bold mb-3 mt-3">Member Successfully Saved!</h4>
                <p className="small opacity-75 mb-4 px-2" style={{ lineHeight: '1.6' }}>
                  {formData.name} has been added to the {formData.department} department. Join the most empowered team on the web!
                </p>
                <div className="mb-2">
                  <button type="button" className="btn btn-light rounded-pill px-4 fw-bold text-secondary" style={{ backgroundColor: '#e5e7eb' }} onClick={() => setShowSuccessModal(false)}>CLOSE WINDOW</button>
                </div>
                <p className="small opacity-75 mt-4 mb-2" style={{ fontSize: '11px' }}>We instantly sync your team roster, so this member is active now!</p>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* View Profile Modal */}
      {viewEmployee && createPortal(
        <>
          <div 
            className="modal-backdrop fade show" 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', zIndex: 9998, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)' }}
          ></div>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ zIndex: 9999 }}>
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
                <div className="modal-header border-0 bg-firo-primary text-white p-4">
                  <h5 className="modal-title fw-bold">Employee Profile</h5>
                  <button type="button" className="btn btn-link text-white p-0" onClick={() => { setViewEmployee(null); document.body.style.overflow = 'unset'; }}>
                    <X size={24} />
                  </button>
                </div>
                <div className="modal-body p-4">
                  <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
                    <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold fs-3 me-3" style={{ width: '64px', height: '64px' }}>
                      {viewEmployee.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="fw-bold m-0">{viewEmployee.name}</h4>
                      <p className="text-muted m-0">{viewEmployee.designation}</p>
                    </div>
                  </div>
                  <div className="row g-3">
                    <div className="col-6">
                      <p className="small text-muted mb-1 text-uppercase fw-semibold">Employee ID</p>
                      <p className="fw-medium text-dark">{viewEmployee.id}</p>
                    </div>
                    <div className="col-6">
                      <p className="small text-muted mb-1 text-uppercase fw-semibold">Department</p>
                      <p className="fw-medium text-dark">{viewEmployee.department}</p>
                    </div>
                    <div className="col-6">
                      <p className="small text-muted mb-1 text-uppercase fw-semibold">Contact</p>
                      <p className="fw-medium text-dark">{viewEmployee.contact}</p>
                    </div>
                    <div className="col-6">
                      <p className="small text-muted mb-1 text-uppercase fw-semibold">Joining Date</p>
                      <p className="fw-medium text-dark">{viewEmployee.joiningDate ? new Date(viewEmployee.joiningDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div className="col-6">
                      <p className="small text-muted mb-1 text-uppercase fw-semibold">Supervisor</p>
                      <p className="fw-medium text-dark">{viewEmployee.supervisor || 'N/A'}</p>
                    </div>
                    <div className="col-6">
                      <p className="small text-muted mb-1 text-uppercase fw-semibold">Pay Mode</p>
                      <p className="fw-medium text-dark mb-0">{viewEmployee.payMode || 'N/A'}</p>
                      {viewEmployee.payMode === 'UPI' && viewEmployee.upiNo && <p className="small text-muted mb-0">{viewEmployee.upiNo}</p>}
                      {viewEmployee.payMode === 'Bank Transfer' && viewEmployee.accountNumber && <p className="small text-muted mb-0">{viewEmployee.accountNumber}</p>}
                    </div>
                    <div className="col-6">
                      <p className="small text-muted mb-1 text-uppercase fw-semibold">Status</p>
                      <span className={classNames('badge rounded-pill px-3 py-1 fw-medium', {
                        'bg-success bg-opacity-10 text-success': viewEmployee.status === 'Active',
                        'bg-danger bg-opacity-10 text-danger': viewEmployee.status === 'Inactive'
                      })}>
                        {viewEmployee.status}
                      </span>
                    </div>
                    <div className="col-12 border-top pt-3 mt-3">
                      <h6 className="fw-bold text-firo-dark mb-3">Professional Details</h6>
                      <div className="row g-3">
                        <div className="col-4">
                          <p className="small text-muted mb-1 text-uppercase fw-semibold">Education</p>
                          <p className="fw-medium text-dark">{viewEmployee.educationalQualification || 'N/A'}</p>
                        </div>
                        <div className="col-4">
                          <p className="small text-muted mb-1 text-uppercase fw-semibold">Skills</p>
                          <p className="fw-medium text-dark">{viewEmployee.skills || 'N/A'}</p>
                        </div>
                        <div className="col-4">
                          <p className="small text-muted mb-1 text-uppercase fw-semibold">Experience</p>
                          <p className="fw-medium text-dark">{viewEmployee.yearsOfExperience || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* QR Code Modal */}
      {qrEmployee && createPortal(
        <>
          <div 
            className="modal-backdrop fade show" 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', zIndex: 9998, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)' }}
          ></div>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ zIndex: 9999 }}>
            <div className="modal-dialog modal-dialog-centered modal-sm" role="document">
              <div className="modal-content rounded-4 border-0 shadow-lg p-4 text-center">
                <div className="d-flex justify-content-end mb-2">
                  <button type="button" className="btn btn-link text-muted p-0" onClick={() => { setQrEmployee(null); document.body.style.overflow = 'unset'; }}>
                    <X size={20} />
                  </button>
                </div>
                <h5 className="fw-bold text-dark mb-1">Employee QR Code</h5>
                <p className="text-muted small mb-4">{qrEmployee.name} ({qrEmployee.id})</p>
                
                <div className="d-flex justify-content-center bg-light p-4 rounded-4 mx-auto mb-3" style={{ width: 'fit-content' }}>
                  <QRCodeSVG value={qrEmployee.id} size={180} />
                </div>
                
                <p className="small text-muted mt-2">Scan this code at the kiosk for attendance.</p>
                <button 
                  className="btn btn-outline-primary rounded-pill px-4 mt-2 fw-medium"
                  onClick={() => {
                    const canvas = document.createElement("canvas");
                    const svg = document.querySelector(".modal-content svg");
                    const svgData = new XMLSerializer().serializeToString(svg);
                    const img = new Image();
                    img.onload = () => {
                      canvas.width = img.width;
                      canvas.height = img.height;
                      canvas.getContext("2d").drawImage(img, 0, 0);
                      const a = document.createElement("a");
                      a.download = `QR_${qrEmployee.id}.png`;
                      a.href = canvas.toDataURL("image/png");
                      a.click();
                    };
                    img.src = "data:image/svg+xml;base64," + btoa(svgData);
                  }}
                >
                  Download QR Code
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default EmployeeManagement;
