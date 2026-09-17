import React, { useState, useEffect } from 'react';
import { Search, Plus, FileText, Download, Trash2, Clock, Eye } from 'lucide-react';
import classNames from 'classnames';
import { createPortal } from 'react-dom';

const TimecardManagement = () => {
  const [timecards, setTimecards] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    designation: '',
    salary: '',
    noOfWorkingDays: '',
    timecardDate: '',
    file: null
  });

  const fetchTimecards = async () => {
    try {
      const response = await fetch('http://72.62.227.163:8010/timecards/');
      if (response.ok) {
        const data = await response.json();
        setTimecards(data);
      }
    } catch (error) {
      console.error('Error fetching timecards:', error);
    }
  };

  useEffect(() => {
    fetchTimecards();
  }, []);

  const openModal = () => {
    setFormData({
      employeeId: '',
      employeeName: '',
      designation: '',
      salary: '',
      noOfWorkingDays: '',
      timecardDate: '',
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
      const file = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      const maxSize = 20 * 1024 * 1024; // 20MB

      if (!validTypes.includes(file.type)) {
        setErrorMsg('Please select a JPG, PNG, or PDF file.');
        e.target.value = '';
        return;
      }
      
      if (file.size > maxSize) {
        setErrorMsg('File size must be less than 20MB.');
        e.target.value = '';
        return;
      }

      setErrorMsg('');
      setFormData(prev => ({ ...prev, file: file }));
    }
  };

  const lookupEmployee = async () => {
    if (!formData.employeeId) return;
    try {
      const res = await fetch('http://72.62.227.163:8010/employees/');
      if (res.ok) {
        const emps = await res.json();
        const emp = emps.find(e => e.employeeId === formData.employeeId);
        if (emp) {
          let targetMonthStr;
          if (formData.timecardDate) {
            targetMonthStr = formData.timecardDate.substring(0, 7); // YYYY-MM
          } else {
            const now = new Date();
            targetMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          }

          let presentDays = 0;
          try {
            const attRes = await fetch('http://72.62.227.163:8010/attendance/');
            if (attRes.ok) {
              const attData = await attRes.json();
              const empAtt = attData.filter(a => 
                a.employeeId === formData.employeeId && 
                a.date.startsWith(targetMonthStr) && 
                a.inTime
              );
              presentDays = empAtt.length;
            }
          } catch (e) {
            console.error("Failed to fetch attendance for working days", e);
          }

          setFormData(prev => ({ 
            ...prev, 
            employeeName: emp.fullName,
            designation: emp.designation || 'N/A',
            salary: emp.salaryDetails || '0',
            noOfWorkingDays: presentDays.toString()
          }));
          setErrorMsg('');
        } else {
          setFormData(prev => ({ ...prev, employeeName: '', designation: '', salary: '' }));
          setErrorMsg('Employee ID not found');
        }
      }
    } catch (err) {
      console.error("Lookup failed", err);
    }
  };

  const submitTimecard = async (e) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.employeeName || !formData.noOfWorkingDays || !formData.timecardDate || !formData.file) {
      setErrorMsg('Please fill all required fields and select a file.');
      return;
    }

    try {
      const payload = new FormData();
      payload.append('employeeId', formData.employeeId);
      payload.append('noOfWorkingDays', formData.noOfWorkingDays);
      payload.append('timecardDate', formData.timecardDate);
      payload.append('file', formData.file);

      const response = await fetch('http://72.62.227.163:8010/timecards/', {
        method: 'POST',
        body: payload
      });

      if (response.ok) {
        await fetchTimecards();
        closeModal();
      } else {
        const errorData = await response.json();
        setErrorMsg(errorData.detail || 'Failed to upload timecard');
      }
    } catch (error) {
      console.error('Error uploading timecard:', error);
      setErrorMsg('Network error. Failed to connect to server.');
    }
  };

  const handleDownload = (tc) => {
    window.open(`http://72.62.227.163:8010/timecards/download/${tc.id}`, '_blank');
  };

  const handleView = (tc) => {
    window.open(`http://72.62.227.163:8010/timecards/view/${tc.id}`, '_blank');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this timecard?')) {
      try {
        const response = await fetch(`http://72.62.227.163:8010/timecards/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          fetchTimecards();
        }
      } catch (error) {
        console.error('Error deleting timecard:', error);
      }
    }
  };

  const filteredTimecards = timecards.filter(tc => 
    tc.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) || 
    tc.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold text-firo-dark m-0 mb-1">Timecard Management</h1>
          <p className="text-firo-muted m-0 small">Upload and manage employee timecards.</p>
        </div>
        <button 
          className="btn btn-primary bg-firo-primary border-0 rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow-sm"
          onClick={openModal}
        >
          <Plus size={18} /> Upload Timecard
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="p-4 border-bottom bg-white d-flex align-items-center justify-content-between flex-wrap gap-3">
          <h5 className="m-0 fw-bold text-firo-dark">Uploaded Timecards</h5>
          <div className="position-relative" style={{ width: '250px' }}>
            <Search size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-firo-muted" />
            <input 
              type="text" 
              className="form-control rounded-pill ps-5 bg-firo-bg border-0" 
              placeholder="Search timecards..." 
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
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">Designation</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3 text-center">Working Days</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">Salary</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">File</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">Date</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3 text-end px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {filteredTimecards.map((tc) => (
                <tr key={tc.id}>
                  <td className="px-4">
                    <div className="fw-medium text-firo-dark">{tc.employeeName}</div>
                    <div className="small text-firo-muted">{tc.employeeId}</div>
                  </td>
                  <td><div className="small text-firo-dark">{tc.designation}</div></td>
                  <td className="text-center">
                    <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2 fw-medium">
                      {tc.noOfWorkingDays} Days
                    </span>
                  </td>
                  <td><div className="fw-medium text-firo-dark">{tc.salary}</div></td>
                  <td>
                    <div className="d-flex align-items-center gap-2 text-firo-dark small text-truncate" style={{ maxWidth: '150px' }} title={tc.fileName}>
                      <FileText size={16} className="text-firo-muted flex-shrink-0" />
                      <span className="text-truncate">{tc.fileName}</span>
                    </div>
                  </td>
                  <td>
                    <div className="fw-medium text-firo-dark">{new Date(tc.timecardDate).toLocaleDateString()}</div>
                    <div className="small text-firo-muted">Uploaded: {new Date(tc.uploadDate).toLocaleDateString()}</div>
                  </td>
                  <td className="text-end px-4">
                    <div className="d-flex align-items-center justify-content-end gap-2">
                      <button className="btn btn-sm btn-light text-primary rounded-circle p-2" title="View" onClick={() => handleView(tc)}>
                        <Eye size={16} />
                      </button>
                      <button className="btn btn-sm btn-light text-firo-primary rounded-circle p-2" title="Download" onClick={() => handleDownload(tc)}>
                        <Download size={16} />
                      </button>
                      <button className="btn btn-sm btn-light text-danger rounded-circle p-2" title="Delete" onClick={() => handleDelete(tc.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTimecards.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    No timecards found.
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
                  <h5 className="modal-title fw-bold flex-grow-1">Upload Timecard</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={closeModal}></button>
                </div>
                
                <form onSubmit={submitTimecard}>
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
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Employee Details</label>
                        <div className="p-3 bg-light rounded-3 border-0">
                          <div className="row g-2">
                            <div className="col-12">
                              <span className="small text-muted me-2">Name:</span>
                              <span className="fw-medium">{formData.employeeName || '-'}</span>
                            </div>
                            <div className="col-6">
                              <span className="small text-muted me-2">Designation:</span>
                              <span className="fw-medium">{formData.designation || '-'}</span>
                            </div>
                            <div className="col-6">
                              <span className="small text-muted me-2">Salary:</span>
                              <span className="fw-medium">{formData.salary || '-'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-12">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">No of Working Days *</label>
                        <input type="number" name="noOfWorkingDays" value={formData.noOfWorkingDays} onChange={handleInputChange} className="form-control rounded-3 py-2 bg-firo-bg border-0" placeholder="e.g. 20" min="0" required />
                      </div>

                      <div className="col-12">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Timecard Date *</label>
                        <input type="date" name="timecardDate" value={formData.timecardDate} onChange={handleInputChange} className="form-control rounded-3 py-2 bg-firo-bg border-0" required />
                      </div>

                      <div className="col-12">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Timecard File * (Max 20MB)</label>
                        <input type="file" name="file" onChange={handleFileChange} className="form-control rounded-3 py-2 bg-firo-bg border-0" accept=".jpg,.jpeg,.png,.pdf" required />
                        <div className="form-text small text-firo-muted mt-1">Supported formats: JPEG, PNG, PDF.</div>
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

export default TimecardManagement;
