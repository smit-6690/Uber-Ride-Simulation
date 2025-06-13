import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaUserPlus, FaUsers, FaCar, FaMoneyBillWave } from 'react-icons/fa';

const AdminDashboard = () => {
  const dashboardItems = [
    {
      title: 'Add Driver',
      description: 'Register a new driver to the system',
      icon: <FaUserPlus size={24} />,
      link: '/admin/add-driver',
      variant: 'primary'
    },
    {
      title: 'Add Customer',
      description: 'Register a new customer to the system',
      icon: <FaUsers size={24} />,
      link: '/admin/add-customer',
      variant: 'success'
    },
    {
      title: 'View Drivers',
      description: 'View and manage all registered drivers',
      icon: <FaCar size={24} />,
      link: '/admin/review-driver',
      variant: 'info'
    },
    {
      title: 'View Customers',
      description: 'View and manage all registered customers',
      icon: <FaUsers size={24} />,
      link: '/admin/review-customer',
      variant: 'warning'
    },
    {
      title: 'View Revenue',
      description: 'View revenue reports and analytics',
      icon: <FaMoneyBillWave size={24} />,
      link: '/admin/revenue',
      variant: 'danger'
    }
  ];

  return (
    <div className="bg-light min-vh-100 py-5">
      <Container>
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold mb-3">Admin Dashboard</h1>
          <p className="lead text-muted">Manage your ride-sharing platform</p>
        </div>

        <Row className="g-4">
          {dashboardItems.map((item, index) => (
            <Col key={index} md={6} lg={4} xl={3}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Body className="d-flex flex-column p-4">
                  <div className={`text-${item.variant} mb-3`}>
                    {item.icon}
                  </div>
                  <Card.Title className="h5 fw-bold mb-2">{item.title}</Card.Title>
                  <Card.Text className="text-muted mb-4 flex-grow-1">
                    {item.description}
                  </Card.Text>
                  <Link to={item.link} className="text-decoration-none">
                    <Button
                      variant={item.variant}
                      className="w-100"
                    >
                      Access
                    </Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      <style>
        {`
          .card {
            transition: all 0.3s ease-in-out;
          }
          .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
          }
          .btn {
            transition: all 0.2s ease-in-out;
          }
          .btn:hover {
            transform: translateY(-2px);
          }
          .text-primary { color: #0d6efd !important; }
          .text-success { color: #198754 !important; }
          .text-info { color: #0dcaf0 !important; }
          .text-warning { color: #ffc107 !important; }
          .text-danger { color: #dc3545 !important; }
          .text-secondary { color: #6c757d !important; }
          .text-dark { color: #212529 !important; }
        `}
      </style>
    </div>
  );
};

export default AdminDashboard;
