const { createClient } = require('redis');

const client = createClient({
  url: 'redis://host.docker.internal:6379'
});

client.on('error', (err) => console.error('❌ Redis Client Error', err));

async function connectRedis() {
    if (!client.isOpen) {
        await client.connect();
        console.log('✅ Redis connected (drivers-service)');
    }
}

module.exports = { client, connectRedis };
