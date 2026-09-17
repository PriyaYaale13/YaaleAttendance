import re

with open(r'd:\ATM-WMS\frontend\src\components\ShiftHours\index.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

new_modals = r"""        </>,
        document.body
      )}

      {showDeleteModal && createPortal(
        <>
          <div className="modal-backdrop fade show" style={{ position: 'fixed', inset: 0, zIndex: 1060, backgroundColor: 'rgba(0, 0, 0, 0.4)' }}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1065 }}>
            <div className="modal-dialog modal-dialog-centered modal-sm" style={{ maxWidth: '350px' }}>
              <div className="modal-content rounded-4 border-0 shadow-lg p-4 text-center">
                <div className="mb-3">
                  <div className="bg-danger bg-opacity-10 text-danger rounded-circle d-inline-flex p-3">
                    <Trash2 size={24} />
                  </div>
                </div>
                <h5 className="fw-bold text-dark mb-3">Delete Shift</h5>
                <p className="text-muted small mb-4">Are you sure you want to delete this shift? This action cannot be undone.</p>
                <div className="d-flex justify-content-center gap-3">
                  <button type="button" className="btn btn-light rounded-pill px-4 flex-grow-1" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                  <button type="button" className="btn btn-danger rounded-pill px-4 flex-grow-1" onClick={confirmDeleteShift}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {showSuccessModal && createPortal(
        <>
          <div className="modal-backdrop fade show" style={{ position: 'fixed', inset: 0, zIndex: 1060, backgroundColor: 'rgba(0, 0, 0, 0.4)' }}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1065 }}>
            <div className="modal-dialog modal-dialog-centered modal-sm" style={{ maxWidth: '350px' }}>
              <div className="modal-content rounded-4 border-0 shadow-lg p-4 text-center">
                <h5 className="fw-bold text-success mb-3">Success!</h5>
                <p className="text-muted small mb-4">{successMessage}</p>
                <button type="button" className="btn btn-success rounded-pill px-4 w-100" onClick={() => setShowSuccessModal(false)}>Continue</button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );"""

content = content.replace("        </>,\n        document.body\n      )}\n    </div>\n  );", new_modals)

with open(r'd:\ATM-WMS\frontend\src\components\ShiftHours\index.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
