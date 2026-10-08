import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { FaArrowRight, FaCalendarAlt, FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';
import { bookRide } from '../features/ride/rideThunks';
import RideMap from '../components/RideMap';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const defaultDateTime = () => {
  const date = new Date(Date.now() + 60 * 60 * 1000);
  date.setMinutes(0, 0, 0);
  return date.toISOString().slice(0, 16);
};

const parseCoordinates = (value) => {
  const match = value.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (!match) return null;
  const latitude = Number(match[1]);
  const longitude = Number(match[2]);
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
  return { lat: latitude, lng: longitude };
};

const CustomerBookRide = () => {
  const { authCustomer } = useSelector((state) => state.customer);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ pickup: '', dropoff: '', dateTime: defaultDateTime() });
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [suggestions, setSuggestions] = useState({ pickup: [], dropoff: [] });
  const [activeInput, setActiveInput] = useState('pickup');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const updateLocation = (type, value) => {
    setForm((current) => ({ ...current, [type]: value }));
    const parsed = parseCoordinates(value);
    if (type === 'pickup') setPickupCoords(parsed);
    if (type === 'dropoff') setDropoffCoords(parsed);
    if (!MAPBOX_TOKEN || !value.trim()) {
      setSuggestions((current) => ({ ...current, [type]: [] }));
      return;
    }
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json?access_token=${MAPBOX_TOKEN}`)
      .then((response) => response.json())
      .then((data) => setSuggestions((current) => ({ ...current, [type]: data.features || [] })))
      .catch(() => setSuggestions((current) => ({ ...current, [type]: [] })));
  };

  const chooseSuggestion = (type, suggestion) => {
    const [lng, lat] = suggestion.center;
    setForm((current) => ({ ...current, [type]: suggestion.place_name }));
    if (type === 'pickup') setPickupCoords({ lat, lng });
    if (type === 'dropoff') setDropoffCoords({ lat, lng });
    setSuggestions((current) => ({ ...current, [type]: [] }));
  };

  const resolveLocation = async (type, value, selectedCoords) => {
    if (selectedCoords) return selectedCoords;
    const parsed = parseCoordinates(value);
    if (parsed) return parsed;
    if (!MAPBOX_TOKEN) throw new Error(`Enter ${type} as "latitude, longitude" because no Mapbox token is configured.`);
    const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json?access_token=${MAPBOX_TOKEN}`);
    const data = await response.json();
    if (!data.features?.length) throw new Error(`Could not find the ${type} location.`);
    const [lng, lat] = data.features[0].center;
    return { lat, lng };
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!authCustomer) {
      navigate('/customers/login');
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const pickup = await resolveLocation('pickup', form.pickup, pickupCoords);
      const dropoff = await resolveLocation('dropoff', form.dropoff, dropoffCoords);
      const response = await dispatch(bookRide({
        pickupLocation: { address: form.pickup, latitude: pickup.lat, longitude: pickup.lng },
        dropoffLocation: { address: form.dropoff, latitude: dropoff.lat, longitude: dropoff.lng },
        dateTime: form.dateTime,
        customerId: authCustomer.customerId,
        passenger_count: 1
      })).unwrap();
      setMessage({ type: 'success', text: `Ride ${response.ride?.rideId || ''} booked successfully.` });
      setTimeout(() => navigate(`/customers/${authCustomer.customerId}/rides`), 700);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || error.message || 'Unable to book the ride.' });
    } finally {
      setLoading(false);
    }
  };

  const renderSuggestions = (type) => suggestions[type].length > 0 && (
    <div className="suggestion-list">
      {suggestions[type].slice(0, 5).map((suggestion) => (
        <button type="button" className="suggestion-item" key={suggestion.id} onClick={() => chooseSuggestion(type, suggestion)}>
          <FaMapMarkerAlt className="me-2 text-primary" />{suggestion.place_name}
        </button>
      ))}
    </div>
  );

  return (
    <div className="app-shell booking-page">
      <Container>
        <Row className="justify-content-center">
          <Col xl={10}>
            <Row className="g-4 align-items-stretch">
              <Col lg={5}>
                <div className="h-100 d-flex flex-column justify-content-center px-lg-3">
                  <span className="eyebrow text-dark"><span className="eyebrow-dot" /> Rider experience</span>
                  <h1 className="section-title mt-3">Where can we take you?</h1>
                  <p className="section-copy">Enter an address with Mapbox, or use latitude and longitude directly for local backend testing.</p>
                  <div className="surface p-3 mt-3"><strong>Connected services</strong><div className="small text-muted mt-2">Go matching · Redis reservation · ML fare estimate · MongoDB + MySQL persistence</div></div>
                </div>
              </Col>
              <Col lg={7}>
                <div className="surface booking-panel">
                  <h2 className="h3 fw-bold mb-1">Book a ride</h2>
                  <p className="text-muted mb-4">Your driver will be matched in real time.</p>
                  {message && <div className={`status-message mb-3 ${message.type === 'error' ? 'status-error' : 'status-success'}`}>{message.text}</div>}
                  <Form onSubmit={submit}>
                    <Form.Group className="mb-3 position-relative">
                      <Form.Label><span className="location-dot" />Pickup location</Form.Label>
                      <Form.Control value={form.pickup} onFocus={() => setActiveInput('pickup')} onChange={(event) => updateLocation('pickup', event.target.value)} placeholder={MAPBOX_TOKEN ? 'Search an address' : '37.7749, -122.4194'} required />
                      {activeInput === 'pickup' && renderSuggestions('pickup')}
                    </Form.Group>
                    <Form.Group className="mb-3 position-relative">
                      <Form.Label><span className="location-dot dropoff" />Dropoff location</Form.Label>
                      <Form.Control value={form.dropoff} onFocus={() => setActiveInput('dropoff')} onChange={(event) => updateLocation('dropoff', event.target.value)} placeholder={MAPBOX_TOKEN ? 'Search an address' : '37.7849, -122.4094'} required />
                      {activeInput === 'dropoff' && renderSuggestions('dropoff')}
                    </Form.Group>
                    <Form.Group className="mb-4">
                      <Form.Label><FaCalendarAlt className="me-2" />Pickup time</Form.Label>
                      <Form.Control type="datetime-local" value={form.dateTime} onChange={(event) => setForm((current) => ({ ...current, dateTime: event.target.value }))} required />
                    </Form.Group>
                    <Button type="submit" className="button-blue w-100 d-flex justify-content-center align-items-center gap-2" disabled={loading}>
                      {loading ? <><FaSpinner className="fa-spin" /> Matching a driver...</> : <>Confirm ride <FaArrowRight /></>}
                    </Button>
                  </Form>
                </div>
              </Col>
            </Row>
            {MAPBOX_TOKEN && (pickupCoords || dropoffCoords) && <div className="surface mt-4 p-2"><RideMap pickup={pickupCoords ? [pickupCoords.lng, pickupCoords.lat] : null} dropoff={dropoffCoords ? [dropoffCoords.lng, dropoffCoords.lat] : null} /></div>}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CustomerBookRide;
