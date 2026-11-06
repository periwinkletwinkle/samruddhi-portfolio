import galleryData from '@/data/gallery.json'
import { asset } from '@/lib/asset'

export type Artwork = {
  src: string
  alt: string
  width: number
  height: number
}

export type GalleryItem = {
  file: string
  alt: string
  width: number
  height: number
}

export type GalleryFile = {
  stacked: GalleryItem[]
  row: GalleryItem[]
}

const gallery = galleryData as GalleryFile

function toArtwork(item: GalleryItem): Artwork {
  return {
    src: asset(`images/home/${item.file}`),
    alt: item.alt,
    width: item.width,
    height: item.height,
  }
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

export const homeStacked: Artwork[] = gallery.stacked.map(toArtwork)

export const homeRow: Artwork[] = gallery.row.map(toArtwork)

export const about = {
  portrait: asset('images/about/portrait.jpg'),
  portraitWidth: 1600,
  portraitHeight: 1474,
  portraitAlt: 'Illustration of a character in a strawberry hat holding a teacup',
  story: [
    "Hey there! I'm Samruddhi, a passionate and aspiring character design artist and Illustrator from Mumbai, India! Art has been a part of my life since childhood, evolving from simple sketches to fully realized character concepts. I love watching movies, anime and playing videogames!",
    'My projects so far have been personal as well as commessioned. I strive to create characters that feel immersive, where i blend creativity with thoughtful design to bring the unique personalities to life.',
  ],
}
