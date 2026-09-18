import React, { useState, useEffect, useRef, useContext } from 'react';
import { Camera, MapPin, X, CheckCircle, AlertCircle, Navigation } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { AuthContext } from '../../context/AuthContext';
import classNames from 'classnames';

const EmployeeScanModule = () => {
  const { user } = useContext(AuthContext);
  const [locationInput, setLocationInput] = useState('');
  const [scanMessage, setScanMessage] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (showScanner) {
      scannerRef.current = new Html5QrcodeScanner(
        "employee-scan-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );
      
      scannerRef.current.render(
        async (decodedText) => {
          // Validate employee
          const employeeIdentifier = user?.employeeId || user?.username;
          if (employeeIdentifier && decodedText !== employeeIdentifier && decodedText !== user?.employeeId) {
            setScanMessage({ type: 'error', text: 'Error: You can only scan your own QR code.' });
            setShowScanner(false);
            return;
          }

          if (!locationInput.trim()) {
            setScanMessage({ type: 'error', text: 'Please provide your location before scanning.' });
            setShowScanner(false);
            return;
          }

          // Stop scanner
          setShowScanner(false);
          setScanMessage({ type: 'info', text: 'Recording attendance...' });

          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/attendance/scan/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ employeeId: decodedText, location: locationInput }),
            });
            if (response.ok) {
              const data = await response.json();
              setScanMessage({ type: 'success', text: `Success! Attendance recorded for ${data.name}.` });
            } else {
              const errorData = await response.json();
              setScanMessage({ type: 'error', text: errorData.detail || 'Error recording attendance.' });
            }
          } catch (error) {
            console.error('Scan error:', error);
            setScanMessage({ type: 'error', text: 'Network error connecting to the server.' });
          }
          
          setTimeout(() => setScanMessage(null), 7000);
        },
        (errorMessage) => {
          // Ignore parsing errors
        }
      );
    } else {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear scanner", error);
        });
        scannerRef.current = null;
      }
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => console.error(error));
      }
    };
  }, [showScanner, locationInput, user]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setScanMessage({ type: 'error', text: 'Geolocation is not supported by your browser.' });
      return;
    }
    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocationInput(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        setIsLoadingLocation(false);
      },
      (error) => {
        setIsLoadingLocation(false);
        setScanMessage({ type: 'error', text: 'Unable to retrieve your location.' });
        setTimeout(() => setScanMessage(null), 4000);
      }
    );
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold text-firo-dark m-0 mb-1">Employee Scan Module</h1>
          <p className="text-firo-muted m-0 small">Scan your QR code to record your attendance with location verification.</p>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card border-0 rounded-4 shadow-sm h-100">
            <div className="card-body p-4 p-md-5 d-flex flex-column align-items-center justify-content-center text-center">
              
              <div className="bg-primary bg-opacity-10 rounded-circle p-3 mb-4 text-primary">
                <Camera size={40} />
              </div>
              
              <h5 className="fw-bold text-firo-dark mb-1">Self-Service Scanner</h5>
              <p className="text-firo-muted small mb-4">
                Enter your location or fetch it via GPS, then scan your assigned QR code to log your attendance.
              </p>
              
              <div className="w-100 mb-4 text-start">
                <label className="form-label text-firo-muted small fw-semibold text-uppercase">Current Location</label>
                <div className="input-group mb-2">
                  <span className="input-group-text bg-light border-end-0">
                    <MapPin size={18} className="text-firo-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control bg-light border-start-0 py-2"
                    placeholder="E.g. Site A, Block 3 or GPS Coords"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                  />
                  <button 
                    className="btn btn-outline-secondary d-flex align-items-center" 
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isLoadingLocation}
                  >
                    {isLoadingLocation ? 'Loading...' : <><Navigation size={16} className="me-1" /> GPS</>}
                  </button>
                </div>
              </div>

              {!showScanner ? (
                <button 
                  className="btn btn-primary bg-firo-primary w-100 py-3 rounded-3 fw-bold shadow-sm d-flex justify-content-center align-items-center gap-2 mb-3"
                  onClick={() => setShowScanner(true)}
                >
                  <Camera size={20} /> Start Camera Scanner
                </button>
              ) : (
                <div className="w-100 mb-4">
                  <div id="employee-scan-reader" className="mb-3 rounded-4 overflow-hidden shadow-sm border"></div>
                  <button 
                    className="btn btn-danger w-100 py-2 rounded-3 fw-medium d-flex justify-content-center align-items-center gap-2"
                    onClick={() => setShowScanner(false)}
                  >
                    <X size={18} /> Cancel Scanning
                  </button>
                </div>
              )}

              {scanMessage && (
                <div className={classNames('mt-3 p-3 rounded-3 small fw-medium w-100 d-flex align-items-center justify-content-start gap-2', {
                  'bg-success bg-opacity-10 text-success': scanMessage.type === 'success',
                  'bg-danger bg-opacity-10 text-danger': scanMessage.type === 'error',
                  'bg-info bg-opacity-10 text-info': scanMessage.type === 'info',
                })}>
                  {scanMessage.type === 'success' && <CheckCircle size={18} />}
                  {scanMessage.type === 'error' && <AlertCircle size={18} />}
                  {scanMessage.text}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeScanModule;
