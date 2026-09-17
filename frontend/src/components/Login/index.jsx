import React, { useState } from 'react';
import { ArrowRight, ThumbsDown, Eye, EyeOff } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isError404, setIsError404] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    // Step 1: Try system_users first (bcrypt hashed passwords)
    try {
      const sysRes = await fetch('http://72.62.227.163:8010/system-users/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: username, password: password }),
      });
      if (sysRes.ok) {
        const sysUser = await sysRes.json();
        // Map system user response to the user object App expects
        onLoginSuccess({
          username: sysUser.userName,
          role: sysUser.role,
          name: `${sysUser.firstName} ${sysUser.lastName}`,
          email: sysUser.email,
        });
        return;
      }
    } catch (err) {
      console.error('System user login error', err);
    }

    // Step 2: Fall back to employee table (plain text passwords)
    try {
      const empRes = await fetch('http://72.62.227.163:8010/employees/');
      if (empRes.ok) {
        const employees = await empRes.json();
        const matchedUser = employees.find(emp => emp.username === username && emp.password === password);
        if (matchedUser) {
          onLoginSuccess(matchedUser);
          return;
        }
      }
    } catch (err) {
      console.error('Employee login error', err);
    }

    setIsError404(true);
  };

  if (isError404) {
    return (
      <div className="d-flex align-items-center justify-content-center w-100 vh-100 bg-firo-bg">
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center d-flex flex-column align-items-center" style={{ maxWidth: '450px' }}>
          <div className="mb-4 bg-danger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center text-danger" style={{ width: '100px', height: '100px' }}>
            <ThumbsDown size={50} strokeWidth={1.5} />
          </div>
          <h1 className="display-4 fw-bold text-firo-dark mb-2">404</h1>
          <h3 className="h5 fw-bold text-firo-dark mb-3">Authentication Failed</h3>
          <p className="text-firo-muted mb-4">
            The username and password you entered are wrong. We could not find a matching account in our system.
          </p>
          <button 
            className="btn btn-primary bg-firo-primary border-0 rounded-pill px-5 py-2 fw-medium shadow-sm"
            onClick={() => {
              setIsError404(false);
              setPassword('');
            }}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid m-0 p-0 vh-100 vw-100 overflow-hidden" style={{ fontFamily: 'Inter, sans-serif', zIndex: 99999, position: 'relative' }}>
      <div className="row g-0 h-100">
        
        {/* Left Side Image */}
        <div 
          className="col-12 col-lg-4 d-none d-lg-block h-100 position-relative" 
          style={{ 
            backgroundImage: 'url("/scan-qr.jpg")', 
            backgroundSize: 'cover', 
            backgroundPosition: 'center' 
          }}
        >
          {/* Subtle overlay */}
          <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark" style={{ opacity: 0.15 }}></div>
        </div>

        {/* Center Login Form */}
        <div className="col-12 col-lg-4 d-flex flex-column bg-white h-100 position-relative shadow-lg z-3">
          
          <div className="p-4 border-bottom text-center">
            <div className="d-inline-flex align-items-center bg-white shadow-sm rounded-3 px-4 py-2 border" style={{ borderColor: '#f3f4f6' }}>
              <span className="fw-bold fs-5 me-2" style={{ color: '#134e7a' }}>ATM</span>
              <span className="fw-bold" style={{ color: '#134e7a', fontSize: '0.85rem' }}>ATM ENGINEERING PTE LTD</span>
            </div>
          </div>

          <div className="flex-grow-1 d-flex flex-column justify-content-center px-4 px-sm-5 mx-auto w-100" style={{ maxWidth: '480px' }}>
            <div className="text-center mb-5">
              <h2 className="fw-bold mb-2" style={{ color: '#1f2937', fontSize: '2rem' }}>Welcome back</h2>
              <p className="text-muted">Please enter your details to sign in.</p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="form-label fw-bold text-dark mb-2" style={{ fontSize: '0.9rem' }}>Username</label>
                <input 
                  type="text" 
                  className="form-control px-3 py-2 border-0" 
                  style={{ backgroundColor: '#eff6ff', borderRadius: '8px' }}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  autoFocus
                />
              </div>

              <div className="mb-5">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label fw-bold text-dark mb-0" style={{ fontSize: '0.9rem' }}>Password</label>
                  <a href="#" className="text-decoration-none fw-bold" style={{ color: '#134e7a', fontSize: '0.85rem' }}>Forgot password?</a>
                </div>
                <div className="position-relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="form-control px-3 py-2 border-0" 
                    style={{ backgroundColor: '#eff6ff', borderRadius: '8px', letterSpacing: showPassword ? 'normal' : '2px', paddingRight: '40px' }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="•••••"
                  />
                  <button
                    type="button"
                    className="btn border-0 position-absolute end-0 top-50 translate-middle-y text-muted"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ background: 'none' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn w-100 text-white fw-bold d-flex justify-content-center align-items-center py-2" 
                style={{ backgroundColor: '#134e7a', borderRadius: '8px' }}
              >
                Sign In <ArrowRight size={18} className="ms-2" />
              </button>
            </form>

            <div className="mt-5 text-center pb-4">
              <p className="text-muted small mb-0">
                Don't have an account? <a href="#" className="text-decoration-none fw-bold" style={{ color: '#134e7a' }}>Sign up</a>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side Image */}
        <div 
          className="col-12 col-lg-4 d-none d-lg-block h-100 position-relative" 
          style={{ 
            backgroundImage: 'url("/office-entry.jpg")', 
            backgroundSize: 'cover', 
            backgroundPosition: 'center' 
          }}
        >
          {/* Subtle overlay */}
          <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark" style={{ opacity: 0.1 }}></div>
        </div>

      </div>
    </div>
  );
};

export default Login;
