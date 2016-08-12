(() => {
    const self = this;


    console.log(window);

    window.__defineGetter__('test', () => console.log('test'));


})();