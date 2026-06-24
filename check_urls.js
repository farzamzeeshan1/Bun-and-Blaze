const https = require('https');
const fs = require('fs');
const menu = JSON.parse(fs.readFileSync('menu.json', 'utf8'));

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve(res.statusCode);
    }).on('error', (e) => {
      resolve(500);
    });
  });
}

async function validate() {
  for (const item of menu) {
    const status = await checkUrl(item.image);
    if (status !== 200 && status !== 302) {
      console.log(`Failed: ${item.name} - ${status} - ${item.image}`);
    }
  }
  console.log('Validation complete.');
}

validate();
