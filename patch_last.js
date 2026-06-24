const fs = require('fs');
const menu = JSON.parse(fs.readFileSync('menu.json', 'utf8'));

menu.forEach(item => {
  if (item.id === "blaze_fries") {
    item.image = "https://loremflickr.com/400/300/frenchfries?lock=555";
  }
  if (item.id === "chocolate_mousse") {
    item.image = "https://loremflickr.com/400/300/dessert,chocolate?lock=666";
  }
});

fs.writeFileSync('menu.json', JSON.stringify(menu, null, 2));
console.log('Patched blaze fries and chocolate mousse');
