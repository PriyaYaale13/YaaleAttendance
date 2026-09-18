import React, { useState, useEffect, useRef, useContext } from 'react';
import { Camera, MapPin, X, CheckCircle, AlertCircle, Navigation, Upload } from 'lucide-react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { AuthContext } from '../../context/AuthContext';
import classNames from 'classnames';

const EmployeeScanModule = () => {
  const { user } = useContext(AuthContext);
  const [locationInput, setLocationInput] = useState('');
  const [scanMessage, setScanMessage] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  const processScanResult = async (decodedText) => {
    const employeeIdentifier = user?.employeeId || user?.username;
    
    if (!employeeIdentifier) {
      setScanMessage({ type: 'error', text: 'Error: Could not identify logged-in employee.' });
      return;
    }

    // Allow the Kiosk QR code or their own QR code
    if (decodedText !== employeeIdentifier && decodedText !== 'ATM_ATTENDANCE_KIOSK_URL') {
      setScanMessage({ type: 'error', text: 'Error: You can only scan your own QR code or the Attendance Kiosk QR.' });
      return;
    }

    if (!locationInput.trim()) {
      setScanMessage({ type: 'error', text: 'Please provide your location before scanning.' });
      return;
    }

    setScanMessage({ type: 'info', text: 'Recording attendance...' });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/attendance/scan/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: employeeIdentifier, location: locationInput }),
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
  };

  useEffect(() => {
    if (showScanner) {
      scannerRef.current = new Html5QrcodeScanner(
        "employee-scan-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );
      
      scannerRef.current.render(
        (decodedText) => {
          setShowScanner(false);
          processScanResult(decodedText);
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

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      setScanMessage({ type: 'error', text: 'Geolocation is not supported by your browser.' });
      return;
    }
    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || data.address?.state || "Unknown Area";
            setLocationInput(city);
          } else {
            setLocationInput(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          }
        } catch (err) {
          setLocationInput(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        }
        setIsLoadingLocation(false);
      },
      (error) => {
        setIsLoadingLocation(false);
        setScanMessage({ type: 'error', text: 'Unable to retrieve your location. Please check browser permissions.' });
        setTimeout(() => setScanMessage(null), 5000);
      }
    );
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!locationInput.trim()) {
      setScanMessage({ type: 'error', text: 'Location is required. Please allow location access.' });
      e.target.value = '';
      return;
    }

    setScanMessage({ type: 'info', text: 'Scanning uploaded image...' });

    const html5QrCode = new Html5Qrcode("file-scan-reader");
    html5QrCode.scanFile(file, false)
      .then(decodedText => {
        processScanResult(decodedText);
      })
      .catch(err => {
        console.error("File scan error", err);
        setScanMessage({ type: 'error', text: 'Could not read QR code from the uploaded image.' });
        setTimeout(() => setScanMessage(null), 5000);
      });
      
    e.target.value = ''; // Reset input
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold text-firo-dark m-0 mb-1">Employee Scan Module</h1>
          <p className="text-firo-muted m-0 small">Scan or upload your QR code to record your attendance with location verification.</p>
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
                Your location will be automatically detected. Scan or upload your assigned QR code to log your attendance.
              </p>
              
              <div className="w-100 mb-4 text-center">
                <div className="d-inline-flex align-items-center bg-light rounded-pill px-4 py-2 border">
                  <MapPin size={16} className="text-firo-muted me-2 flex-shrink-0" />
                  <span className="small fw-medium text-dark text-truncate" style={{ maxWidth: '200px' }}>
                    {isLoadingLocation ? 'Detecting your location...' : locationInput || 'Location not detected'}
                  </span>
                  {!isLoadingLocation && !locationInput && (
                    <button className="btn btn-sm btn-link text-primary p-0 ms-2 text-decoration-none" onClick={fetchLocation}>Retry</button>
                  )}
                </div>
              </div>

              {!showScanner ? (
                <div className="d-flex flex-column gap-3 w-100 mb-3">
                  <button 
                    className="btn btn-primary bg-firo-primary w-100 py-3 rounded-3 fw-bold shadow-sm d-flex justify-content-center align-items-center gap-2"
                    onClick={() => setShowScanner(true)}
                  >
                    <Camera size={20} /> Start Camera Scanner
                  </button>
                  
                  <div className="position-relative w-100">
                    <hr className="text-muted" />
                    <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small fw-medium">OR</span>
                  </div>

                  <button 
                    className="btn btn-outline-primary w-100 py-3 rounded-3 fw-bold d-flex justify-content-center align-items-center gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={20} /> Upload QR Image (JPG/PNG)
                  </button>
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg, image/jpg" 
                    className="d-none" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                </div>
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

              {/* Hidden div required for Html5Qrcode file scanning */}
              <div id="file-scan-reader" style={{ display: 'none' }}></div>

              {scanMessage && (
                <div className={classNames('mt-3 p-3 rounded-3 small fw-medium w-100 d-flex align-items-center justify-content-start gap-2 text-start', {
                  'bg-success bg-opacity-10 text-success': scanMessage.type === 'success',
                  'bg-danger bg-opacity-10 text-danger': scanMessage.type === 'error',
                  'bg-info bg-opacity-10 text-info': scanMessage.type === 'info',
                })}>
                  {scanMessage.type === 'success' && <CheckCircle size={18} className="flex-shrink-0" />}
                  {scanMessage.type === 'error' && <AlertCircle size={18} className="flex-shrink-0" />}
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
