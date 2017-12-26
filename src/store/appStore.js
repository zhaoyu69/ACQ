import { observable } from 'mobx';
const io = require('socket.io-client');
const address = document.location.protocol + "//" + document.location.hostname + ":" + document.location.port;

const socket = io.connect(address,{
    forceNew: true,
    reconnection: true,
    reconnectionDelay: 1000
});

class appStore {
    @observable socket = socket;
    @observable fetchAddr = address;
}

export default appStore;