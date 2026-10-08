import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="footer">
    <Container>
      <Row className="g-4 align-items-start">
        <Col md={6}><div className="uber-brand mb-2">uber</div><p className="mb-0">A distributed ride simulation built with React, Go, Python, Kafka, Redis, MongoDB, and MySQL.</p></Col>
        <Col md={3}><strong className="text-white d-block mb-2">Riders</strong><Link to="/customers/signup">Sign up</Link><br /><Link to="/customers/login">Log in</Link></Col>
        <Col md={3}><strong className="text-white d-block mb-2">Drivers</strong><Link to="/drivers/signup">Drive with us</Link><br /><Link to="/drivers/login">Driver login</Link></Col>
      </Row>
      <hr className="border-secondary my-4" />
      <small>© {new Date().getFullYear()} Uber Ride Simulation · Engineering demo</small>
    </Container>
  </footer>
);

export default Footer;
