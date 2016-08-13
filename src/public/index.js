(() => {
    const self = this;
    let game;
    const sync = (object, parent) => {
        Sync.prototype = new Proxy(object, socketProxy(parent));
        return new Sync();
        function Sync () {}
    };

    Object.defineProperties(window, {
        'game': {
            get: () => game
        },
        'msg': {
            value: msg
        }
    });

    socket.on('character', data => {
        game = sync(data, data);
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
        return sync(object, parent);
    }

    function msg (msg) {
        socket.emit('msg', msg);
    }
})();