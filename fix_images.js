const fs = require('fs');

const menu = JSON.parse(fs.readFileSync('menu.json', 'utf8'));

const images = {
  // Burgers
  "cheezious_original": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
  "cheezious_bacon": "https://images.unsplash.com/photo-1594212202875-86ac51fbbec0?w=400",
  "spicy_zinger": "https://images.unsplash.com/photo-1615719413546-198b25453f85?w=400",
  "original_smash": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400",
  "double_blaze": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400",
  "spicy_ember": "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=400",
  "veggie_burger": "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400",
  "grilled_chicken_sandwich": "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400",
  "bbq_pulled_pork_sandwich": "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400",
  
  // Sides
  "popcorn_chicken": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400",
  "bbq_wings": "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=400",
  "loaded_fries": "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400",
  "crispy_chick": "https://images.unsplash.com/photo-1569691899455-88464f6d3ab1?w=400",
  "blaze_fries": "https://images.unsplash.com/photo-1576107223687-f8e1215b80cc?w=400",
  "chicken_nuggets": "https://images.unsplash.com/photo-1562967914-608f82629710?w=400",
  "mac_and_cheese": "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=400",
  "fish_and_chips": "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400",
  "onion_rings": "https://images.unsplash.com/photo-1639024471283-03518883512d?w=400",
  "cheese_sticks": "https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=400",
  "chili_cheese_fries": "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=400",

  // Drinks
  "soft_drink": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400",
  "coke": "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400",
  "sprite": "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400",
  "fanta": "https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=400",

  // Shakes & Desserts
  "salted_caramel_shake": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400",
  "chocolate_milkshake": "https://images.unsplash.com/photo-1553787762-b5f528160828?w=400",
  "strawberry_milkshake": "https://images.unsplash.com/photo-1553177595-4de6bb080e59?w=400",
  "ice_cream_cone": "https://images.unsplash.com/photo-1559703248-dcaaec9fab78?w=400",
  "chocolate_mousse": "https://images.unsplash.com/photo-1602930491741-6925150e7b89?w=400",
  "apple_pie": "https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=400",

  // Salads
  "garden_salad": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
  "caesar_salad": "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400"
};

menu.forEach((item) => {
  if (images[item.id]) {
    item.image = images[item.id];
  } else {
    // Fallback if somehow missed
    item.image = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400"; 
  }
});

fs.writeFileSync('menu.json', JSON.stringify(menu, null, 2));
console.log('Fixed images with precise Unsplash URLs!');
