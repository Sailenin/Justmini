import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState('');

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const adminUserType = localStorage.getItem('adminUserType');
    const token = sessionStorage.getItem('authToken');
    const userType = sessionStorage.getItem('userType');

    if (adminToken && adminUserType === 'admin') {
      navigate('/admin');
    } else if (token && userType) {
      navigate(userType === 'donor' ? '/donor-dashboard' : '/recipient-dashboard');
    }
  }, [navigate]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email' }));
      return false;
    } else {
      setErrors(prev => ({ ...prev, email: '' }));
      return true;
    }
  };

  const validatePassword = (password) => {
    if (password.length < 6) {
      setErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
      return false;
    } else {
      setErrors(prev => ({ ...prev, password: '' }));
      return true;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setServerMessage('');

    if (name === 'email') validateEmail(value);
    if (name === 'password') validatePassword(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isEmailValid = validateEmail(formData.email);
    const isPasswordValid = validatePassword(formData.password);

    if (!isEmailValid || !isPasswordValid) return;

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.message === 'Account pending admin approval') {
          return navigate('/pendingapproval');
        }
        throw new Error(data.errors?.[0]?.msg || data.message || 'Login failed');
      }

      if (data.userType === 'admin') {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUserType', data.userType);
        localStorage.setItem('userName', data.userName);
        navigate('/admin');
      } else {
        sessionStorage.setItem('authToken', data.token);
        sessionStorage.setItem('userType', data.userType);
        sessionStorage.setItem('userId', data.userId);
        sessionStorage.setItem('userName', data.userName);
        navigate(data.userType === 'donor' ? '/donor-dashboard' : '/recipient-dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      setServerMessage(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h2>Welcome Back</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>

          <div className="forgot-password">
            <a href="/forgot-password">Forgot Password?</a>
          </div>

          {serverMessage && <div className="error-message">{serverMessage}</div>}
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? (
              <>
                <span className="loading"></span>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>

          <div className="register-link">
            Don't have an account? <a href="/register">Register here</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
