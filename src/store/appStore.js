import { observable, action } from 'mobx';
const io = require('socket.io-client');
const socket = io.connect('http://localhost:8080',{'forceNew':true});

class appStore {
    @observable socket = socket;
}

export default appStore;