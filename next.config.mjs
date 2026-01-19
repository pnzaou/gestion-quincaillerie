/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration des images pour Cloudinary
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
    // Optionnel : formats d'images optimisés
    formats: ['image/avif', 'image/webp'],
  },

  // Important pour Mongoose et autres packages externes
  serverExternalPackages: ['mongoose', 'bcryptjs'],

  // Optimisations pour la production
  compress: true,
  
  // Configuration des headers de sécurité
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
      // Headers spécifiques pour les API routes (cron jobs)
      {
        source: '/api/cron/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },

  // Variables d'environnement publiques (si nécessaire)
  env: {
    NEXT_PUBLIC_APP_NAME: 'StockProx',
  },

  // Logging en production
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;