let chartsWrapper = document.getElementsByClassName('chartsWrapper');

let showChartsBtn = document.getElementById('showChartBtn');
showChartsBtn.addEventListener('click', function () {
    chartsWrapper[0].classList.remove('noDisplay');
    let inaccuracyCanvas = document.getElementById('correctnessCanvasG');
    let distortionCanvas = document.getElementById('distortionCanvasG');

    let newCanvas = document.createElement('canvas');
    newCanvas.width = width;
    newCanvas.height = height;
    let context = newCanvas.getContext('2d');
    context.drawImage(image, 0, 0);

    let calcButton = document.getElementsByClassName('calcButton');
    calcButton[0].addEventListener('click', function () {
        let dependencies = calcDependencies(context);

        let chartInaccuracy = new Chart(inaccuracyCanvas, {
            type: 'line',
            data: {
                labels: Array.from(dependencies.inaccuracy, i => i[0]),
                datasets: [{
                    label: "Inaccuracy of decoded message",
                    data: Array.from(dependencies.inaccuracy, i => i[1]),
                    lineTension: 0,
                    fill: false,
                    borderColor: 'red',
                    backgroundColor: 'transparent',
                    // borderDash: [5, 5],
                    pointBorderColor: 'darkred',
                    pointBackgroundColor: 'rgb(114,20,20)',
                    pointRadius: 5,
                    pointHoverRadius: 10,
                    pointHitRadius: 30,
                    pointBorderWidth: 2,
                    pointStyle: 'rectRounded'
                }]
            }
        })

        let chartDistortion = new Chart(distortionCanvas, {
            type: 'line',
            data: {
                labels: Array.from(dependencies.distortion, i => i[0]),
                datasets: [{
                    label: "Distortion of encoded image",
                    data: Array.from(dependencies.distortion, i => i[1]),
                    lineTension: 0,
                    fill: false,
                    borderColor: 'blue',
                    backgroundColor: 'transparent',
                    // borderDash: [5, 5],
                    pointBorderColor: 'darkblue',
                    pointBackgroundColor: 'rgb(16,38,96)',
                    pointRadius: 3,
                    pointHoverRadius: 6,
                    pointHitRadius: 30,
                    pointBorderWidth: 2,
                    pointStyle: 'rectRounded'
                }]
            }
        });
    });
});

let closeButton = document.getElementsByClassName('closeButton');
closeButton[0].addEventListener('click', function () {
    chartsWrapper[0].classList.add('noDisplay');
})

function calcDependencies(ctx) {
    let bits = [], distortion = [];
    for (let g = 1; g <= 45; g += 5) {
        let input = readyTexts[1];
        input = convertTextToBinary(input);
        let inputCopy = input.slice();
        let transInput = split10blockMessage(input);
        let sum1 = sum(transInput, g, arrayFunction1);
        let imageData = ctx.getImageData(0, 0, width, height);
        let redChannel = getRedChannel(imageData.data);
        let arrayString = [];
        for (let i = 0; i < height; i++) {
            let a = [];
            for (let j = 0; j < ansamblWidth; j++) {
                a.push(redChannel[i * ansamblWidth + j]);
            }
            arrayString.push(a);
        }
        let dist = 0;
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                if (i < sum1.length) {
                    let newRed = arrayString[i][j] + sum1[i][j];
                    dist += Math.abs(arrayString[i][j] - newRed);
                    if (newRed > 255) newRed = 255;
                    if (newRed < 0) newRed = 0;
                    arrayString[i][j] = newRed;
                }
            }
        }
        let newRedChannel = arrayString.flat();
        for (let i = 0, index = 0; i < imageData.data.length; i += 4) {
            imageData.data[i] = newRedChannel[index]; // red
            index++;
        }
        ctx.putImageData(imageData, 0, 0);

        /** Calculating distortion rate **/
        let decodeImageData = ctx.getImageData(0, 0, width, height);
        console.log('imageData for decoding: ', decodeImageData.data)
        let decodeRedChannel = getRedChannel(decodeImageData.data);
        let decodeArrayString = [];
        for (let i = 0; i < height; i++) {
            let a = [];
            for (let j = 0; j < ansamblWidth; j++) {
                a.push(decodeRedChannel[i * ansamblWidth + j]);
            }
            decodeArrayString.push(a);
        }
        let md1 = [];
        for (let i = 0; i < height; i++) {
            let a = 0;
            for (let j = 0; j < ansamblHeight; j++) {
                if (multString(decodeArrayString[i], arrayFunction1[j]) > a) {
                    a = multString(decodeArrayString[i], arrayFunction1[j]);
                    // console.log(i, multString(arrayString[i], arrayFunction1[j]));
                    md1[i] = j;
                }
            }
        }
        let messBinary = [];
        for (let i = 0; i < md1.length; i++) {
            let a = md1[i];
            for (let j = 0; j < 10; j++) {
                messBinary[i * 10 + j] = Math.trunc(a % 2);
                a /= 2;
            }
        }
        let output = messBinary.join('');

        /**Calculating mistake rate**/
        let count = 0;
        for (let i = 0; i < inputCopy.length; i++) {
            if (inputCopy[i] !== output[i]) {
                // console.log(inputCopy[i], output[i]);
                count++;
            }
        }
        console.log(count);
        bits.push([g, Number((count / inputCopy.length).toFixed(3))]);
        distortion.push([g, ((dist * 100) / (sum1.length * sum1[0].length * 256))]);
        console.table(bits)
        console.table(distortion)
    }
    return {
        inaccuracy: bits,
        distortion: distortion
    };
}
