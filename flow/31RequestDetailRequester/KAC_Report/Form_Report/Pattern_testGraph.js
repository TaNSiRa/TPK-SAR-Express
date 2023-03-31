var chart_data = {
    labels: ['Player1', 'Player2', 'Player3', 'Player4'],
    datasets: [
        {
            fillColor: "rgba(6, 118, 152, 0.71)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data: [20,34,15,64,]
        }
    ]    
}

//original canvas
var canvas = document.querySelector('#cool-canvas');
var context = canvas.getContext('2d');

new Chart(context).Line(chart_data);

//hidden canvas
var newCanvas = document.querySelector('#supercool-canvas');
newContext = newCanvas.getContext('2d');

var supercoolcanvas = new Chart(newContext).Line(chart_data);
supercoolcanvas.defaults.global = {
scaleFontSize: 600
}

//add event listener to button
document.getElementById('download-pdf').addEventListener("click", downloadPDF);

//donwload pdf from original canvas
function downloadPDF() {
var canvas = document.querySelector('#cool-canvas');
//creates image
var canvasImg = canvas.toDataURL("image/jpeg", 1.0);

//creates PDF from img
var doc = new jsPDF('landscape');
doc.setFontSize(20);
doc.text(15, 15, "Cool Chart");
doc.addImage(canvasImg, 'JPEG', 10, 10, 280, 150 );
doc.save('canvas.pdf');
}

//add event listener to 2nd button
document.getElementById('download-pdf2').addEventListener("click", downloadPDF2);

//download pdf form hidden canvas
function downloadPDF2() {
var newCanvas = document.querySelector('#supercool-canvas');

//create image from dummy canvas
var newCanvasImg = newCanvas.toDataURL("image/jpeg", 1.0);

 //creates PDF from img
var doc = new jsPDF('landscape');
doc.setFontSize(20);
doc.text(15, 15, "Super Cool Chart");
doc.addImage(newCanvasImg, 'JPEG', 10, 10, 280, 150 );
doc.save('new-canvas.pdf');
}