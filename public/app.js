var button = document.getElementById("btn_scan");
var Bluetooth_Table = document.getElementById("bluetooth_Table");
var sample_output = document.getElementById("para_sample");
var TemperatureLevel = document.getElementById("temperature_level");
var isBluetoothPresent = false;
var isConnected = false;
var bluetoothDeviceServer = null;
var bluetoothDevice;
var connectedDevice_Server;
var infoCharacteristic;
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(function () {
            console.log('SW registered');
        });
}

async function ClickedButton() {

    if (isConnected) {

        Disconnect();
    }
    else {

        // Checking Bluetooth Availability
        navigator.bluetooth.getAvailability().then((available) => {
            if (available) {
                isBluetoothPresent = true;
                console.log("This device supports Bluetooth!");
                Connect_to_Bluetooth();

            } else {
                console.log("Bluetooth is not supported! ");
                Bluetooth_Table.rows.item(1).cells.item(1).innerHTML = "Device does not supports Bluetooth";
                isBluetoothPresent = false
            }
        });

    }


}

async function Connect_to_Bluetooth() {
    // Connecting Bluetooth 
    if (isBluetoothPresent == true) {
        Bluetooth_Table.rows.item(1).cells.item(1).innerHTML = "Connecting";
        try {
            bluetoothDevice = await navigator.bluetooth.requestDevice(
                {
                    filters: [
                        // { services: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"] }
                        { namePrefix: "*" }
                    ],
                    optionalServices: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e']
                }
            )

            Bluetooth_Table.rows.item(0).cells.item(1).innerHTML = bluetoothDevice.name
            console.log('Requesting any Bluetooth Device...');

            bluetoothDevice.addEventListener('gattserverdisconnected', Disconnect);
            connect();

        } catch (error) {
            console.log('Argh! ' + error);
        }

    }
}
function getSupportedProperties(characteristic) {
    let supportedProperties = [];
    for (const p in characteristic.properties) {
        if (characteristic.properties[p] === true) {
            supportedProperties.push(p.toUpperCase());
        }
    }
    return '[' + supportedProperties.join(', ') + ']';
}

async function fetchData() {

    console.log(bluetoothDeviceServer)

    const infoService = await bluetoothDeviceServer.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");

    // // We will get all characteristics from device_information
    const infoCharacteristic = await infoService.getCharacteristic("6e400003-b5a3-f393-e0a9-e50e24dcca9e");
    console.log(infoCharacteristic);
}

async function Disconnect() {

    bluetoothDeviceServer.disconnect();
    console.log("Bluetooth Disconnected");
    isConnected = false;
    Bluetooth_Table.rows.item(0).cells.item(1).innerHTML = "Not Connected";
    Bluetooth_Table.rows.item(1).cells.item(1).innerHTML = "Disconnected";
    button.innerHTML = "Connect Bluetooth Devices";
    try {
        await ClickedButton();
    } catch (error) {
        console.log('Argh! ' + error);
    }

}


async function connect() {

    console.log('Connecting to Bluetooth Device... ');
    connectedDevice_Server = await bluetoothDevice.gatt.connect();
    const infoService = await connectedDevice_Server.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
    const infoCharacteristic = await infoService.getCharacteristic('6e400003-b5a3-f393-e0a9-e50e24dcca9e');
    success();

}

async function success() {

    console.log('> Bluetooth Device connected.');

    bluetoothDeviceServer = connectedDevice_Server;
    isConnected = true;

    console.log(bluetoothDeviceServer);

    Bluetooth_Table.rows.item(1).cells.item(1).innerHTML = "CONNECTED";
    button.innerHTML = "Disconnect"

    console.log('Getting Service...');

    var infoService = await bluetoothDeviceServer.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");

    // // We will get all characteristics from device_information
    infoCharacteristic = await infoService.getCharacteristic("6e400003-b5a3-f393-e0a9-e50e24dcca9e");
    console.log(await infoCharacteristic);
    infoCharacteristic.addEventListener('characteristicvaluechanged', handleLevelChanged);
    document.querySelector('#startNotifications').disabled = false;
    document.querySelector('#stopNotifications').disabled = true;
}
async function onStartNotificationsButtonClick() {
    try {
        console.log('Starting Temperature Level Notifications...');
        await infoCharacteristic.startNotifications();

        console.log('> Notifications started');
        document.querySelector('#startNotifications').disabled = true;
        document.querySelector('#stopNotifications').disabled = false;
    } catch (error) {
        console.log('Argh! ' + error);
    }
}

async function onStopNotificationsButtonClick() {
    try {
        console.log('Stopping Temperature Level Notifications...');
        await infoCharacteristic.stopNotifications();

        console.log('> Notifications stopped');
        document.querySelector('#startNotifications').disabled = false;
        document.querySelector('#stopNotifications').disabled = true;
    } catch (error) {
        console.log('Argh! ' + error);
    }
}

function onResetButtonClick() {
    if (infoCharacteristic) {
        infoCharacteristic.removeEventListener('characteristicvaluechanged',
            handleLevelChanged);
        infoCharacteristic = null;
    }
    // Note that it doesn't disconnect device.
    bluetoothDevice = null;
    console.log('> Bluetooth Device reset');
}
function onDisconnected() {
    onResetButtonClick();
    console.log('> Bluetooth Device disconnected');
    Bluetooth_Table.rows.item(1).cells.item(1).innerHTML = "Disconnected";
    button.innerHTML = "Connect Bluetooth Devices";
    sample_output.innerHTML = "Not Available";
    connect();

}

async function handleLevelChanged(event) {
    console.log('Characteristic Value Changed');
    console.log(event.target.value);
    let value = event.target.value;
    var level = new TextDecoder().decode(value);
    console.log('> Temperature Level is ' + level + " ºC");
    sample_output.innerHTML = level + " ºC";


}


