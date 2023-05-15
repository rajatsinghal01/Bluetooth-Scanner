var button = document.getElementById("btn_scan");
var Bluetooth_Table = document.getElementById("bluetooth_Table");

function ClickedButton() {
    document.getElementById("para_sample").innerHTML = "Hi You Clicked the button";
    Bluetooth_Table.rows.item(1).cells.item(1).innerHTML = "Connecting";
}