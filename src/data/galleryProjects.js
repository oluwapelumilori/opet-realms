const img = (name) => `/images/gallery/${encodeURIComponent(name)}`

export const categories = [
  'All',
  'Armchairs',
  'Parlour',
  'Bedroom',
  'Kitchen',
  'Bathrooms/Toilets',
  'Mattresses',
  'Floors',
]

export const projects = [
  {
    title: 'Fabric armchair revival',
    category: 'Armchairs',
    before: img('Brown chair Before .jpg'),
    after: img('Brown chair After .jpg'),
  },
  {
    title: 'Parlour deep clean',
    category: 'Parlour',
    before: img('Palour Before.jpg'),
    after: img('Parlour After.jpg'),
  },
  {
    title: 'Bedroom reset',
    category: 'Bedroom',
    before: img('Bed Before .jpg'),
    after: img('Bed after .jpg'),
  },
  {
    title: 'Kitchen deep clean',
    category: 'Kitchen',
    before: img('Big kitchen Before .jpg'),
    after: img('Big kitchen After .jpg'),
  },
  {
    title: 'Compact kitchen degrease',
    category: 'Kitchen',
    before: img('Small Kichten Before.jpg'),
    after: img('Small Kichten After.jpg'),
  },
  {
    title: 'Colourful armchair refresh',
    category: 'Armchairs',
    before: img('Colour Chair Before.jpg'),
    after: img('Colur Chair After.jpg'),
  },
  {
    title: 'Long sofa deep clean',
    category: 'Armchairs',
    before: img('Long Chair Before .jpg'),
    after: img('Long Cahir After.jpg'),
  },
  {
    title: 'White chair restoration',
    category: 'Armchairs',
    before: img('White CHair Before .jpg'),
    after: img('White Chair After.jpg'),
  },
  {
    title: 'Yellow chair revival',
    category: 'Armchairs',
    before: img('Yellow Cahir Bfeore .jpg'),
    after: img('Yellow Cahir After .jpg'),
  },
  {
    title: 'Bathroom scrub-down',
    category: 'Bathrooms/Toilets',
    before: img('Bathroom Before .jpg'),
    after: img('Bathroom After .jpg'),
  },
  {
    title: 'Toilet descale',
    category: 'Bathrooms/Toilets',
    before: img('Toilet Before .jpg'),
    after: img('Toilet after .jpg'),
  },
  {
    title: 'Room deep clean',
    category: 'Bedroom',
    before: img('Room before.jpg'),
    after: img('Room After .jpg'),
  },
  {
    title: 'Self-contain room reset',
    category: 'Bedroom',
    before: img('RoomSelf Before .jpg'),
    after: img('RoomSelf After .jpg'),
  },
  {
    title: 'Carpet refresh',
    category: 'Floors',
    before: img('Carpet Before .jpg'),
    after: img('Carpet After .jpg'),
  },
  {
    title: 'Rug revival',
    category: 'Floors',
    before: img('Rug Before .jpg'),
    after: img('Rug After .jpg'),
  },
]
