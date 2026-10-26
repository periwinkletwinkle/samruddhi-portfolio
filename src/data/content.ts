import { asset } from '@/lib/asset'

export type Artwork = {
  src: string
  alt: string
}

export const site = {
  name: 'Samruddhi Dhumal',
  role: 'Illustrator',
  email: 'samuxox2533@gmail.com',
  copyright: '© 2025 by Samruddhi Dhumal.',
  socials: [
    { label: 'ArtStation', href: 'https://samuxox2533.artstation.com/' },
    { label: 'Instagram', href: 'https://www.instagram.com/spicytofu108/' },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/samruddhi-dhumal-24483b315/',
    },
  ],
}

export const homeStacked: Artwork[] = [
  {
    src: asset('images/home/01-character.jpg'),
    alt: 'Painted character in an olive and red draped costume, holding a dagger',
  },
  {
    src: asset('images/home/02-costume-sheet.jpg'),
    alt: 'Costume detail sheet: headdress pin, fabric pattern, and dagger',
  },
  {
    src: asset('images/home/03-colorways.jpg'),
    alt: 'Three colorways of the same character design in red, ivory, and green',
  },
  {
    src: asset('images/home/04-colorways.jpg'),
    alt: 'Three colorways of the same character design in blue, orange, and purple',
  },
  {
    src: asset('images/home/05-silhouettes.jpg'),
    alt: 'Fourteen numbered silhouette studies of costume variations',
  },
]

export const homeRow: Artwork[] = [
  {
    src: asset('images/home/06-armor-study.jpg'),
    alt: 'Color and line study of a character in blue and gold armor',
  },
  {
    src: asset('images/home/07-expressions.png'),
    alt: 'Expression sheet of a horned character with white braids',
  },
  {
    src: asset('images/home/08-portrait.png'),
    alt: 'Portrait of a character with pale blue hair and gold jewelry',
  },
]

export const about = {
  portrait: asset('images/about/portrait.png'),
  portraitAlt: 'Illustration of a character in a strawberry hat holding a teacup',
  story: [
    "Hey there! I'm Samruddhi, a passionate and aspiring character design artist and Illustrator from Mumbai, India! Art has been a part of my life since childhood, evolving from simple sketches to fully realized character concepts. I love watching movies, anime and playing videogames!",
    'My projects so far have been personal as well as commessioned. I strive to create characters that feel immersive, where i blend creativity with thoughtful design to bring the unique personalities to life.',
  ],
}
