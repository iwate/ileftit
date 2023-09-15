const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
});

module.exports = withPWA({
    output:"standalone",
    trailingSlash: true,
    i18n: {
        locales: ['en', 'ja'],
        defaultLocale: 'en',
    },
});