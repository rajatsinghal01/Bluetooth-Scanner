var button = document.getElementById("btn_scan");
var Bluetooth_Table = document.getElementById("bluetooth_Table");
var sample_output = document.getElementById("para_sample");
var isBluetoothPresent = false;
var isConnected = false;
var bluetoothDeviceServer = null;

function ClickedButton() {

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

function Connect_to_Bluetooth() {
    // Connecting Bluetooth 
    if (isBluetoothPresent == true) {

        Bluetooth_Table.rows.item(1).cells.item(1).innerHTML = "Connecting";
        const Device = navigator.bluetooth.requestDevice({
            optionalServices: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"],
            filters: [{
                namePrefix: "DM"
            }]
        })
            .then(async (device) => {
                Bluetooth_Table.rows.item(0).cells.item(1).innerHTML = device.name
                const connectedDevice_Server = await device.gatt.connect();
                bluetoothDeviceServer = await connectedDevice_Server;
                isConnected = true;
                console.log(bluetoothDeviceServer);
                Bluetooth_Table.rows.item(1).cells.item(1).innerHTML = "CONNECTED";
                button.innerHTML = "Disconnect"
                fetchData();
            })
            .catch(error => { console.log(error); });
    }
}

async function fetchData() {

    // Fetching Data from Bluetooth Device Connected
    const infoService = await bluetoothDeviceServer.getPrimaryService("device_information");
    // Getting device information

    // We will get all characteristics from device_information
    const infoCharacteristics = await infoService.getCharacteristics();
    console.log(infoCharacteristics);

    let infoValues = [];

    const promise = new Promise((resolve, reject) => {
        infoCharacteristics.forEach(async (characteristic, index, array) => {

            // Returns a buffer
            const value = await characteristic.readValue();
            console.log(new TextDecoder().decode(value));

            // Convert the buffer to string
            infoValues.push(new TextDecoder().decode(value));
            if (index === array.length - 1) resolve();

        });
    });
    promise.then(() => {
        // Display all the information on the screen
        // use innerHTML
        sample_output.innerHTML = `
          Device Information:
          <ul>
            ${infoValues.map((value) => `<li>${value}</li>`).join("")}
          </ul> 
        `;
    });

}

async function Disconnect() {

    bluetoothDeviceServer.disconnect();
    console.log("Bluetooth Disconnected");
    isConnected = false;
    Bluetooth_Table.rows.item(0).cells.item(1).innerHTML = "Not Connected";
    Bluetooth_Table.rows.item(1).cells.item(1).innerHTML = "Disconnected";
    button.innerHTML = "Connect Bluetooth Devices";
    console.log(bluetoothDeviceServer);

}
