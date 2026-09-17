import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, MapPin, X } from 'lucide-react';

const ManageLocations = () => {
  const [locations, setLocations] = useState([
    { id: 1, name: 'Training Center 1' },
    { id: 2, name: 'LITTLE INDIA ARCADE' },
    { id: 3, name: 'TOH GUAN ENTERPRISE HUB' },
    { id: 4, name: 'ED ZUBLIN - Jalan Bahar' },
    { id: 5, name: 'MDIS' },
    { id: 6, name: 'SLF' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEntries, setShowEntries] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');

  const handleAddLocation = (e) => {
    e.preventDefault();
    if (newLocationName.trim()) {
      setLocations([...locations, { id: locations.length + 1, name: newLocationName.trim() }]);
      setNewLocationName('');
      setShowAddModal(false);
    }
  };

  const filteredLocations = locations.filter(loc => 
    loc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid py-4 h-100 overflow-auto position-relative">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h1 className="h3 fw-bold text-dark m-0 mb-1">Location Management</h1>
          <p className="text-muted m-0 small">Showing {filteredLocations.length} of {locations.length} entries</p>
        </div>
        <div>
          <button 
            className="btn btn-primary bg-firo-primary border-0 rounded-3 px-3 py-2 d-flex align-items-center gap-2 fw-medium shadow-sm"
            onClick={() => setShowAddModal(true)}
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
                placeholder="Search locations..." 
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
              Showing 1 to {Math.min(filteredLocations.length, showEntries)} of {locations.length} entries
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle border">
              <thead className="bg-light">
                <tr>
                  <th className="text-muted small fw-bold text-uppercase px-4 py-3" style={{ width: '80px' }}>#</th>
                  <th className="text-muted small fw-bold text-uppercase px-4 py-3">LOCATION NAME</th>
                  <th className="text-muted small fw-bold text-uppercase px-4 py-3">ID</th>
                  <th className="text-muted small fw-bold text-uppercase px-4 py-3 text-end">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredLocations.slice(0, showEntries).map((loc, idx) => (
                  <tr key={loc.id}>
                    <td className="px-4 py-3 text-muted">{idx + 1}</td>
                    <td className="px-4 py-3 fw-medium text-dark d-flex align-items-center gap-3">
                      <div className="d-flex align-items-center justify-content-center rounded-circle bg-primary-subtle text-primary" style={{ width: '32px', height: '32px' }}>
                        <MapPin size={16} />
                      </div>
                      {loc.name}
                    </td>
                    <td className="px-4 py-3 text-muted small">#{loc.id}</td>
                    <td className="px-4 py-3 text-end">
                      <button className="btn btn-link text-warning p-1 me-2" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button className="btn btn-link text-danger p-1" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredLocations.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-muted">No locations found matching "{searchTerm}"</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add New Location Modal */}
      {showAddModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ width: '100%', maxWidth: '450px' }}>
            <div className="card-header border-0 px-4 py-4 d-flex align-items-start justify-content-between bg-white">
              <div>
                <h5 className="m-0 fw-bold text-dark fs-5">Add New Location</h5>
                <p className="text-muted small m-0 text-uppercase fw-semibold" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>Create a new training venue</p>
              </div>
              <button className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }} onClick={() => setShowAddModal(false)}>
                <X size={16} className="text-muted" />
              </button>
            </div>
            <div className="card-body px-4 pb-4 pt-2 bg-white">
              <form onSubmit={handleAddLocation}>
                <div className="mb-4">
                  <label className="form-label text-dark small fw-bold text-uppercase">LOCATION NAME *</label>
                  <input 
                    type="text" 
                    className="form-control rounded-3 py-2 border" 
                    placeholder="e.g., Jurong East Link" 
                    value={newLocationName}
                    onChange={(e) => setNewLocationName(e.target.value)}
                    required
                  />
                </div>
                <div className="d-flex justify-content-between gap-3">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary rounded-3 px-4 py-2 fw-medium flex-grow-1" 
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary bg-firo-primary rounded-3 px-4 py-2 fw-medium flex-grow-1 border-0 d-flex align-items-center justify-content-center gap-2" 
                  >
                    <Plus size={18} /> Save Location
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

export default ManageLocations;
