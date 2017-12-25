const dgram = require('dgram');
const serverSocket = dgram.createSocket('udp4');

serverSocket.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    serverSocket.close();
});

serverSocket.on('message', (msg, rinfo) => {
    console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
});

serverSocket.on('listening', () => {
    const address = serverSocket.address();
    console.log(`server listening ${address.address}:${address.port}`);
});

serverSocket.bind(41234);