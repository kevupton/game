(() => {
    const self = this;

    const character = {};
    Object.defineProperties(window, {
        'game': {
            value: proxyObject(character, character)
        },
        'msg': {
            value: msg
        }
    });

    socket.on('character', data => {
        window.character = proxyObject(data, data);
    });

    socket.on('msg', msg => {
        console.info('msg: ' + msg);
    });

    function socketProxy (object) {
        return {
            //get: () => console.log('get'),
            set: (target, key, val) => {
                if (typeof val === 'object') {
                    val = proxyObject(val, object);
                }
                target[key] = val;
                socket.emit('character', object);
            },
            deleteProperty: (target, prop) => {
                delete target[prop];
                socket.emit('character', object);
            }
        }
    }

    function proxyObject (object, parent) {
        Object.keys(object)
            .filter(key => typeof object[key] === 'object')
            .forEach(key => object[key] = proxyObject(object[key], parent));
        return new Proxy(object, socketProxy(parent));
    }

    function msg (msg) {
        socket.emit('msg', msg);
    }
})();