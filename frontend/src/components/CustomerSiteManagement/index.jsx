import React, { useState, useEffect } from 'react';
import { Search, Plus, MapPin, Users, Clock, Edit2, Trash2, Shield, Eye, QrCode } from 'lucide-react';
import classNames from 'classnames';
import { createPortal } from 'react-dom';

const CustomerSiteManagement = () => {
  const [sites, setSites] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [viewSite, setViewSite] = useState(null);

  const initialFormData = {
    id: null,
    siteName: '',
    customerName: '',
    siteLocation: '',
    assignedSupervisor: '',
    assignedEmployees: '',
    workingHours: '',
    qrCodeConfig: '',
    siteStatus: 'Active'
  };

  const [formData, setFormData] = useState(initialFormData);

  const fetchSites = async () => {
    try {
      const response = await fetch('http://localhost:8000/customer-sites/');
      if (response.ok) {
        const data = await response.json();
        setSites(data);
      }
    } catch (error) {
      console.error('Error fetching customer sites:', error);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const openModal = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setErrorMsg('');
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'unset';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (site) => {
    setFormData({
      id: site.id,
      siteName: site.siteName,
      customerName: site.customerName,
      siteLocation: site.siteLocation,
      assignedSupervisor: site.assignedSupervisor,
      assignedEmployees: site.assignedEmployees,
      workingHours: site.workingHours,
      qrCodeConfig: site.qrCodeConfig,
      siteStatus: site.siteStatus
    });
    setIsEditing(true);
    setErrorMsg('');
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const handleView = (site) => {
    setViewSite(site);
    document.body.style.overflow = 'hidden';
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this site?')) {
      try {
        const response = await fetch(`http://localhost:8000/customer-sites/${id}`, {
          method: 'DELETE'
        });
        if(response.ok) {
          fetchSites();
        }
      } catch(error) {
         console.error('Error deleting site:', error);
      }
    }
  };

  const submitSite = async (e) => {
    e.preventDefault();
    if (!formData.siteName || !formData.customerName || !formData.siteLocation) {
      setErrorMsg('Please fill out all required fields.');
      return;
    }

    try {
      const payload = {
        siteName: formData.siteName,
        customerName: formData.customerName,
        siteLocation: formData.siteLocation,
        assignedSupervisor: formData.assignedSupervisor,
        assignedEmployees: formData.assignedEmployees,
        workingHours: formData.workingHours,
        qrCodeConfig: formData.qrCodeConfig,
        siteStatus: formData.siteStatus
      };

      let url = 'http://localhost:8000/customer-sites/';
      let method = 'POST';

      if (isEditing) {
        url = `http://localhost:8000/customer-sites/${formData.id}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await fetchSites();
        closeModal();
      } else {
        const errorData = await response.json();
        setErrorMsg(errorData.detail || 'Failed to save customer site');
      }
    } catch (error) {
      console.error('Error saving customer site:', error);
      setErrorMsg('Network error. Failed to connect to server.');
    }
  };

  const filteredSites = sites.filter(site => 
    site.siteName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    site.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold text-firo-dark m-0 mb-1">Customer Site Management</h1>
          <p className="text-firo-muted m-0 small">Manage customer work sites and QR code configurations.</p>
        </div>
        <button 
          className="btn btn-primary bg-firo-primary border-0 rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow-sm"
          onClick={openModal}
        >
          <Plus size={18} /> Add Site
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="p-4 border-bottom bg-white d-flex align-items-center justify-content-between flex-wrap gap-3">
          <h5 className="m-0 fw-bold text-firo-dark">Work Sites</h5>
          <div className="position-relative" style={{ width: '250px' }}>
            <Search size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-firo-muted" />
            <input 
              type="text" 
              className="form-control rounded-pill ps-5 bg-firo-bg border-0" 
              placeholder="Search sites..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3 px-4">Site Name</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">Customer</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">Location</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">Supervisor</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">Status</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3 text-end px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {filteredSites.map((site) => (
                <tr key={site.id}>
                  <td className="px-4 fw-medium text-firo-dark">{site.siteName}</td>
                  <td><div className="fw-medium text-firo-dark">{site.customerName}</div></td>
                  <td>
                    <div className="d-flex align-items-center gap-2 text-firo-dark">
                      <MapPin size={16} className="text-firo-muted" />
                      {site.siteLocation}
                    </div>
                  </td>
                  <td>
                    <div className="small text-firo-dark">{site.assignedSupervisor || 'Unassigned'}</div>
                  </td>
                  <td>
                    <span className={classNames('badge rounded-pill px-3 py-2 fw-medium', {
                      'bg-success bg-opacity-10 text-success': site.siteStatus === 'Active',
                      'bg-danger bg-opacity-10 text-danger': site.siteStatus === 'Inactive'
                    })}>
                      {site.siteStatus}
                    </span>
                  </td>
                  <td className="text-end px-4">
                    <div className="d-flex align-items-center justify-content-end gap-2">
                      <button className="btn btn-sm btn-light text-firo-primary rounded-circle p-2" title="View Site" onClick={() => handleView(site)}>
                        <Eye size={16} />
                      </button>
                      <button className="btn btn-sm btn-light text-firo-primary rounded-circle p-2" title="Edit Site" onClick={() => handleEdit(site)}>
                        <Edit2 size={16} />
                      </button>
                      <button className="btn btn-sm btn-light text-danger rounded-circle p-2" title="Delete Site" onClick={() => handleDelete(site.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSites.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    No customer sites found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && createPortal(
        <>
          <div className="modal-backdrop fade show" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', zIndex: 9998, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)' }}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 9999 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
                <div className="modal-header border-0 bg-firo-primary text-white p-4">
                  <h5 className="modal-title fw-bold flex-grow-1">{isEditing ? 'Edit Customer Site' : 'Add New Customer Site'}</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={closeModal}></button>
                </div>
                
                <form onSubmit={submitSite}>
                  <div className="modal-body p-4 bg-white" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                    {errorMsg && (
                      <div className="alert alert-danger border-0 rounded-3 small fw-medium mb-4">{errorMsg}</div>
                    )}
                    
                    <h6 className="fw-bold text-firo-dark mb-3 border-bottom pb-2">Basic Details</h6>
                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Site Name *</label>
                        <input type="text" name="siteName" value={formData.siteName} onChange={handleInputChange} className="form-control rounded-3 py-2 bg-firo-bg border-0" placeholder="e.g. Downtown Plaza Project" required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Customer Name *</label>
                        <input type="text" name="customerName" value={formData.customerName} onChange={handleInputChange} className="form-control rounded-3 py-2 bg-firo-bg border-0" placeholder="e.g. Acme Corp" required />
                      </div>
                      <div className="col-md-12">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Site Location/Address *</label>
                        <textarea name="siteLocation" value={formData.siteLocation} onChange={handleInputChange} className="form-control rounded-3 py-2 bg-firo-bg border-0" placeholder="123 Main St, City" rows="2" required></textarea>
                      </div>
                    </div>

                    <h6 className="fw-bold text-firo-dark mb-3 border-bottom pb-2">Management & Assignment</h6>
                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Assigned Supervisor</label>
                        <input type="text" name="assignedSupervisor" value={formData.assignedSupervisor} onChange={handleInputChange} className="form-control rounded-3 py-2 bg-firo-bg border-0" placeholder="e.g. John Doe" />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Assigned Employees</label>
                        <input type="text" name="assignedEmployees" value={formData.assignedEmployees} onChange={handleInputChange} className="form-control rounded-3 py-2 bg-firo-bg border-0" placeholder="e.g. EMP001, EMP002 (comma separated)" />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Working Hours</label>
                        <input type="text" name="workingHours" value={formData.workingHours} onChange={handleInputChange} className="form-control rounded-3 py-2 bg-firo-bg border-0" placeholder="e.g. 09:00 AM - 05:00 PM" />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Status</label>
                        <select name="siteStatus" value={formData.siteStatus} onChange={handleInputChange} className="form-select rounded-3 py-2 bg-firo-bg border-0">
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    <h6 className="fw-bold text-firo-dark mb-3 border-bottom pb-2">QR Configuration</h6>
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">QR Code Key / Configuration</label>
                        <input type="text" name="qrCodeConfig" value={formData.qrCodeConfig} onChange={handleInputChange} className="form-control rounded-3 py-2 bg-firo-bg border-0" placeholder="e.g. SITE_QR_ACME_123" />
                        <div className="form-text small text-firo-muted mt-1">This identifier is used to generate the check-in QR code for this specific site.</div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer border-0 p-4 bg-light">
                    <button type="button" className="btn btn-light rounded-pill px-4 fw-medium" onClick={closeModal}>Cancel</button>
                    <button type="submit" className="btn btn-primary bg-firo-primary border-0 rounded-pill px-4 fw-medium shadow-sm">
                      {isEditing ? 'Update Site' : 'Save Site'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
      
      {/* View Site Modal */}
      {viewSite && createPortal(
        <>
          <div className="modal-backdrop fade show" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', zIndex: 9998, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)' }}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 9999 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
                <div className="modal-header border-0 bg-firo-primary text-white p-4">
                  <h5 className="modal-title fw-bold">Customer Site Details</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => { setViewSite(null); document.body.style.overflow = 'unset'; }}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
                    <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold fs-3 me-3" style={{ width: '64px', height: '64px' }}>
                      <MapPin size={28} />
                    </div>
                    <div>
                      <h4 className="fw-bold m-0 text-firo-dark">{viewSite.siteName}</h4>
                      <p className="text-firo-muted m-0">{viewSite.customerName}</p>
                    </div>
                  </div>
                  <div className="row g-4">
                    <div className="col-12">
                      <p className="small text-muted mb-1 text-uppercase fw-semibold">Location</p>
                      <p className="fw-medium text-dark">{viewSite.siteLocation}</p>
                    </div>
                    <div className="col-6">
                      <p className="small text-muted mb-1 text-uppercase fw-semibold">Supervisor</p>
                      <p className="fw-medium text-dark">{viewSite.assignedSupervisor || 'N/A'}</p>
                    </div>
                    <div className="col-6">
                      <p className="small text-muted mb-1 text-uppercase fw-semibold">Working Hours</p>
                      <p className="fw-medium text-dark">{viewSite.workingHours || 'N/A'}</p>
                    </div>
                    <div className="col-12">
                      <p className="small text-muted mb-1 text-uppercase fw-semibold">Assigned Employees</p>
                      <p className="fw-medium text-dark">{viewSite.assignedEmployees || 'N/A'}</p>
                    </div>
                    <div className="col-6">
                      <p className="small text-muted mb-1 text-uppercase fw-semibold">QR Code Config</p>
                      <p className="fw-medium text-dark">{viewSite.qrCodeConfig || 'N/A'}</p>
                    </div>
                    <div className="col-6">
                      <p className="small text-muted mb-1 text-uppercase fw-semibold">Status</p>
                      <span className={classNames('badge rounded-pill px-3 py-1 fw-medium', {
                        'bg-success bg-opacity-10 text-success': viewSite.siteStatus === 'Active',
                        'bg-danger bg-opacity-10 text-danger': viewSite.siteStatus === 'Inactive'
                      })}>
                        {viewSite.siteStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default CustomerSiteManagement;
