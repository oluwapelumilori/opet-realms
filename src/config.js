
export const GARMENT_PRICES = [
  { id: 'white-shirt', name: 'White Shirt', price: 600 },
  { id: 'shirt', name: 'Colored Shirt', price: 500 },

  { id: 'white-t-shirt', name: 'White T-Shirt', price: 500 },
  { id: 't-shirt', name: 'Colored T-Shirt', price: 400 },

  { id: 'blazers', name: 'Colored Blazers', price: 1500 },
  { id: 'white-blazers', name: 'White Blazers', price: 2000 },

  { id: 'white-native', name: 'White Native', price: 1500 },
  { id: 'native', name: 'Colored Native', price: 1000 },

  { id: 'white-agbada', name: 'White Agbada', price: 2000 },
  { id: 'agbada', name: 'Colored Agbada', price: 1500 },

  { id: 'long-jeans', name: 'Long Jeans', price: 500 },
  { id: 'short-jeans', name: 'Short Jeans', price: 500 },

  { id: 'polo', name: 'Colored Polo', price: 400 },
  { id: 'white-polo', name: 'White Polo', price: 500 },

  { id: 'shorts', name: 'Colored Shorts', price: 500 },
  { id: 'white-shorts', name: 'White Shorts', price: 600 },

  { id: 'stoned-beaded-gowns', name: 'Stoned/Beaded Gowns', price: 2500 },
  { id: 'gown', name: 'Colored Gown', price: 1000 },
  { id: 'white-gown', name: 'White Gown', price: 1200 },

  { id: 'jalamia', name: 'Colored Jalamia', price: 1000 },
  { id: 'white-jalamia', name: 'White Jalamia', price: 1200 },

  { id: 'towel', name: 'Colored Towel', price: 700 },
  { id: 'white-towel', name: 'White Towel', price: 800 },

  { id: 'trouser', name: 'Colored Trouser', price: 500 },
  { id: 'white-trouser', name: 'White Trouser', price: 600 },

  { id: 'duvet', name: 'Duvet (Small)', price: 2500 },
  { id: 'duvet-medium', name: 'Duvet (Medium)', price: 3000 },
  { id: 'duvet-large', name: 'Duvet (Large)', price: 3500 },
  { id: 'white-duvet', name: 'White Duvet', price: 3000 },

  { id: 'bedsheet', name: 'Colored Bedsheet', price: 1000 },
  { id: 'white-bedsheet', name: 'White Bedsheet', price: 1500 },

  { id: 'pillow-cover', name: 'Colored Pillow Cover', price: 300 },
  { id: 'white-pillow-cover', name: 'White Pillow Cover', price: 400 },

  { id: 'garment', name: 'Garment', price: 1500 },

  { id: 'sweat-shirt', name: 'Colored Sweatshirt', price: 700 },
  { id: 'white-sweatshirt', name: 'White Sweatshirt', price: 800 },

  { id: 'thick-curtain', name: 'Thick Curtain', price: 2500 },
  { id: 'small-curtain', name: 'Small Curtain', price: 1500 },
  { id: 'inner-curtains', name: 'Inner Curtains', price: 1000 },

  { id: 'white-socks', name: 'White Socks', price: 300 },
  { id: 'socks', name: 'Colored Socks', price: 200 },

  { id: 'white-singlet', name: 'White Singlet', price: 300 },
  { id: 'singlet', name: 'Colored Singlet', price: 200 },
];

export const BASKET_PRICES = [
  { id: 'white-basket', name: 'Laundry Basket (White)', price: 5000 },
  { id: 'regular-basket', name: 'Laundry Basket (Colored)', price: 4000 },
];

export const PRESSING_PRICES = [
  { id: 'pressing-shirt', name: 'Shirt', price: 300 },
  { id: 'pressing-trouser', name: 'Trouser', price: 300 },
  { id: 'pressing-gown', name: 'Gown', price: 500 },
  { id: 'pressing-native', name: 'Native', price: 600 },
  { id: 'pressing-t-shirt', name: 'T-Shirt', price: 300 },
  { id: 'pressing-agbada', name: 'Agbada', price: 1000 },
];

export const formatNaira = (amount) =>
  `₦${Number(amount).toLocaleString('en-NG')}`;
