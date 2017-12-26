import { observable } from 'mobx';
const io = require('socket.io-client');
const socket = io.connect('http://47.97.114.102:8080',{
    forceNew: true,
    reconnection: true,
    reconnectionDelay: 1000
});

class appStore {
    @observable socket = socket;
}

export default appStore;