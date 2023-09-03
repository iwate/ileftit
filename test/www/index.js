require([
    '../build/client/crypto'
], function() {
    window.Libs = arguments;
    document.body.insertAdjacentHTML('beforeend', '<h1 id="loaded">Loaded</h1>')
});