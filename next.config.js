const withPWA = require('next-pwa')({
    dest: 'public'
});

module.exports = withPWA({
    trailingSlash: true,
    i18n: {
        locales: ['en', 'ja'],
        defaultLocale: 'en',
    },
});