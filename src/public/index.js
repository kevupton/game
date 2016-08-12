(() => {
    const self = this;


    console.log(window);

    window.__defineGetter__('test', () => console.log('test'));


    var proxy = {
        get: () => console.log('getting')
    }

})();