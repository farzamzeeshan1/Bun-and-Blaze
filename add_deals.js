const fs = require('fs');
const menu = JSON.parse(fs.readFileSync('menu.json', 'utf8'));

const newDeals = [
  {
    id: "deal_classic_combo",
    name: "Classic Combo",
    description: "Original Smash Burger, Blaze Fries & a Soft Drink",
    price: 9.99,
    image: "https://loremflickr.com/400/300/burger,meal?lock=1002",
    category: "Deals"
  },
  {
    id: "deal_family_feast",
    name: "Family Feast",
    description: "4 Burgers, 2 Loaded Fries & 4 Soft Drinks",
    price: 34.99,
    image: "https://loremflickr.com/400/300/fastfood,family?lock=1001",
    category: "Deals"
  },
  {
    id: "deal_chicken_craze",
    name: "Chicken Craze",
    description: "Spicy Zinger, Popcorn Chicken & any Shake",
    price: 14.49,
    image: "https://loremflickr.com/400/300/friedchicken,meal?lock=1003",
    category: "Deals"
  },
  {
    id: "deal_snack_pack",
    name: "Snack Pack",
    description: "Nuggets, Onion Rings, Cheese Sticks & a Drink",
    price: 11.99,
    image: "https://loremflickr.com/400/300/snacks,fastfood?lock=1004",
    category: "Deals"
  }
];

if (!menu.some(item => item.category === 'Deals')) {
  const updatedMenu = [...newDeals, ...menu];
  fs.writeFileSync('menu.json', JSON.stringify(updatedMenu, null, 2));
  console.log('Added Deals to menu.json');
} else {
  console.log('Deals already exist');
}
