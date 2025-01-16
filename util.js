const express = require('express');
const promClient = require('prom-client');

const app = express();
const PORT = 4000;

// Create a registry to store metrics
const register = new promClient.Registry();

// Default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({ register });

// Custom metric: Counter for requests
const httpRequestCounter = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
});
register.registerMetric(httpRequestCounter);

app.get('/', (req, res) => {
    httpRequestCounter.inc({ method: req.method, route: '/', status_code: 200 });
    res.send('Hello, Prometheus!');
});

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Metrics available at http://localhost:${PORT}/metrics`);
});
