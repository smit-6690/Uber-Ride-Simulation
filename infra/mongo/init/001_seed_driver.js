// Development-only seed data for a fresh local MongoDB volume.
// The application still owns validation and authentication in normal flows.
db.drivers.updateOne(
  { driverId: '123-45-6789' },
  {
    $setOnInsert: {
      driverId: '123-45-6789',
      password: 'development-only-password',
      firstName: 'Demo',
      lastName: 'Driver',
      address: '1 Market Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      phoneNumber: '4155550100',
      email: 'demo.driver@example.com',
      carDetails: {
        make: 'Toyota',
        model: 'Prius',
        year: 2024,
        color: 'Black',
        licensePlate: 'DEMO123'
      },
      currentLocation: {
        latitude: 37.7750,
        longitude: -122.4195,
        address: 'San Francisco, CA'
      },
      licenseNumber: 'DEV-LICENSE-001',
      licenseExpiry: ISODate('2030-01-01T00:00:00Z'),
      insuranceDetails: {
        provider: 'Development Insurance',
        policyNumber: 'DEV-POLICY-001',
        expiryDate: ISODate('2030-01-01T00:00:00Z')
      },
      status: 'active',
      rating: 5,
      totalRides: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },
  { upsert: true }
);
