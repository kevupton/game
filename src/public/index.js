(() => {
    const self = this;
    let game;
    const sync = (object, parent) => {
        Sync.prototype = proxyObject(object, parent);
        return new Sync();
        function Sync () {}
    };

    Object.defineProperties(window, {
        'game': {
            get: () => game
        },
        'msg': {
            value: msg
        },
        'run': {
            value: run
        }
    });

    socket.on('character', data => {
        game = sync(data, data);
    });

    socket.on('msg', msg => {
        console.info('msg: ' + msg);
    });

    socket.on('run', str => {
        eval(str);
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
                return true;
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

    function run (str) {
        socket.emit('run', str);
    }
})();