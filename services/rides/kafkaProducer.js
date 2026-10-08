const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'rides-service',
  brokers: (process.env.KAFKA_BROKERS || 'kafka:9092').split(',')
});

const producer = kafka.producer();

async function connectKafkaProducer() {
  await producer.connect();
  console.log('✅ Kafka producer connected (rides-service)');
}

async function sendRideCompletedEvent(rideData) {
  await producer.send({
    topic: 'ride-completed',
    messages: [
      {
        key: rideData.rideId,
        value: JSON.stringify(rideData)
      }
    ]
  });
  console.log(`🚀 Sent ride-completed event for ${rideData.rideId}`);
}

module.exports = { connectKafkaProducer, sendRideCompletedEvent };
