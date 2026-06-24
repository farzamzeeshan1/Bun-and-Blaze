const https = require('https');
const fs = require('fs');

const candidates = [
  "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400",
  "https://images.unsplash.com/photo-1628191139360-4083564d03fd?w=400",
  "https://images.unsplash.com/photo-1630431341973-02e1b662ce3b?w=400",
  "https://images.unsplash.com/photo-1585692131976-590fb68bd718?w=400",
  "https://images.unsplash.com/photo-1644497338356-9a572a15cb5c?w=400"
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve(res.statusCode);
    }).on('error', () => resolve(500));
  });
}

async function fix() {
  const menu = JSON.parse(fs.readFileSync('menu.json', 'utf8'));
  for (const url of candidates) {
    const status = await checkUrl(url);
    if (status === 200 || status === 302) {
      console.log(`Working URL found: ${url}`);
      menu.forEach(item => {
        if (item.id === "blaze_fries") {
          item.image = url;
        }
      });
      fs.writeFileSync('menu.json', JSON.stringify(menu, null, 2));
      console.log('Updated blaze_fries');
      return;
    }
  }
  console.log('No working URLs found');
}

fix();
