import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaBolt, FaCar, FaChartLine, FaShieldAlt } from 'react-icons/fa';
import Footer from '../components/Footer';

const Home = () => {
  const navigate = useNavigate();
  const { authCustomer } = useSelector((state) => state.customer);

  const startRide = () => {
    navigate(authCustomer ? `/customers/${authCustomer.customerId}/book` : '/customers/signup');
  };

  return (
    <div className="app-shell">
      <section className="hero">
        <Container className="hero-content">
          <Row className="align-items-center g-5">
            <Col lg={7}>
              <span className="eyebrow"><span className="eyebrow-dot" /> Distributed ride operations</span>
              <h1>Go anywhere. Get there.</h1>
              <p className="hero-copy">A production-style ride simulation with real-time matching, ML-powered pricing, event-driven billing, and a frontend built for the whole journey.</p>
              <div className="hero-actions">
                <button type="button" className="button-white" onClick={startRide}>Book a ride</button>
                <button type="button" className="button-black" onClick={() => navigate('/drivers/signup')}>Become a driver</button>
              </div>
            </Col>
            <Col lg={5}>
              <div className="hero-visual" aria-label="Live route preview">
                <div className="map-orbit">
                  <span className="route-line" />
                  <span className="orbit-pin pin-one" />
                  <span className="orbit-pin pin-two" />
                </div>
                <div className="floating-status"><strong>Driver matched</strong><span>Redis reservation active · 0.01 km away</span></div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="section bg-white">
        <Container>
          <Row className="align-items-end mb-5">
            <Col lg={7}><span className="eyebrow text-dark"><span className="eyebrow-dot" /> One platform</span><h2 className="section-title mt-3">Built around the ride.</h2></Col>
            <Col lg={5}><p className="section-copy mb-0">The UI connects directly to the same REST services that power matching, pricing, persistence, and billing.</p></Col>
          </Row>
          <Row className="g-4">
            <Col md={6} lg={3}><div className="feature-card"><div className="feature-icon"><FaCar /></div><h3>Simple booking</h3><p>Choose pickup, destination, and time in a focused ride flow.</p></div></Col>
            <Col md={6} lg={3}><div className="feature-card"><div className="feature-icon"><FaBolt /></div><h3>Live matching</h3><p>Go and Redis reserve the nearest available driver atomically.</p></div></Col>
            <Col md={6} lg={3}><div className="feature-card"><div className="feature-icon"><FaChartLine /></div><h3>Smart pricing</h3><p>Python ML estimates the fare from distance and trip context.</p></div></Col>
            <Col md={6} lg={3}><div className="feature-card"><div className="feature-icon"><FaShieldAlt /></div><h3>Traceable billing</h3><p>Kafka completion events synchronize MongoDB and MySQL billing records.</p></div></Col>
          </Row>
        </Container>
      </section>

      <section className="section section-dark">
        <Container>
          <Row className="align-items-center g-4">
            <Col lg={7}><h2 className="section-title">A ride app with a systems mindset.</h2><p className="section-copy dark-copy">From the first click to the final invoice, every service has a clear responsibility and every state change can be verified.</p></Col>
            <Col lg={5}><Row className="g-3"><Col xs={6}><div className="stat-card"><div className="stat-number">Go</div><div className="stat-label">real-time matching</div></div></Col><Col xs={6}><div className="stat-card"><div className="stat-number">ML</div><div className="stat-label">fare prediction</div></div></Col><Col xs={6}><div className="stat-card"><div className="stat-number">Kafka</div><div className="stat-label">event-driven billing</div></div></Col><Col xs={6}><div className="stat-card"><div className="stat-number">SQL</div><div className="stat-label">transaction records</div></div></Col></Row></Col>
          </Row>
        </Container>
      </section>
      <Footer />
    </div>
  );
};

export default Home;
