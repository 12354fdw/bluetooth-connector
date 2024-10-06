// HTML stuff
var bConnect = document.getElementById("connect")

var dName = document.getElementById("dName")
var dAddress = document.getElementById("dAddress")
var dConnect = document.getElementById("dConnect")
var dRSSI = document.getElementById("dRSSI")
var dMan = document.getElementById("dMan")

var pStatus = document.getElementById("status")
//varibles
const decoder = new TextDecoder('utf-8');

var device,server

async function getChara(serviceUUID,charaUUID) {
    let service = await server.getPrimaryService(serviceUUID);
    return service.getCharacteristic(charaUUID)
}

function renderStat() {
    if (server) {
        dName.textContent = "Name: "+device.name
        dAddress.textContent = "Address: "+device.id
        dConnect.textContent = "Connected: "+server.connected
    }
}

function rssiword(rssi) {
    if (rssi >= -50) {
        return "Excellent";
    } else if (rssi >= -60) {
        return "Very Good";
    } else if (rssi >= -70) {
        return "Good";
    } else if (rssi >= -80) {
        return "Fair";
    } else if (rssi >= -90) {
        return "Weak";
    } else {
        return "Very Weak";
    }
}


bConnect.addEventListener("click",async()=>{
    console.log("START CONNECTION")
    device=await navigator.bluetooth.requestDevice({acceptAllDevices:true})
    console.log("GOT PERMISSION, STARTING GATT",server)

    pStatus.textContent = "Status: Connecting"
    server = await device.gatt.connect()
    pStatus.textContent = "Status: Connected"

    device.watchAdvertisements()
    device.onadvertisementreceived = (event) => {
        dRSSI.textContent = "Latest Signal Strength: "+event.rssi+" ("+rssiword(event.rssi)+")"
        let manu = ""
        for (let [i,v] of event.manufacturerData) {
            manu = manu+decoder.decode(v)+", "
        }
        dMan.textContent = "Manufactoring data: "+manu
    }
    device.ongattserverdisconnected = async() => {
        renderStat()
        pStatus.textContent = "Status: Reconnecting!"
        await device.gatt.connect()
        pStatus.textContent = "Status: Connected"
    }
})

setInterval(()=>{
    renderStat()
},1000)