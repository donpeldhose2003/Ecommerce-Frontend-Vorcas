const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
      credentials: 'include',  // Include credentials for CORS
      onProxyReq: (proxyReq, req, res) => {
        // Preserve Authorization header if present
        const authHeader = req.headers['authorization'];
        if (authHeader) {
          proxyReq.setHeader('Authorization', authHeader);
          console.log('Proxy: Forwarding Authorization header:', authHeader.substring(0, 20) + '...');
        }

        if (req.body) {
          const bodyData = JSON.stringify(req.body);
          proxyReq.setHeader('Content-Type', 'application/json');
          proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
        }
      },
      logLevel: 'debug',
    })
  );
};
