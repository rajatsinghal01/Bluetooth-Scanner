var button = document.getElementById("btn_scan");
var TableHeader = document.getElementById("Connect_Stat");

function ClickedButton() {
    document.getElementById("para_sample").innerHTML = "Hi You Clicked the button";
    console.log(TableHeader + " " + button);
}