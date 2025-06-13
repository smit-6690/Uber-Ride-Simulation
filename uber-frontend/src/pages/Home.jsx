import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaCar, FaUser, FaUserShield, FaShieldAlt, FaClock, FaMoneyBillWave, FaStar } from 'react-icons/fa';
import Footer from '../components/Footer';

const Home = () => {
  const navigate = useNavigate();

  const testimonials = [
    {
      name: "John Smith",
      role: "Regular Rider",
      text: "The best ride-hailing service I've ever used. Always on time and professional drivers!",
      rating: 5
    },
    {
      name: "Sarah Johnson",
      role: "Business Traveler",
      text: "Perfect for my business trips. The app is intuitive and the rides are always comfortable.",
      rating: 5
    },
    {
      name: "Mike Wilson",
      role: "Driver Partner",
      text: "Great platform for drivers. Flexible hours and good earnings. Highly recommended!",
      rating: 5
    }
  ];

  return (
    <div className="bg-light">
      {/* Hero Section */}
      <div 
        className="text-white py-5 mb-5 position-relative"
        style={{
          background: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Container>
          <Row className="align-items-center">
            <Col md={8} className="mx-auto text-center">
              <h1 className="display-3 fw-bold mb-4">Your Ride, Your Way</h1>
              <p className="lead mb-5 fs-4">Experience safe, reliable, and convenient transportation at your fingertips</p>
              <div className="d-flex gap-3 justify-content-center">
                <Button 
                  variant="primary" 
                  size="lg"
                  className="px-4 py-3 fw-bold"
                  onClick={() => navigate('/customers/signup')}
                >
                  Get Started
                </Button>
                <Button 
                  variant="outline-light" 
                  size="lg"
                  className="px-4 py-3 fw-bold"
                  onClick={() => navigate('/drivers/signup')}
                >
                  Drive With Us
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Features Section */}
      <Container className="py-5">
        <h2 className="text-center mb-5 fw-bold">Why Choose Us</h2>
        <Row className="g-4 mb-5">
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm text-center p-4 hover-card">
              <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: '80px', height: '80px' }}>
                <FaShieldAlt size={32} className="text-primary" />
              </div>
              <Card.Title className="h4 mb-3">Safe & Secure</Card.Title>
              <Card.Text className="text-muted">
                Your safety is our priority. All our drivers are verified and monitored for your peace of mind.
              </Card.Text>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm text-center p-4 hover-card">
              <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: '80px', height: '80px' }}>
                <FaClock size={32} className="text-success" />
              </div>
              <Card.Title className="h4 mb-3">24/7 Service</Card.Title>
              <Card.Text className="text-muted">
                Available round the clock. Book a ride anytime, anywhere, and we'll be there.
              </Card.Text>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm text-center p-4 hover-card">
              <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: '80px', height: '80px' }}>
                <FaMoneyBillWave size={32} className="text-warning" />
              </div>
              <Card.Title className="h4 mb-3">Best Rates</Card.Title>
              <Card.Text className="text-muted">
                Competitive pricing with transparent fare calculation. No hidden charges.
              </Card.Text>
            </Card>
          </Col>
        </Row>

        {/* User Type Cards */}
        <Row className="g-4 mb-5">
          <Col md={4}>
            <Card className="h-100 shadow-sm hover-shadow transition">
              <Card.Body className="text-center p-4">
                <div className="mb-4">
                  <FaCar size={48} className="text-primary mb-3" />
                  <Card.Title className="h3 mb-3">I'm a Driver</Card.Title>
                  <p className="text-muted mb-4">Join our network of professional drivers and earn on your schedule</p>
                </div>
                <div className="d-grid gap-2">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="mb-2"
                    onClick={() => navigate('/drivers/signup')}
                  >
                    Driver Signup
                  </Button>
                  <Button 
                    variant="outline-primary" 
                    size="lg"
                    onClick={() => navigate('/drivers/login')}
                  >
                    Driver Login
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100 shadow-sm hover-shadow transition">
              <Card.Body className="text-center p-4">
                <div className="mb-4">
                  <FaUser size={48} className="text-success mb-3" />
                  <Card.Title className="h3 mb-3">I'm a Customer</Card.Title>
                  <p className="text-muted mb-4">Book rides instantly and travel safely to your destination</p>
                </div>
                <div className="d-grid gap-2">
                  <Button 
                    variant="success" 
                    size="lg" 
                    className="mb-2"
                    onClick={() => navigate('/customers/signup')}
                  >
                    Customer Signup
                  </Button>
                  <Button 
                    variant="outline-success" 
                    size="lg"
                    onClick={() => navigate('/customers/login')}
                  >
                    Customer Login
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100 shadow-sm hover-shadow transition bg-dark text-white">
              <Card.Body className="text-center p-4">
                <div className="mb-4">
                  <FaUserShield size={48} className="text-light mb-3" />
                  <Card.Title className="h3 mb-3">Admin Access</Card.Title>
                  <p className="text-light-50 mb-4">Manage drivers, customers, and system operations</p>
                </div>
                <div className="d-grid">
                  <Button
                    variant="light"
                    size="lg"
                    className="fw-bold"
                    onClick={() => navigate('/admin/login')}
                  >
                    Admin Login
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Testimonials Section */}
        <div className="py-5">
          <h2 className="text-center mb-5 fw-bold">What Our Users Say</h2>
          <Row className="g-4">
            {testimonials.map((testimonial, index) => (
              <Col md={4} key={index}>
                <Card className="h-100 border-0 shadow-sm p-4 hover-card">
                  <div className="d-flex justify-content-center mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <FaStar key={i} className="text-warning mx-1" />
                    ))}
                  </div>
                  <Card.Text className="text-muted mb-4 text-center">
                    "{testimonial.text}"
                  </Card.Text>
                  <div className="text-center">
                    <h5 className="mb-1 fw-bold">{testimonial.name}</h5>
                    <small className="text-muted">{testimonial.role}</small>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Container>

      {/* Footer */}
      <Footer />

      <style>
        {`
          .hover-shadow:hover {
            transform: translateY(-5px);
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
          }
          .transition {
            transition: all 0.3s ease;
          }
          .hover-card {
            transition: all 0.3s ease;
          }
          .hover-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
          }
        `}
      </style>
    </div>
  );
};

export default Home;
