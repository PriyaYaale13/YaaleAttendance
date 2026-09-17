import React, { useState, useEffect } from 'react';
import { Search, Plus, FileText, Download, Trash2, CheckCircle, XCircle } from 'lucide-react';
import classNames from 'classnames';
import { createPortal } from 'react-dom';

const DocumentManagement = () => {
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    documentCategory: '',
    documentStatus: 'Active',
    expiryDate: '',
    file: null
  });

  const categories = [
    'Educational qualifications',
    'Professional certificates',
    'Identification documents',
    'Singapore employment-related identification or work documents',
    'Other documents'
  ];

  const fetchDocuments = async () => {
    try {
      const response = await fetch('http://72.62.227.163:8010/employee-documents/');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const openModal = () => {
    setFormData({
      employeeId: '',
      employeeName: '',
      documentCategory: '',
      documentStatus: 'Active',
      expiryDate: '',
      file: null
    });
    setErrorMsg('');
    setSuccessMsg('');
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

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, file: e.target.files[0] }));
    }
  };

  const lookupEmployee = async () => {
    if (!formData.employeeId) return;
    try {
      // Find employee from all employees to get name
      const res = await fetch('http://72.62.227.163:8010/employees/');
      if (res.ok) {
        const emps = await res.json();
        const emp = emps.find(e => e.employeeId === formData.employeeId);
        if (emp) {
          setFormData(prev => ({ ...prev, employeeName: emp.fullName }));
          setErrorMsg('');
        } else {
          setFormData(prev => ({ ...prev, employeeName: '' }));
          setErrorMsg('Employee ID not found');
        }
      }
    } catch (err) {
      console.error("Lookup failed", err);
    }
  };

  const submitDocument = async (e) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.employeeName || !formData.documentCategory || !formData.file) {
      setErrorMsg('Please fill all required fields and select a file.');
      return;
    }

    try {
      const payload = new FormData();
      payload.append('employeeId', formData.employeeId);
      payload.append('documentCategory', formData.documentCategory);
      payload.append('documentStatus', formData.documentStatus);
      if (formData.expiryDate) {
        payload.append('expiryDate', formData.expiryDate);
      }
      payload.append('file', formData.file);

      const response = await fetch('http://72.62.227.163:8010/employee-documents/', {
        method: 'POST',
        body: payload
      });

      if (response.ok) {
        await fetchDocuments();
        closeModal();
      } else {
        const errorData = await response.json();
        setErrorMsg(errorData.detail || 'Failed to upload document');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      setErrorMsg('Network error. Failed to connect to server.');
    }
  };

  const handleDownload = (doc) => {
    window.open(`http://72.62.227.163:8010/employee-documents/download/${doc.id}`, '_blank');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        const response = await fetch(`http://72.62.227.163:8010/employee-documents/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          fetchDocuments();
        }
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }
  };

  const filteredDocs = documents.filter(doc => 
    doc.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) || 
    doc.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold text-firo-dark m-0 mb-1">Employee Document Management</h1>
          <p className="text-firo-muted m-0 small">Securely store and manage employee documents.</p>
        </div>
        <button 
          className="btn btn-primary bg-firo-primary border-0 rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow-sm"
          onClick={openModal}
        >
          <Plus size={18} /> Upload Document
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="p-4 border-bottom bg-white d-flex align-items-center justify-content-between flex-wrap gap-3">
          <h5 className="m-0 fw-bold text-firo-dark">Employee Documents</h5>
          <div className="position-relative" style={{ width: '250px' }}>
            <Search size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-firo-muted" />
            <input 
              type="text" 
              className="form-control rounded-pill ps-5 bg-firo-bg border-0" 
              placeholder="Search documents..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3 px-4">Employee</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">Category</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">File Name</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">Expiry Date</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">Status</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3 text-end px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {filteredDocs.map((doc) => (
                <tr key={doc.id}>
                  <td className="px-4">
                    <div className="fw-medium text-firo-dark">{doc.employeeName}</div>
                    <div className="small text-firo-muted">{doc.employeeId}</div>
                  </td>
                  <td><div className="small fw-medium text-firo-dark">{doc.documentCategory}</div></td>
                  <td>
                    <div className="d-flex align-items-center gap-2 text-firo-dark small">
                      <FileText size={16} className="text-firo-muted" />
                      {doc.fileName}
                    </div>
                  </td>
                  <td>
                    <div className="small text-firo-dark">{doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : 'N/A'}</div>
                  </td>
                  <td>
                    <span className={classNames('badge rounded-pill px-3 py-1 fw-medium', {
                      'bg-success bg-opacity-10 text-success': doc.documentStatus === 'Active',
                      'bg-danger bg-opacity-10 text-danger': doc.documentStatus === 'Inactive' || doc.documentStatus === 'Expired'
                    })}>
                      {doc.documentStatus}
                    </span>
                  </td>
                  <td className="text-end px-4">
                    <div className="d-flex align-items-center justify-content-end gap-2">
                      <button className="btn btn-sm btn-light text-firo-primary rounded-circle p-2" title="Download" onClick={() => handleDownload(doc)}>
                        <Download size={16} />
                      </button>
                      <button className="btn btn-sm btn-light text-danger rounded-circle p-2" title="Delete" onClick={() => handleDelete(doc.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDocs.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    No documents found.
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
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
                <div className="modal-header border-0 bg-firo-primary text-white p-4">
                  <h5 className="modal-title fw-bold flex-grow-1">Upload Document</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={closeModal}></button>
                </div>
                
                <form onSubmit={submitDocument}>
                  <div className="modal-body p-4 bg-white">
                    {errorMsg && (
                      <div className="alert alert-danger border-0 rounded-3 small fw-medium mb-4">{errorMsg}</div>
                    )}
                    
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Employee ID *</label>
                        <div className="d-flex gap-2">
                          <input type="text" name="employeeId" value={formData.employeeId} onChange={handleInputChange} className="form-control rounded-3 py-2 bg-firo-bg border-0" placeholder="e.g. EMP001" required />
                          <button type="button" className="btn btn-outline-secondary rounded-3 px-3" onClick={lookupEmployee}>Verify</button>
                        </div>
                      </div>
                      
                      <div className="col-12">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Employee Name *</label>
                        <input type="text" name="employeeName" value={formData.employeeName} className="form-control rounded-3 py-2 bg-light border-0" readOnly required />
                      </div>

                      <div className="col-12">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Document Category *</label>
                        <select name="documentCategory" value={formData.documentCategory} onChange={handleInputChange} className="form-select rounded-3 py-2 bg-firo-bg border-0" required>
                          <option value="">Select category...</option>
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-6">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Status</label>
                        <select name="documentStatus" value={formData.documentStatus} onChange={handleInputChange} className="form-select rounded-3 py-2 bg-firo-bg border-0">
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>

                      <div className="col-6">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Expiry Date (Optional)</label>
                        <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} className="form-control rounded-3 py-2 bg-firo-bg border-0" />
                      </div>

                      <div className="col-12">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">File *</label>
                        <input type="file" name="file" onChange={handleFileChange} className="form-control rounded-3 py-2 bg-firo-bg border-0" required />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer border-0 p-4 bg-light">
                    <button type="button" className="btn btn-light rounded-pill px-4 fw-medium" onClick={closeModal}>Cancel</button>
                    <button type="submit" className="btn btn-primary bg-firo-primary border-0 rounded-pill px-4 fw-medium shadow-sm">
                      Upload
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default DocumentManagement;
