let chartsWrapper = document.getElementsByClassName('chartsWrapper');

let showChartsBtn = document.getElementById('showChartBtn');
showChartsBtn.addEventListener('click', function () {
    chartsWrapper[0].classList.remove('noDisplay');
    let correctnessCanvas = document.getElementById('correctnessCanvas');
    let distortionCanvas = document.getElementById('distortionCanvas');
    let corrDistCanvas = document.getElementById('corrDistCanvas')

    let newCanvas = document.createElement('canvas');
    newCanvas.width = width;
    newCanvas.height = height;
    let context = newCanvas.getContext('2d');
    context.drawImage(image, 0, 0);

    let calcButton = document.getElementsByClassName('calcButton');
    calcButton[0].addEventListener('click', function () {
        let correctness = calcCorrectness(context);
        let distortion = calcDistortion(context);
        let chartCorrectness = new Chart(correctnessCanvas, {
            type: 'line',
            data: {
                labels: Array.from(correctness, i => i[0]),
                datasets: [{
                    label: "Correctness of encoded message",
                    data: Array.from(correctness, i => i[1]),
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
                labels: Array.from(distortion, i => i[0]),
                datasets: [{
                    label: "Distortion of encoded message",
                    data: Array.from(distortion, i => i[1]),
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
        let chartCorrAndDist = new Chart(corrDistCanvas, {
            type: 'line',
                data: {
                labels: Array.from(correctness, i => i[1]),
                    datasets: [{
                    label: "Relation of correctness to distortion",
                    data: Array.from(distortion, i => i[1]),
                    lineTension: 0,
                    fill: false,
                    borderColor: 'green',
                    backgroundColor: 'transparent',
                    // borderDash: [5, 5],
                    pointBorderColor: 'darkgreen',
                    pointBackgroundColor: 'rgb(18,78,13)',
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

function calcCorrectness(ctx) {
    let bits = [];
    for (let lambda = 0.01; lambda <= 0.5; lambda += 0.05) {
        lambda = Number(lambda.toFixed(2));
        console.log('LAMBDA', lambda);
        let inputText = convertTextToBinary(readyTexts[0]);
        console.log('inputText length: ', inputText.length);
        let inputArr = [];
        for (let i = 0; i < inputText.length; i++) {
            inputArr.push(parseInt(inputText[i]));
        }
        let imageData = ctx.getImageData(0, 0, width, height);
        let imagePixels = dividePixels(imageData.data);
        let changed = putBits(inputArr, imagePixels, lambda);
        changed = mergePixels(changed);
        for (let i = 0; i < imageData.data.length; i++) {
            imageData.data[i] = changed[i];
        }
        ctx.putImageData(imageData, 0, 0);
        let decodeImageData = ctx.getImageData(0, 0, width, height);
        let decodeImageDataArr = dividePixels(decodeImageData.data);
        let decodedMessage = getPixels(decodeImageDataArr);
        console.log('decodedMEssage length: ', decodedMessage.length);
        decodedMessage = convertBinaryToText(decodedMessage);
        let count = 0;
        // for (let i = 0; i < inputArr.length; i++) {
        //     if (inputText[i] === decodedMessage[i]) {
        //         count++;
        //     }
        // }
        for (let i = 0; i < readyTexts[0].length; i++) {
            if (readyTexts[0][i] === decodedMessage[i]) {
                count++;
            }
        }
        console.log(count)
        bits.push([lambda, Number((count / readyTexts[0].length).toFixed(3))]);
    }
    console.log('BITS: ', bits);
    return bits;
}

let calcDistortion = function (ctx) {
    let distortion = [];
    for (let lambda = 0.01; lambda <= 0.5; lambda += 0.05) {
        lambda = Number(lambda.toFixed(2));
        let inputText = convertTextToBinary(readyTexts[0]);
        let inputArr = [];
        for (let i = 0; i < inputText.length; i++) {
            inputArr.push(parseInt(inputText[i]));
        }
        let imageData = ctx.getImageData(0, 0, width, height);
        let imagePixels = dividePixels(imageData.data);
        let changed = putBits(inputArr, imagePixels, lambda);

        let originalImage = dividePixels(imageData.data)
        let dist = 0.0, amount = 0;
        for (let j = sigma; j < height - sigma; j++) {
            for (let i = j; i < width - sigma; i += sigma) {
                if (amount === inputText.length) {
                    break;
                }
                dist += Math.abs(changed[j * width + i][2] - originalImage[j * width + i][2]);
                amount++;
            }
            if (amount === inputText.length) {
                break;
            }
        }
        distortion.push([lambda, ((dist * 100) / (inputText.length * 256))]);

    }
    console.log('DISTORTION: ', distortion);
    return distortion;
}
