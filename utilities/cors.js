const cors = require('cors');
let options = {
  origin: [
    'http://localhost:3001',
    'http://localhost:3000',
    'http://localhost:3002',
    'https://admin.bpexam.live',
    'https://bpexam.live',
    'https://free.bpexam.live',
    'https://www.bpexam.live',
  ],
  'Access-Control-Allow-Origin': [
    'http://localhost:3001',
    'http://localhost:3000',
    'http://localhost:3002',
    'https://admin.bpexam.live',
    'https://bpexam.live',
    'https://free.bpexam.live',
    'https://www.bpexam.live',
    'https://gpcmp.grameenphone.com/ecmapigw/webresources/ecmapigw.v2',
  ],
  'Access-Control-Request-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
  'X-Requested-With': 'XMLHttpRequest',
  'X-Frame-Options': 'SAMEORIGIN',
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, Content-Length, X-Requested-With, X-Frame-Options',
  credentials: true,
};

module.exports = (app) => {
  app.use(cors(options));
};
