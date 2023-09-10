const withPWA = require('next-pwa')({
    dest: 'public'
});

module.exports = withPWA({
    output:"standalone",
    trailingSlash: true,
    i18n: {
        locales: ['en', 'ja'],
        defaultLocale: 'en',
    },
});