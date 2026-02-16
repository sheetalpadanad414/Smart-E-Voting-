import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const LoginSimple = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('login'); // login or otp
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const otpInputRef = useRef(null);

  // Web OTP API - Auto-fill OTP from SMS/Email
  useEffect(() => {
    if (step === 'otp' && 'OTPCredential' in window) {
      const abortController = new AbortController();
      
      navigator.credentials.get({
        otp: { transport: ['sms'] },
        signal: abortController.signal
      })
      .then(otp => {
        if (otp && otp.code) {
          setOtp(otp.code);
          // Auto-submit if OTP is 6 digits
          if (otp.code.length === 6) {
            handleVerifyOTP({ preventDefault: () => {} }, otp.code);
          }
        }
      })
      .catch(err => {
        console.log('OTP auto-fill not available:', err);
      });

      return () => {
        abortController.abort();
      };
    }
  }, [step]);

  // Focus OTP input when step changes to OTP
  useEffect(() => {
    if (step === 'otp' && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [step]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Call login API - backend sends OTP
      const response = await authAPI.login({ email: formData.email, password: formData.password });
      setEmail(formData.email);
      setStep('otp');
      setError('');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e, otpCode = null) => {
    e.preventDefault();
    const otpToVerify = otpCode || otp;
    if (!otpToVerify) {
      setError('Please enter OTP');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await authAPI.verifyOTP({ email, otp: otpToVerify });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      if (response.data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/voter/dashboard');
      }
    } catch (err) {
      console.error('OTP verify error:', err);
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setError('');
    
    // Auto-submit when 6 digits are entered
    if (value.length === 6) {
      setTimeout(() => {
        handleVerifyOTP({ preventDefault: () => {} }, value);
      }, 300);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    try {
      await authAPI.login({ email: formData.email, password: formData.password });
      setError('');
      alert('OTP resent successfully! Check your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Smart E-Voting System</h2>
        <p style={styles.subtitle}>Login to your account</p>

        {step === 'login' ? (
          <form onSubmit={handleSubmit} style={styles.form}>
            {error && (
              <div style={styles.error}>
                {error}
              </div>
            )}

            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                style={styles.input}
                disabled={loading}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                style={styles.input}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              style={{
                ...styles.button,
                ...(loading ? styles.buttonDisabled : {})
              }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <p style={styles.footer}>
              Don't have an account?{' '}
              <a href="/register" style={styles.link}>
                Register here
              </a>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} style={styles.form}>
            {error && (
              <div style={styles.error}>
                {error}
              </div>
            )}

            <p style={{ textAlign: 'center', color: '#666' }}>An OTP has been sent to <strong>{email}</strong></p>

            <div style={styles.formGroup}>
              <label style={styles.label}>Enter OTP</label>
              <input
                ref={otpInputRef}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={handleOtpChange}
                placeholder="000000"
                maxLength={6}
                style={{ 
                  ...styles.input, 
                  textAlign: 'center', 
                  fontFamily: 'monospace', 
                  fontSize: '24px',
                  letterSpacing: '8px',
                  fontWeight: 'bold'
                }}
                disabled={loading}
              />
              <p style={{ fontSize: '12px', color: '#999', textAlign: 'center', marginTop: '8px' }}>
                OTP will auto-fill from email if supported by your browser
              </p>
            </div>

            <button
              type="submit"
              style={{
                ...styles.button,
                ...(loading ? styles.buttonDisabled : {})
              }}
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              onClick={handleResendOTP}
              style={{ 
                ...styles.button, 
                background: 'transparent', 
                color: '#667eea', 
                border: '1px solid #667eea',
                marginTop: '0'
              }}
              disabled={loading}
            >
              Resend OTP
            </button>

            <button
              type="button"
              onClick={() => { setStep('login'); setOtp(''); }}
              style={{ ...styles.button, background: 'transparent', color: '#333', border: '1px solid #ddd' }}
            >
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
    padding: '40px',
    width: '100%',
    maxWidth: '400px'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px',
    textAlign: 'center'
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '30px',
    textAlign: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333'
  },
  input: {
    padding: '12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    outline: 'none',
    transition: 'border-color 0.3s',
    fontFamily: 'inherit'
  },
  button: {
    padding: '12px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    marginTop: '10px'
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  },
  error: {
    padding: '12px',
    backgroundColor: '#fee',
    color: '#c33',
    borderRadius: '6px',
    fontSize: '14px',
    textAlign: 'center'
  },
  footer: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#666',
    marginTop: '10px'
  },
  link: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '600'
  }
};

export default LoginSimple;
