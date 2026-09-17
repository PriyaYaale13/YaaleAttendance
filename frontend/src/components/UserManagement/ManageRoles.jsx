import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Shield, X, Check } from 'lucide-react';
import classNames from 'classnames';

const ManageRoles = () => {
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEntries, setShowEntries] = useState(10);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({ id: null, name: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRoles = async () => {
    try {
      const response = await fetch('http://localhost:8000/roles/');
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const openAddModal = () => {
    setFormData({ id: null, name: '' });
    setIsEditing(false);
    setErrorMsg('');
    setShowModal(true);
  };

  const openEditModal = (role) => {
    setFormData({ id: role.id, name: role.name });
    setIsEditing(true);
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      if (isEditing) {
        const response = await fetch(`http://localhost:8000/roles/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formData.name.trim() })
        });
        if (response.ok) {
          await fetchRoles();
          setShowModal(false);
        } else {
          const errData = await response.json();
          setErrorMsg(errData.detail || 'Failed to update role');
        }
      } else {
        const response = await fetch('http://localhost:8000/roles/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formData.name.trim() })
        });
        if (response.ok) {
          await fetchRoles();
          setShowModal(false);
        } else {
          const errData = await response.json();
          setErrorMsg(errData.detail || 'Failed to create role');
        }
      }
    } catch (err) {
      setErrorMsg('Network error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;
    try {
      const response = await fetch(`http://localhost:8000/roles/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await fetchRoles();
      } else {
        alert("Failed to delete role.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid py-4 h-100 overflow-auto position-relative">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h1 className="h3 fw-bold text-dark m-0 mb-1">Role Management</h1>
          <p className="text-muted m-0 small">Showing {filteredRoles.length} of {roles.length} entries</p>
        </div>
        <div>
          <button 
            className="btn btn-primary bg-firo-primary border-0 rounded-3 px-3 py-2 d-flex align-items-center gap-2 fw-medium shadow-sm"
            onClick={openAddModal}
          >
            <Plus size={18} /> Add New
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white">
        <div className="card-body p-4">
          <div className="mb-4">
            <div className="position-relative">
              <Search className="position-absolute top-50 translate-middle-y text-muted ms-3" size={18} />
              <input 
                type="text" 
                className="form-control rounded-3 ps-5 bg-light border-0 py-2" 
                placeholder="Search roles..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center gap-2 text-muted fw-medium" style={{ fontSize: '13px' }}>
              Show
              <select
                value={showEntries}
                onChange={(e) => setShowEntries(Number(e.target.value))}
                style={{
                  fontSize: '13px',
                  padding: '2px 28px 2px 8px',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  backgroundColor: '#f8f9fa',
                  appearance: 'auto',
                  width: 'auto',
                  cursor: 'pointer'
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              entries
            </div>
            <div className="text-muted fw-medium" style={{ fontSize: '13px' }}>
              Showing 1 to {filteredRoles.length} of {roles.length} entries
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle border">
              <thead className="bg-light">
                <tr>
                  <th className="text-muted small fw-bold text-uppercase px-4 py-3" style={{ width: '80px' }}>#</th>
                  <th className="text-muted small fw-bold text-uppercase px-4 py-3">ROLE</th>
                  <th className="text-muted small fw-bold text-uppercase px-4 py-3 text-end">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoles.slice(0, showEntries).map((role, idx) => (
                  <tr key={role.id}>
                    <td className="px-4 py-3 text-muted">{idx + 1}</td>
                    <td className="px-4 py-3 fw-medium text-dark">{role.name}</td>
                    <td className="px-4 py-3 text-end">
                      <button 
                        className="btn btn-link text-warning p-1 me-2" 
                        title="Edit"
                        onClick={() => openEditModal(role)}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="btn btn-link text-danger p-1" 
                        title="Delete"
                        onClick={() => handleDelete(role.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredRoles.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center py-4 text-muted">No roles found matching "{searchTerm}"</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ width: '100%', maxWidth: '400px' }}>
            <div className="card-header border-0 px-4 py-3 d-flex align-items-center justify-content-between bg-firo-primary text-white">
              <h5 className="m-0 fw-bold d-flex align-items-center gap-2 fs-6">
                <Shield size={18} /> {isEditing ? 'Edit Role' : 'Add New Role'}
              </h5>
              <button className="btn btn-link text-white p-0" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="card-body p-4 bg-white">
              {errorMsg && (
                <div className="alert alert-danger py-2 small fw-medium mb-3">
                  {errorMsg}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label text-muted small fw-bold text-uppercase">ROLE NAME</label>
                  <input 
                    type="text" 
                    className="form-control rounded-3 py-2" 
                    placeholder="Enter role name (e.g. Manager)" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="d-flex justify-content-between gap-3">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary rounded-3 px-4 py-2 fw-medium flex-grow-1" 
                    onClick={() => setShowModal(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary bg-firo-primary rounded-3 px-4 py-2 fw-medium flex-grow-1 border-0" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : (isEditing ? 'Update Role' : 'Create Role')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRoles;
