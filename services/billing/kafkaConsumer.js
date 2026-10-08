const { Kafka } = require('kafkajs');
const Billing = require('./models/billing');
const { syncBillingToMySQL } = require('./mysqlClient');

const kafka = new Kafka({
  clientId: 'billing-service',
  brokers: (process.env.KAFKA_BROKERS || 'kafka:9092').split(',')
});

const consumer = kafka.consumer({ groupId: 'billing-consumer-group' });

async function startKafkaConsumer() {
  await consumer.connect();
  console.log("✅ Kafka consumer connected (billing-service)");

  await consumer.subscribe({ topic: 'ride-completed', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const rideData = JSON.parse(message.value.toString());
      console.log("📩 Received Kafka event for ride:", rideData.rideId);

      // Check if bill already exists
      const exists = await Billing.findOne({ rideId: rideData.rideId });
      if (exists) {
        console.log(`⚠️ Bill already exists for rideId ${rideData.rideId}`);
        return;
      }

      const billing = new Billing({
        rideId: rideData.rideId,
        billingId: `BILL-${Date.now()}`,
        date: new Date(),
        pickupTime: rideData.dateTime,
        dropoffTime: new Date(),
        distanceCovered: rideData.actualDistance,
        totalAmount: rideData.actualPrice,
        sourceLocation: rideData.pickupLocation,
        destinationLocation: rideData.dropoffLocation,
        driverId: rideData.driverId,
        customerId: rideData.customerId,
        predictedPrice: rideData.estimatedPrice,
        actualPrice: rideData.actualPrice,
        status: 'completed',
        paymentMethod: 'credit_card'
      });

      await billing.save();
      await syncBillingToMySQL(billing, rideData);
      console.log(`✅ Bill created via Kafka for rideId ${rideData.rideId}`);
    }
  });
}

module.exports = { startKafkaConsumer };
