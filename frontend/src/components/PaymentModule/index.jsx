import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CreditCard, Search, Download, CheckCircle, FileCheck, X, Printer, Banknote } from 'lucide-react';
import classNames from 'classnames';

const PaymentModule = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [payments, setPayments] = useState([]);

  const fetchPayments = async () => {
    try {
      const response = await fetch('http://localhost:8000/payslips/');
      const data = await response.json();
      const mapped = data.map(ps => ({
        dbId: ps.id,
        id: `PMT-${1000 + ps.id}`,
        empId: ps.empId || 'Unknown',
        name: ps.name || 'Unknown Employee',
        period: ps.period || 'Unknown',
        netSalary: ps.netSalary || 0,
        method: ps.paymentMode || 'Online Account',
        accountNo: ps.accountNo ? `•••• •••• •••• ${ps.accountNo.slice(-4)}` : '***-***-1234',
        transactionRef: ps.status === 'Paid' ? `TXN-SYS-${80000000 + ps.id}` : '-',
        paymentDate: ps.paymentDate || '-',
        status: ps.status === 'Paid' ? 'Completed' : 'Pending',
        payslipId: `PAY-${1000 + ps.id}`,
        fullData: ps
      }));
      setPayments(mapped);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.transactionRef.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD' }).format(amount);
  };

  const handleProcessPayment = async (id) => {
    const payment = payments.find(p => p.id === id);
    if (!payment) return;
    
    // Optimistic UI update
    setPayments(payments.map(p => {
      if (p.id === id) {
        return {
          ...p,
          status: 'Completed',
          transactionRef: `TXN-SYS-${Math.floor(10000000 + Math.random() * 90000000)}`,
          paymentDate: new Date().toISOString().split('T')[0]
        };
      }
      return p;
    }));

    try {
      const updatedPayslip = { 
        ...payment.fullData,
        status: 'Paid', 
        paymentDate: new Date().toISOString().split('T')[0] 
      };
      
      await fetch(`http://localhost:8000/payslips/${payment.dbId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayslip)
      });
    } catch (err) {
      console.error('Failed to update payslip status:', err);
    }
  };

  const handleViewReceipt = (payment) => {
    setSelectedPayment(payment);
    setShowReceiptModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeReceiptModal = () => {
    setShowReceiptModal(false);
    setSelectedPayment(null);
    document.body.style.overflow = 'unset';
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 className="h3 fw-bold text-firo-dark m-0 mb-1">Payment & Receipts</h1>
          <p className="text-firo-muted m-0 small">Process payroll payments and generate official payment receipts.</p>
        </div>
        <button className="btn btn-primary bg-firo-primary border-0 rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow-sm">
          <CreditCard size={18} /> Batch Process Payments
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
              placeholder="Search reference..." 
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
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">Net Salary</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">Payment Method</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">Transaction Details</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">Status</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3 text-end px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {filteredPayments.map((p) => (
                <tr key={p.id}>
                  <td className="px-4">
                    <div className="fw-bold text-firo-dark">{p.name}</div>
                    <div className="small text-firo-muted">{p.empId} | {p.period}</div>
                  </td>
                  <td>
                    <span className="fw-bold text-firo-primary fs-6">{formatCurrency(p.netSalary)}</span>
                  </td>
                  <td>
                    <div className="text-firo-dark fw-medium">{p.method}</div>
                    <div className="small text-firo-muted">{p.accountNo}</div>
                  </td>
                  <td>
                    {p.status === 'Completed' ? (
                      <>
                        <div className="small fw-bold text-dark">{p.transactionRef}</div>
                        <div className="small text-firo-muted">{p.paymentDate}</div>
                      </>
                    ) : (
                      <span className="small text-firo-muted">-</span>
                    )}
                  </td>
                  <td>
                    <span className={classNames('badge rounded-pill px-3 py-2 fw-medium', {
                      'bg-success bg-opacity-10 text-success': p.status === 'Completed',
                      'bg-warning bg-opacity-10 text-warning': p.status === 'Pending'
                    })}>
                      {p.status}
                    </span>
                  </td>
                  <td className="text-end px-4">
                    {p.status === 'Pending' ? (
                      <button 
                        className="btn btn-sm btn-primary bg-firo-primary border-0 rounded-pill px-3 py-1 text-white" 
                        onClick={() => handleProcessPayment(p.id)}
                      >
                        <CheckCircle size={14} className="me-1 mb-1" /> Process
                      </button>
                    ) : (
                      <div className="d-flex justify-content-end gap-2">
                        <button 
                          className="btn btn-sm btn-light text-firo-primary rounded-circle p-2" 
                          title="View Receipt"
                          onClick={() => handleViewReceipt(p)}
                        >
                          <FileCheck size={16} />
                        </button>
                        <button className="btn btn-sm btn-light text-firo-primary rounded-circle p-2" title="View Linked Payslip">
                          <Banknote size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-firo-muted">
                    No payment records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Receipt Modal */}
      {showReceiptModal && selectedPayment && createPortal(
        <>
          <div className="modal-backdrop fade show" style={{ position: 'fixed', inset: 0, zIndex: 105000, backgroundColor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 105005 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
                <div className="modal-header bg-light border-bottom px-4 py-3">
                  <div className="d-flex align-items-center gap-2 text-firo-primary">
                    <FileCheck size={20} />
                    <h5 className="modal-title fw-bold m-0">Payment Receipt</h5>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2"><Printer size={14}/> Print</button>
                    <button className="btn btn-sm btn-primary bg-firo-primary border-0 d-flex align-items-center gap-2"><Download size={14}/> PDF</button>
                    <button type="button" className="btn-close ms-2" onClick={closeReceiptModal}></button>
                  </div>
                </div>
                
                <div className="modal-body p-4 p-md-5 bg-white">
                  {/* Header */}
                  <div className="text-center border-bottom pb-4 mb-4">
                    <img src="/logo.png" alt="Company Logo" style={{ height: '50px', objectFit: 'contain' }} className="mb-3" />
                    <h4 className="fw-bold text-firo-dark mb-1">PAYMENT RECEIPT</h4>
                    <div className="small text-muted">Receipt No: <strong>{selectedPayment.id}</strong></div>
                    <div className="small text-muted">Date: <strong>{selectedPayment.paymentDate}</strong></div>
                  </div>

                  <div className="mb-4">
                    <div className="row g-3">
                      <div className="col-6">
                        <div className="small text-muted text-uppercase fw-bold mb-1">Paid To</div>
                        <div className="fw-bold text-firo-dark">{selectedPayment.name}</div>
                        <div className="small text-muted">Employee ID: {selectedPayment.empId}</div>
                      </div>
                      <div className="col-6 text-end">
                        <div className="small text-muted text-uppercase fw-bold mb-1">Linked Payslip</div>
                        <div className="fw-bold text-primary">{selectedPayment.payslipId}</div>
                        <div className="small text-muted">Period: {selectedPayment.period}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-light p-4 rounded-3 border mb-4">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Payment Method:</span>
                      <span className="fw-bold">{selectedPayment.method}</span>
                    </div>
                    {selectedPayment.accountNo !== '-' && (
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Account No:</span>
                        <span className="fw-bold">{selectedPayment.accountNo}</span>
                      </div>
                    )}
                    <div className="d-flex justify-content-between border-bottom pb-3 mb-3">
                      <span className="text-muted">Transaction Ref:</span>
                      <span className="fw-bold">{selectedPayment.transactionRef}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold text-dark fs-5">Amount Paid:</span>
                      <span className="fw-bold text-success fs-3">{formatCurrency(selectedPayment.netSalary)}</span>
                    </div>
                  </div>

                  <div className="text-center mt-5">
                    <div className="small text-success d-flex justify-content-center align-items-center gap-1 fw-bold mb-2">
                      <CheckCircle size={18} /> Payment Successfully Processed
                    </div>
                    <div className="small text-muted">This is an auto-generated receipt and does not require a physical signature.</div>
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

export default PaymentModule;
