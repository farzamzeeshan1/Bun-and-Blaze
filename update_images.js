const fs = require('fs');

const menu = JSON.parse(fs.readFileSync('menu.json', 'utf8'));

menu.forEach((item, index) => {
  let keyword = 'food';
  const name = item.name.toLowerCase();
  
  if (name.includes('burger') || name.includes('smash') || name.includes('blaze')) keyword = 'burger';
  else if (name.includes('shake')) keyword = 'milkshake';
  else if (name.includes('fries')) keyword = 'fries';
  else if (name.includes('chicken') || name.includes('wings') || name.includes('zinger') || name.includes('chick')) keyword = 'friedchicken';
  else if (name.includes('salad')) keyword = 'salad';
  else if (name.includes('drink') || name.includes('coke') || name.includes('sprite') || name.includes('fanta')) keyword = 'soda';
  else if (name.includes('pie') || name.includes('mousse') || name.includes('cream')) keyword = 'dessert';
  else if (name.includes('sandwich')) keyword = 'sandwich';
  else if (name.includes('mac')) keyword = 'macaroni';
  else if (name.includes('rings')) keyword = 'onionrings';
  else if (name.includes('fish')) keyword = 'fishandchips';
  else if (name.includes('cheese')) keyword = 'cheese';
  
  // Use loremflickr for random but consistent images based on the item index
  item.image = `https://loremflickr.com/400/300/${keyword}?lock=${index + 100}`;
});

fs.writeFileSync('menu.json', JSON.stringify(menu, null, 2));
console.log('Successfully updated menu.json with unique image URLs!');
