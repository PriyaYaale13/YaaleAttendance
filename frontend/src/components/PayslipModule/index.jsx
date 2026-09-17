import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Banknote, Search, Download, Eye, X, CheckCircle, FileText, Printer } from 'lucide-react';
import classNames from 'classnames';

const PayslipModule = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [allEmployees, setAllEmployees] = useState([]);
  const [generateFormData, setGenerateFormData] = useState({
    empId: '',
    name: '',
    period: 'August 2026',
    basicSalary: 0,
    workingDays: 30,
    presentDays: 0,
    calculatedSalary: 0,
    accountNo: '',
    paymentMode: 'Online Account'
  });

  // Mock Payslips Data
  const [payslips, setPayslips] = useState([]);

  useEffect(() => {
    fetchPayslips();
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://72.62.227.163:8010/employees/');
      if (response.ok) {
        const data = await response.json();
        setAllEmployees(data);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchPayslips = async () => {
    try {
      const response = await fetch('http://72.62.227.163:8010/payslips/');
      if (response.ok) {
        const data = await response.json();
        setPayslips(data);
      }
    } catch (err) {
      console.error('Error fetching payslips:', err);
    }
  };

    const filteredPayslips = payslips.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.empId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD' }).format(amount);
  };

  const handleViewPayslip = (payslip) => {
    setSelectedPayslip(payslip);
    setShowPayslipModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closePayslipModal = () => {
    setShowPayslipModal(false);
    setSelectedPayslip(null);
    document.body.style.overflow = 'unset';
  };

  const handleEmpIdChange = (e) => {
    const value = e.target.value;
    let newFormData = { ...generateFormData, empId: value };

    if (value) {
      const matchedEmp = allEmployees.find(emp => emp.employeeId.toLowerCase() === value.toLowerCase());
      if (matchedEmp) {
        newFormData.name = matchedEmp.fullName;
        // Try parsing basic salary (e.g., "$80,000" or "80000")
        const salaryStr = String(matchedEmp.salaryDetails || "0").replace(/[^0-9.]/g, '');
        const salary = parseFloat(salaryStr) || 0;
        newFormData.basicSalary = salary;
        
        // Recalculate
        const calc = (salary / newFormData.workingDays) * newFormData.presentDays;
        newFormData.calculatedSalary = calc;
      } else {
        newFormData.name = '';
        newFormData.basicSalary = 0;
        newFormData.calculatedSalary = 0;
      }
    } else {
      newFormData.name = '';
      newFormData.basicSalary = 0;
      newFormData.calculatedSalary = 0;
    }
    setGenerateFormData(newFormData);
  };

  const handlePresentDaysChange = (e) => {
    const days = parseFloat(e.target.value) || 0;
    const calc = (generateFormData.basicSalary / generateFormData.workingDays) * days;
    setGenerateFormData({
      ...generateFormData,
      presentDays: days,
      calculatedSalary: calc
    });
  };

  const handleWorkingDaysChange = (e) => {
    const wDays = parseFloat(e.target.value) || 1;
    const calc = (generateFormData.basicSalary / wDays) * generateFormData.presentDays;
    setGenerateFormData({
      ...generateFormData,
      workingDays: wDays,
      calculatedSalary: calc
    });
  };

  const submitGenerate = async (e) => {
    e.preventDefault();
    if (!generateFormData.accountNo || !/^\d{16}$/.test(generateFormData.accountNo)) {
      alert("Please enter a valid 16-digit account number.");
      return;
    }

    try {
      const payload = {
        empId: generateFormData.empId,
        name: generateFormData.name,
        department: allEmployees.find(e => e.employeeId.toLowerCase() === generateFormData.empId.toLowerCase())?.department || 'General',
        designation: allEmployees.find(e => e.employeeId.toLowerCase() === generateFormData.empId.toLowerCase())?.designation || 'Staff',
        period: generateFormData.period,
        basicSalary: generateFormData.basicSalary,
        workingDays: generateFormData.workingDays,
        presentDays: generateFormData.presentDays,
        otHours: 0,
        otAmount: 0,
        allowances: 0,
        deductions: 0, // Simplified for this prototype
        netSalary: generateFormData.calculatedSalary,
        status: 'Generated',
        paymentDate: new Date().toISOString().split('T')[0],
        accountNo: generateFormData.accountNo,
        paymentMode: generateFormData.paymentMode
      };
      
      const response = await fetch('http://72.62.227.163:8010/payslips/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        fetchPayslips();
        setShowGenerateModal(false);
      }
    } catch (err) {
      console.error('Error generating payslip:', err);
    }
  };

  const handlePay = async (payslipId) => {
    try {
      const response = await fetch(`http://72.62.227.163:8010/payslips/${payslipId}/status`, {
        method: 'PUT',
      });
      if (response.ok) {
        fetchPayslips();
      }
    } catch (err) {
      console.error('Error updating payslip status:', err);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold text-firo-dark m-0 mb-1">Employee Payslips</h1>
          <p className="text-firo-muted m-0 small">Generate, view, and manage employee salary statements.</p>
        </div>
        <button 
          className="btn btn-primary bg-firo-primary border-0 rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow-sm"
          onClick={() => {
            setGenerateFormData({
              empId: '', name: '', period: 'August 2026', basicSalary: 0, workingDays: 30, presentDays: 0, calculatedSalary: 0, accountNo: '', paymentMode: 'Online Account'
            });
            setShowGenerateModal(true);
          }}
        >
          <FileText size={18} /> Generate Payslip
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <div className="p-4 border-bottom bg-white d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <select className="form-select rounded-pill bg-firo-bg border-0 fw-medium text-firo-dark" style={{ width: 'auto' }}>
              <option>August 2026</option>
              <option>July 2026</option>
              <option>June 2026</option>
            </select>
          </div>
          <div className="position-relative" style={{ width: '250px' }}>
            <Search size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-firo-muted" />
            <input 
              type="text" 
              className="form-control rounded-pill ps-5 bg-firo-bg border-0" 
              placeholder="Search employee..." 
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
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">Pay Period</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3 text-end">Net Salary</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3 text-center">Status</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3 text-end px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {filteredPayslips.map((p) => (
                <tr key={p.id}>
                  <td className="px-4">
                    <div className="fw-bold text-firo-dark">{p.name}</div>
                    <div className="small text-firo-muted">{p.empId} | {p.department}</div>
                  </td>
                  <td>
                    <div className="fw-medium text-firo-dark">{p.period}</div>
                    {p.paymentMode && (
                      <div className="small text-muted mt-1">
                        <span className="badge bg-light text-dark border me-1">{p.paymentMode}</span>
                        {p.accountNo ? `•••• ${p.accountNo.slice(-4)}` : ''}
                      </div>
                    )}
                  </td>
                  <td className="text-end">
                    <span className="fw-bold text-firo-primary fs-6">{formatCurrency(p.netSalary)}</span>
                  </td>
                  <td className="text-center">
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <span className={classNames('badge rounded-pill px-3 py-2 fw-medium', {
                        'bg-success bg-opacity-10 text-success': p.status === 'Paid',
                        'bg-warning bg-opacity-10 text-warning': p.status === 'Processing',
                        'bg-secondary bg-opacity-10 text-secondary': p.status !== 'Paid' && p.status !== 'Processing'
                      })}>
                        {p.status}
                      </span>
                      {p.status !== 'Paid' && (
                        <button 
                          className="btn btn-sm btn-primary bg-firo-primary border-0 rounded-pill px-3"
                          style={{ fontSize: '12px' }}
                          onClick={() => handlePay(p.id)}
                        >
                          Pay
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="text-end px-4">
                    <div className="d-flex justify-content-end gap-2">
                      <button 
                        className="btn btn-sm btn-light text-firo-primary rounded-circle p-2" 
                        title="View Payslip"
                        onClick={() => handleViewPayslip(p)}
                      >
                        <Eye size={16} />
                      </button>
                      <button className="btn btn-sm btn-light text-firo-primary rounded-circle p-2" title="Download PDF">
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPayslips.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-firo-muted">
                    No payslips found matching "{searchTerm}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payslip PDF View Modal */}
      {showPayslipModal && selectedPayslip && createPortal(
        <>
          <div className="modal-backdrop fade show" style={{ position: 'fixed', inset: 0, zIndex: 105000, backgroundColor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 105005 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
                <div className="modal-header bg-light border-bottom px-4 py-3">
                  <div className="d-flex align-items-center gap-2 text-firo-primary">
                    <FileText size={20} />
                    <h5 className="modal-title fw-bold m-0">Salary Statement</h5>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2"><Printer size={14}/> Print</button>
                    <button className="btn btn-sm btn-primary bg-firo-primary border-0 d-flex align-items-center gap-2"><Download size={14}/> PDF</button>
                    <button type="button" className="btn-close ms-2" onClick={closePayslipModal}></button>
                  </div>
                </div>
                
                {/* PDF Style Body */}
                <div className="modal-body p-4 bg-white">
                  {/* Department, Payment Info & Status */}
                  <div className="d-flex justify-content-between px-3 mb-4 mt-2 flex-wrap gap-3">
                    <div className="d-flex gap-2">
                      <span className="text-muted small">Department:</span>
                      <span className="fw-bold small">{selectedPayslip.department}</span>
                    </div>
                    {selectedPayslip.paymentMode && (
                      <div className="d-flex gap-2">
                        <span className="text-muted small">Payment Mode:</span>
                        <span className="fw-bold small text-primary">{selectedPayslip.paymentMode}</span>
                      </div>
                    )}
                    {selectedPayslip.accountNo && (
                      <div className="d-flex gap-2">
                        <span className="text-muted small">Account No:</span>
                        <span className="fw-bold small">{selectedPayslip.accountNo}</span>
                      </div>
                    )}
                    <div className="d-flex gap-2">
                      <span className="text-muted small">Status:</span>
                      <span className="fw-bold small text-success">{selectedPayslip.status}</span>
                    </div>
                  </div>

                  {/* Salary Details Table */}
                  <table className="table table-bordered mb-3">
                    <thead className="bg-light">
                      <tr>
                        <th className="small text-uppercase fw-bold w-25 border-end-0 py-3 px-3">Earnings</th>
                        <th className="small text-uppercase fw-bold text-end w-25 py-3 px-3">Amount</th>
                        <th className="small text-uppercase fw-bold w-25 border-end-0 py-3 px-3">Deductions</th>
                        <th className="small text-uppercase fw-bold text-end w-25 py-3 px-3">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="small py-3 px-3 border-end-0">Basic Salary</td>
                        <td className="small py-3 px-3 text-end">{formatCurrency(selectedPayslip.basicSalary)}</td>
                        <td className="small py-3 px-3 border-end-0">Tax / CPF</td>
                        <td className="small py-3 px-3 text-end">{formatCurrency(selectedPayslip.deductions)}</td>
                      </tr>
                      <tr>
                        <td className="small py-3 px-3 border-end-0">Overtime ({selectedPayslip.otHours} hrs)</td>
                        <td className="small py-3 px-3 text-end">{formatCurrency(selectedPayslip.otAmount)}</td>
                        <td className="small py-3 px-3 border-end-0"></td>
                        <td className="small py-3 px-3 text-end"></td>
                      </tr>
                      <tr>
                        <td className="small py-3 px-3 border-end-0">Allowances</td>
                        <td className="small py-3 px-3 text-end">{formatCurrency(selectedPayslip.allowances)}</td>
                        <td className="small py-3 px-3 border-end-0"></td>
                        <td className="small py-3 px-3 text-end"></td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Totals Box */}
                  <table className="table table-bordered mb-4">
                    <tbody>
                      <tr className="bg-light">
                        <td className="small fw-bold py-3 px-3 border-end-0 w-25">Total Earnings (A)</td>
                        <td className="small fw-bold py-3 px-3 text-end w-25">{formatCurrency(selectedPayslip.basicSalary + selectedPayslip.otAmount + selectedPayslip.allowances)}</td>
                        <td className="small fw-bold py-3 px-3 border-end-0 w-25">Total Deductions (B)</td>
                        <td className="small fw-bold py-3 px-3 text-end w-25">{formatCurrency(selectedPayslip.deductions)}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Net Pay */}
                  <div className="d-flex justify-content-between align-items-center p-4 rounded-3 border border-primary border-opacity-25" style={{ backgroundColor: '#f4f7fb' }}>
                    <div>
                      <div className="fw-bold fs-5 text-primary mb-1">Net Salary Payable (A - B)</div>
                      <div className="small text-muted fst-italic">Amount transferred to bank account</div>
                    </div>
                    <div className="fw-bold text-primary fs-3">
                      {formatCurrency(selectedPayslip.netSalary)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {showGenerateModal && createPortal(
        <>
          <div className="modal-backdrop fade show" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', zIndex: 9998, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 9999 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
                <div className="modal-header border-bottom-0 pb-0 mt-2 mx-2">
                  <h5 className="modal-title fw-bold text-firo-dark fs-4">Generate Payslip</h5>
                  <button type="button" className="btn-close shadow-none" onClick={() => setShowGenerateModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <form onSubmit={submitGenerate} id="generateForm">
                    <div className="row g-3">
                      <div className="col-sm-6">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Emp ID</label>
                        <input type="text" className={classNames("form-control bg-firo-bg border-0 rounded-3", { "is-invalid": generateFormData.empId && !generateFormData.name })} value={generateFormData.empId} onChange={handleEmpIdChange} required />
                        {generateFormData.empId && !generateFormData.name && <div className="invalid-feedback" style={{fontSize: '11px'}}>Invalid ID</div>}
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Employee Name</label>
                        <input type="text" className="form-control bg-firo-bg border-0 rounded-3" value={generateFormData.name} readOnly required />
                      </div>
                      <div className="col-12">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Pay Period</label>
                        <input type="text" className="form-control bg-firo-bg border-0 rounded-3" value={generateFormData.period} onChange={e => setGenerateFormData({...generateFormData, period: e.target.value})} required />
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Basic Salary (From DB)</label>
                        <input type="text" className="form-control bg-firo-bg border-0 rounded-3" value={formatCurrency(generateFormData.basicSalary)} readOnly />
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Working Days in Period</label>
                        <input type="number" className="form-control bg-firo-bg border-0 rounded-3" value={generateFormData.workingDays} onChange={handleWorkingDaysChange} required min="1" max="31" />
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Days Present</label>
                        <input type="number" className="form-control bg-firo-bg border-0 rounded-3" value={generateFormData.presentDays} onChange={handlePresentDaysChange} required min="0" max={generateFormData.workingDays} />
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase text-primary">Calculated Salary</label>
                        <input type="text" className="form-control bg-firo-bg border-0 rounded-3 text-primary fw-bold" value={formatCurrency(generateFormData.calculatedSalary)} readOnly />
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">
                          Account Number * <span className="text-muted fw-normal" style={{ fontSize: '11px' }}>(16 digits)</span>
                        </label>
                        <input 
                          type="text" 
                          inputMode="numeric"
                          className={classNames("form-control bg-firo-bg border-0 rounded-3", { 
                            "is-invalid": generateFormData.accountNo && generateFormData.accountNo.length !== 16 
                          })} 
                          placeholder="Enter 16-digit account number"
                          value={generateFormData.accountNo} 
                          maxLength={16}
                          onChange={(e) => {
                            const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 16);
                            setGenerateFormData({ ...generateFormData, accountNo: onlyDigits });
                          }} 
                          required 
                        />
                        {generateFormData.accountNo && generateFormData.accountNo.length !== 16 && (
                          <div className="invalid-feedback" style={{ fontSize: '11px' }}>
                            Must be exactly 16 digits ({generateFormData.accountNo.length}/16)
                          </div>
                        )}
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Payment Mode *</label>
                        <select 
                          className="form-select bg-firo-bg border-0 rounded-3" 
                          value={generateFormData.paymentMode} 
                          onChange={(e) => setGenerateFormData({ ...generateFormData, paymentMode: e.target.value })} 
                          required
                        >
                          <option value="Online Account">Online Account</option>
                          <option value="UPI">UPI</option>
                          <option value="Cash">Cash</option>
                        </select>
                      </div>
                    </div>
                  </form>
                </div>
                <div className="modal-footer border-top-0 pt-0 pb-4 px-4 d-flex gap-2">
                  <button type="button" className="btn btn-light rounded-pill px-4 flex-grow-1" onClick={() => setShowGenerateModal(false)}>Cancel</button>
                  <button type="submit" form="generateForm" className="btn btn-primary bg-firo-primary border-0 rounded-pill px-4 flex-grow-1">Generate</button>
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

export default PayslipModule;
