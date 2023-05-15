var button = document.getElementById("btn_scan");
var Bluetooth_Table = document.getElementById("bluetooth_Table");
var isBluetoothPresent = false;
var isConnected = false;
var bluetoothDevice = null;

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
            filters: [{
                namePrefix: "DM"
            }]
        })
            .then(async (device) => {
                Bluetooth_Table.rows.item(0).cells.item(1).innerHTML = device.name
                const connectedDevice = await device.gatt.connect();
                bluetoothDevice = connectedDevice;
                isConnected = true;
                console.log(bluetoothDevice);
                Bluetooth_Table.rows.item(1).cells.item(1).innerHTML = "CONNECTED";
                button.innerHTML = "Disconnect"
                fetchData();
            })
            .catch(error => { console.log(error); });
    }
}

function fetchData() {
    // bluetoothDevice.
}

async function Disconnect() {

    bluetoothDevice.disconnect();
    console.log("Bluetooth Disconnected");
    isConnected = false;
    Bluetooth_Table.rows.item(0).cells.item(1).innerHTML = "Not Connected";
    Bluetooth_Table.rows.item(1).cells.item(1).innerHTML = "Disconnected";
    button.innerHTML = "Connect Bluetooth Devices";
    console.log(bluetoothDevice);

}
