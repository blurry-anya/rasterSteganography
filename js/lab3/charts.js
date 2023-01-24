let chartsWrapper = document.getElementsByClassName('chartsWrapper');
let hadamard = generateHadamardMatrix(parseInt(log2(Math.min(height, width)).toString()))
let showChartsBtn = document.getElementById('showChartBtn');
showChartsBtn.addEventListener('click', function () {
    chartsWrapper[0].classList.remove('noDisplay');
    let inaccuracyCanvasForG = document.getElementById('correctnessCanvasG');
    let distortionCanvasForG = document.getElementById('distortionCanvasG');
    let inaccuracyCanvasForK = document.getElementById('correctnessCanvasK');
    let distortionCanvasForK = document.getElementById('distortionCanvasK');

    
    let newCanvas = document.createElement('canvas');
    newCanvas.width = width;
    newCanvas.height = height;
    let context = newCanvas.getContext('2d');
    context.drawImage(image, 0, 0);

    let calcButton = document.getElementsByClassName('calcButton');
    calcButton[0].addEventListener('click', function () {
        let calcResultsFixedG = calcDependenciesFixedG(context);
        let calcResultsFixedK = calcDependenciesFixedK(context);

        let chartInaccuracy = new Chart(inaccuracyCanvasForG, {
            type: 'line',
            data: {
                labels: Array.from(calcResultsFixedG.inaccuracy, i => i[0]),
                datasets: [{
                    label: "Inaccuracy of decoded message(fixed g=1)",
                    data: Array.from(calcResultsFixedG.inaccuracy, i => i[1]),
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

        let chartDistortionG = new Chart(distortionCanvasForG, {
            type: 'line',
            data: {
                labels: Array.from(calcResultsFixedG.distortion, i => i[0]),
                datasets: [{
                    label: "Distortion of encoded image(fixed g=1)",
                    data: Array.from(calcResultsFixedG.distortion, i => i[1]),
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
        let chartInaccuracyK = new Chart(inaccuracyCanvasForK, {
            type: 'line',
            data: {
                labels: Array.from(calcResultsFixedK.inaccuracy, i => i[0]),
                datasets: [{
                    label: "Inaccuracy of decoded message(fixed k=4)",
                    data: Array.from(calcResultsFixedK.inaccuracy, i => i[1]),
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

        let chartDistortionK = new Chart(distortionCanvasForK, {
            type: 'line',
            data: {
                labels: Array.from(calcResultsFixedK.distortion, i => i[0]),
                datasets: [{
                    label: "Distortion of encoded image(fixed k=4)",
                    data: Array.from(calcResultsFixedK.distortion, i => i[1]),
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

function calcDependenciesFixedG(ctx) {
    let bits = [], distortion = [];
    for (let k = 1, g = 1; k <= hadamard.length; k += 8) {
        let inputText = convertTextToBinary(readyTexts[1]);
        let inputCopy = inputText.slice();
        let imageData = ctx.getImageData(0, 0, width, height);
        let imagePixels = dividePixels(imageData.data);

        inputText = transformToSignal(inputText)
        let tmp = sum(inputText, k, hadamard, g);
        imagePixels = dividePixels(imageData.data);
        let dist = 0;
        for (let i = 0; i < hadamard.length; i++) {
            for (let j = 0; j < hadamard.length; j++) {
                let color = getRGB(imagePixels, i * hadamard.length + j);
                let newRed = color[0] + tmp[i][j];
                if (newRed > 255) newRed = 255;
                if (newRed < 0) newRed = 0;
                dist += Math.abs(color[0] - newRed);
                imagePixels = setRGB(imagePixels, i * hadamard.length + j, newRed, color[1], color[2]);
            }
        }
        imagePixels = mergePixels(imagePixels);
        for (let i = 0; i < imageData.data.length; i++) {
            imageData.data[i] = imagePixels[i];
        }
        // console.log('imageData after change', imageData.data)

        let decodeImageDataArr = dividePixels(imageData.data);

        let arrayString = []; //array of divided RED colors
        for (let i = 0; i < hadamard.length; i++) {
            let arrRed = [];//array of RED
            for (let j = 0; j < hadamard.length; j++) {
                arrRed.push(getRGB(decodeImageDataArr, i * hadamard.length + j)[0]);
            }
            arrayString.push(arrRed);
        }
        console.log(arrayString)
        let outputSignal = [];
        for (let i = 0; i < hadamard.length; i++) {
            for (let j = 0; j < k; j++) {
                outputSignal.push(multString(arrayString[i], hadamard[j + 1]) > 0 ? '1' : '0');
            }
        }

        let mess = outputSignal.concat().join('');
        let count = 0;
        for (let i = 0; i < mess.length; i++) {
            if (inputCopy[i] !== mess[i]) {
                count++;
            }
        }
        if (mess.length > inputCopy.length) {
            let messChunk = [];
            count = 0;
            arrayCopy(mess, 0, messChunk, 0, inputCopy.length)
            for (let i = 0; i < mess.length; i++) {
                if (inputCopy[i] !== messChunk[i]) {
                    count++;
                }
            }
        }
        console.log(count)
        bits.push([k, Number((count / mess.length).toFixed(3))]);
        distortion.push([k, ((dist * 100) / (hadamard.length * hadamard.length * 256))]);
    }
    return {
        inaccuracy : bits,
        distortion : distortion
    };
}

function calcDependenciesFixedK(ctx) {
    let bits = [], distortion = [];
    for (let g = 1, k = 4; g <= 8; g += 2) {
        let inputText = convertTextToBinary(readyTexts[1]);
        let inputCopy = inputText.slice();
        let imageData = ctx.getImageData(0, 0, width, height);
        let imagePixels = dividePixels(imageData.data);

        inputText = transformToSignal(inputText)
        let tmp = sum(inputText, k, hadamard, g);
        imagePixels = dividePixels(imageData.data);
        let dist = 0;
        for (let i = 0; i < hadamard.length; i++) {
            for (let j = 0; j < hadamard.length; j++) {
                let color = getRGB(imagePixels, i * hadamard.length + j);
                let newRed = color[0] + tmp[i][j];
                if (newRed > 255) newRed = 255;
                if (newRed < 0) newRed = 0;
                dist += Math.abs(color[0] - newRed);
                imagePixels = setRGB(imagePixels, i * hadamard.length + j, newRed, color[1], color[2]);
            }
        }
        imagePixels = mergePixels(imagePixels);
        for (let i = 0; i < imageData.data.length; i++) {
            imageData.data[i] = imagePixels[i];
        }
        // console.log('imageData after change', imageData.data)

        let decodeImageDataArr = dividePixels(imageData.data);

        let arrayString = []; //array of divided RED colors
        for (let i = 0; i < hadamard.length; i++) {
            let arrRed = [];//array of RED
            for (let j = 0; j < hadamard.length; j++) {
                arrRed.push(getRGB(decodeImageDataArr, i * hadamard.length + j)[0]);
            }
            arrayString.push(arrRed);
        }
        console.log(arrayString)
        let outputSignal = [];
        for (let i = 0; i < hadamard.length; i++) {
            for (let j = 0; j < k; j++) {
                outputSignal.push(multString(arrayString[i], hadamard[j + 1]) > 0 ? '1' : '0');
            }
        }

        let mess = outputSignal.concat().join('');
        let count = 0;
        for (let i = 0; i < mess.length; i++) {
            if (inputCopy[i] !== mess[i]) {
                count++;
            }
        }
        if (mess.length > inputCopy.length) {
            let messChunk = [];
            count = 0;
            arrayCopy(mess, 0, messChunk, 0, inputCopy.length)
            for (let i = 0; i < mess.length; i++) {
                if (inputCopy[i] !== messChunk[i]) {
                    count++;
                }
            }
        }
        console.log(count)
        bits.push([g, Number((count / mess.length).toFixed(3))]);
        distortion.push([g, ((dist * 100) / (hadamard.length * hadamard.length * 256))]);
    }
    return {
        inaccuracy : bits,
        distortion : distortion
    };
}
