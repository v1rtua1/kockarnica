import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Casino Royale',
        short_name: 'Casino Royale',
        description: 'Experience the thrill of premium online gaming',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#D4AF37',
        icons: [
            {
                src: '/icon.svg',
                sizes: 'any',
                type: 'image/svg+xml',
            },
        ],
    }
}
