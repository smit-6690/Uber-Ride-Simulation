import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutDriver } from '../features/driver/driverSlice';
import { logoutCustomer } from '../features/customer/customerSlice';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { FaCar, FaUser, FaSignInAlt, FaUserPlus, FaMoneyBillWave, FaSignOutAlt, FaHome, FaTaxi, FaUserCircle, FaClipboardList } from 'react-icons/fa';

const AppNavbar = () => {
  const { authDriver } = useSelector((state) => state.driver);
  const { authCustomer } = useSelector((state) => state.customer);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoutDriver = () => {
    dispatch(logoutDriver());
    navigate('/drivers/login');
  };

  const handleLogoutCustomer = () => {
    dispatch(logoutCustomer());
    navigate('/customers/login');
  };

  const isHome = location.pathname === '/';

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm mb-4 py-3">
      <Container>
        {isHome ? (
          <span className="fw-bold d-flex align-items-center navbar-brand" style={{ cursor: 'default', pointerEvents: 'none' }}>
            <FaTaxi className="me-3 text-warning" size={28} /> 
            <span style={{ fontSize: '1.6rem' }}>Uber Clone</span>
          </span>
        ) : (
          <Navbar.Brand href="/" className="fw-bold d-flex align-items-center">
            <FaTaxi className="me-3 text-warning" size={28} /> 
            <span style={{ fontSize: '1.6rem' }}>Uber Clone</span>
          </Navbar.Brand>
        )}
        <Navbar.Toggle aria-controls="main-navbar-nav" className="border-0" />
        <Navbar.Collapse id="main-navbar-nav">
          <Nav className="me-auto">
            {!isHome && !authDriver && !authCustomer && (
              <>
                <NavLink to="/drivers/signup" className={({ isActive }) => `nav-link d-flex align-items-center${isActive ? ' active fw-bold' : ''}`} style={{ marginRight: '1.5rem', fontSize: '1.1rem' }}>
                  <FaUserPlus className="me-2" size={18} /> Driver Signup
                </NavLink>
                <NavLink to="/drivers/login" className={({ isActive }) => `nav-link d-flex align-items-center${isActive ? ' active fw-bold' : ''}`} style={{ marginRight: '1.5rem', fontSize: '1.1rem' }}>
                  <FaSignInAlt className="me-2" size={18} /> Driver Login
                </NavLink>
                <NavLink to="/customers/signup" className={({ isActive }) => `nav-link d-flex align-items-center${isActive ? ' active fw-bold' : ''}`} style={{ marginRight: '1.5rem', fontSize: '1.1rem' }}>
                  <FaUserPlus className="me-2" size={18} /> Customer Signup
                </NavLink>
                <NavLink to="/customers/login" className={({ isActive }) => `nav-link d-flex align-items-center${isActive ? ' active fw-bold' : ''}`} style={{ marginRight: '1.5rem', fontSize: '1.1rem' }}>
                  <FaSignInAlt className="me-2" size={18} /> Customer Login
                </NavLink>
              </>
            )}

            {authDriver && (
              <>
                <NavLink to={`/drivers/${authDriver.driverId}/summary`} className={({ isActive }) => `nav-link d-flex align-items-center${isActive ? ' active fw-bold' : ''}`} style={{ marginRight: '1.5rem', fontSize: '1.1rem' }}>
                  <FaHome className="me-2" size={18} /> Summary
                </NavLink>
                <NavLink to={`/drivers/${authDriver.driverId}/rides`} className={({ isActive }) => `nav-link d-flex align-items-center${isActive ? ' active fw-bold' : ''}`} style={{ marginRight: '1.5rem', fontSize: '1.1rem' }}>
                  <FaClipboardList className="me-2" size={18} /> My Rides
                </NavLink>
                <NavLink to={`/drivers/${authDriver.driverId}/profile`} className={({ isActive }) => `nav-link d-flex align-items-center${isActive ? ' active fw-bold' : ''}`} style={{ marginRight: '1.5rem', fontSize: '1.1rem' }}>
                  <FaUserCircle className="me-2" size={18} /> Profile
                </NavLink>
                <NavLink to={`/drivers/${authDriver.driverId}/billing`} className={({ isActive }) => `nav-link d-flex align-items-center${isActive ? ' active fw-bold' : ''}`} style={{ marginRight: '1.5rem', fontSize: '1.1rem' }}>
                  <FaMoneyBillWave className="me-2" size={18} /> Billing
                </NavLink>
                <Button variant="outline-light" size="lg" onClick={handleLogoutDriver} className="d-flex align-items-center ms-2 px-4">
                  <FaSignOutAlt className="me-2" size={18} /> Logout
                </Button>
              </>
            )}

            {authCustomer && (
              <>
                <NavLink to={`/customers/${authCustomer.customerId}/profile`} className={({ isActive }) => `nav-link d-flex align-items-center${isActive ? ' active fw-bold' : ''}`} style={{ marginRight: '1.5rem', fontSize: '1.1rem' }}>
                  <FaUserCircle className="me-2" size={18} /> Profile
                </NavLink>
                <NavLink to={`/customers/${authCustomer.customerId}/book`} className={({ isActive }) => `nav-link d-flex align-items-center${isActive ? ' active fw-bold' : ''}`} style={{ marginRight: '1.5rem', fontSize: '1.1rem' }}>
                  <FaCar className="me-2" size={18} /> Book Ride
                </NavLink>
                <NavLink to={`/customers/${authCustomer.customerId}/rides`} className={({ isActive }) => `nav-link d-flex align-items-center${isActive ? ' active fw-bold' : ''}`} style={{ marginRight: '1.5rem', fontSize: '1.1rem' }}>
                  <FaClipboardList className="me-2" size={18} /> My Rides
                </NavLink>
                <NavLink to={`/customers/${authCustomer.customerId}/billing`} className={({ isActive }) => `nav-link d-flex align-items-center${isActive ? ' active fw-bold' : ''}`} style={{ marginRight: '1.5rem', fontSize: '1.1rem' }}>
                  <FaMoneyBillWave className="me-2" size={18} /> Billing
                </NavLink>
                <Button variant="outline-light" size="lg" onClick={handleLogoutCustomer} className="d-flex align-items-center ms-2 px-4">
                  <FaSignOutAlt className="me-2" size={18} /> Logout
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
      <style>{`
        .navbar {
          transition: box-shadow 0.2s;
        }
        .navbar-brand {
          font-size: 1.6rem;
          letter-spacing: 1px;
        }
        .nav-link {
          transition: color 0.2s, background 0.2s;
          border-radius: 0.25rem;
          padding: 0.75rem 1.25rem;
          font-weight: 500;
        }
        .nav-link.active, .nav-link:hover {
          background: rgba(255,255,255,0.15);
          color: #fff !important;
        }
        .btn-outline-light {
          transition: all 0.2s;
          font-weight: 500;
          padding: 0.75rem 1.5rem;
        }
        .btn-outline-light:hover {
          background: #fff;
          color: #0d6efd !important;
        }
        @media (max-width: 991.98px) {
          .navbar-collapse {
            padding: 1rem 0;
          }
          .nav-link {
            padding: 0.75rem 0;
          }
          .btn-outline-light {
            margin-top: 1rem;
            width: 100%;
          }
        }
      `}</style>
    </Navbar>
  );
};

export default AppNavbar;
