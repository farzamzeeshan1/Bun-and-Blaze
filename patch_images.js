const fs = require('fs');
const menu = JSON.parse(fs.readFileSync('menu.json', 'utf8'));

const replacements = {
  "cheezious_bacon": "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400",
  "blaze_fries": "https://images.unsplash.com/photo-1585692131976-590fb68bd718?w=400",
  "chocolate_milkshake": "https://images.unsplash.com/photo-1577805947697-89e18249d767?w=400",
  "strawberry_milkshake": "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=400"
};

menu.forEach(item => {
  if (replacements[item.id]) {
    item.image = replacements[item.id];
  }
});

fs.writeFileSync('menu.json', JSON.stringify(menu, null, 2));
console.log('Fixed broken images');
