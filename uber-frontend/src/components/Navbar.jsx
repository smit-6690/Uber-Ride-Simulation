import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { logoutDriver } from '../features/driver/driverSlice';
import { logoutCustomer } from '../features/customer/customerSlice';

const AppNavbar = () => {
  const { authDriver } = useSelector((state) => state.driver);
  const { authCustomer } = useSelector((state) => state.customer);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const logout = () => {
    if (authDriver) {
      dispatch(logoutDriver());
      navigate('/drivers/login');
    } else {
      dispatch(logoutCustomer());
      navigate('/customers/login');
    }
  };

  return (
    <Navbar expand="lg" className="uber-navbar" variant="dark">
      <Container>
        <Navbar.Brand as={NavLink} to="/" className="uber-brand">
          uber
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto gap-lg-1 mt-3 mt-lg-0">
            <Nav.Link as={NavLink} to="/" end className="uber-nav-link">Ride</Nav.Link>
            <Nav.Link as={NavLink} to="/drivers/signup" className="uber-nav-link">Drive</Nav.Link>
            <Nav.Link as={NavLink} to="/admin/login" className="uber-nav-link">Business</Nav.Link>
            <Nav.Link as={NavLink} to="/drivers" className="uber-nav-link">Explore</Nav.Link>
          </Nav>
          <Nav className="align-items-lg-center gap-2 mt-3 mt-lg-0">
            {authCustomer && (
              <>
                <Nav.Link as={NavLink} to={`/customers/${authCustomer.customerId}/rides`} className="uber-nav-link">My rides</Nav.Link>
                <Nav.Link as={NavLink} to={`/customers/${authCustomer.customerId}/book`} className="nav-pill nav-primary">Book a ride</Nav.Link>
              </>
            )}
            {authDriver && (
              <Nav.Link as={NavLink} to={`/drivers/${authDriver.driverId}/summary`} className="uber-nav-link">Driver dashboard</Nav.Link>
            )}
            {!authCustomer && !authDriver && !isHome && (
              <>
                <Nav.Link as={NavLink} to="/customers/login" className="nav-pill">Log in</Nav.Link>
                <Nav.Link as={NavLink} to="/customers/signup" className="nav-pill nav-primary">Sign up</Nav.Link>
              </>
            )}
            {(authCustomer || authDriver) && (
              <button type="button" className="nav-pill" onClick={logout}>Log out</button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
