const os=require('os'),
    iptable={},
    ifaces=os.networkInterfaces();
for (let dev in ifaces) {
    ifaces[dev].forEach(function(details,alias){
        if (details.family==='IPv4') {
            iptable[dev+(alias?':'+alias:'')]=details.address;
        }
    });
}

console.log(iptable.WLAN);