const { createClient } = require('redis');

const client = createClient({ url: 'redis://host.docker.internal:6379' });
client.on('error', (err) => console.error('❌ Redis Error:', err));

async function connectRedis() {
    if (!client.isOpen) {
        await client.connect();
        console.log('✅ Redis connected (rides-service)');
    }
}

module.exports = { client, connectRedis };
