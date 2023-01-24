let chartsWrapper = document.getElementsByClassName('chartsWrapper');

let showChartsBtn = document.getElementById('showChartBtn');
showChartsBtn.addEventListener('click', function () {
    chartsWrapper[0].classList.remove('noDisplay');
    let correctnessCanvas = document.getElementById('correctnessCanvas');
    let distortionCanvas = document.getElementById('distortionCanvas');
    // let correctnessCanvas2 = document.getElementById('correctnessCanvas2');
    // let distortionCanvas2 = document.getElementById('distortionCanvas2');

    let newCanvas = document.createElement('canvas');
    newCanvas.width = width;
    newCanvas.height = height;
    let context = newCanvas.getContext('2d');
    context.drawImage(image, 0, 0);

    let calcButton = document.getElementsByClassName('calcButton');
    calcButton[0].addEventListener('click', function () {
        let correctness = calcCorrectness(context, false);
        let hammingCorrectness = calcCorrectness(context, true)
        let distortion = calcDistortion(context, false);
        let hammingDistortion = calcDistortion(context, true);
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
                }, {
                    label: "Correctness while using Hamming's Code",
                    data: Array.from(hammingCorrectness, i => i[1]),
                    lineTension: 0,
                    fill: false,
                    borderColor: 'blue',
                    backgroundColor: 'transparent',
                    // borderDash: [5, 5],
                    pointBorderColor: 'darkblue',
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
                    borderColor: 'red',
                    backgroundColor: 'transparent',
                    // borderDash: [5, 5],
                    pointBorderColor: 'darkred',
                    pointBackgroundColor: 'rgb(16,38,96)',
                    pointRadius: 3,
                    pointHoverRadius: 6,
                    pointHitRadius: 30,
                    pointBorderWidth: 2,
                    pointStyle: 'rectRounded'
                },{
                    label: "Distortion while using Hamming's code",
                    data: Array.from(hammingDistortion, i => i[1]),
                    lineTension: 0,
                    fill: false,
                    borderColor: 'blue',
                    backgroundColor: 'transparent',
                    borderDash: [5, 5],
                    pointBorderColor: 'darkblue',
                    pointBackgroundColor: 'rgb(16,38,96)',
                    pointRadius: 3,
                    pointHoverRadius: 6,
                    pointHitRadius: 30,
                    pointBorderWidth: 2,
                    pointStyle: 'rectRounded'
                }]
            }
        })

    });

    let switchButton = document.getElementsByClassName('switchButton');
    switchButton[0].addEventListener('click', function () {
        let nextCharts = document.getElementsByClassName('chartsContent2');
        nextCharts[0].classList.toggle('noDisplay');
    });

});

let closeButton = document.getElementsByClassName('closeButton');
closeButton[0].addEventListener('click', function () {
    chartsWrapper[0].classList.add('noDisplay');
})

function calcCorrectness(ctx, useHammingCode) {
    let bits = [], hammingBits = [];
    if (useHammingCode === true) {
        for (let lambda = 0.01; lambda <= 0.5; lambda += 0.05) {
            lambda = Number(lambda.toFixed(2));
            console.log('LAMBDA', lambda);
            let inputText = convertTextToBinary(readyTexts[0]);
            let originText = inputText.slice();
            console.log('inputText length: ', inputText.length);
            inputText = inputText.match(/.{1,4}/g).toString().replace(/,/g, ' ').split(' ');

            let inputWithHamming = [];
            for (let i = 0; i < inputText.length; i++) {
                inputWithHamming.push(hammingEncode(inputText[i]));
            }
            inputWithHamming = inputWithHamming.join('')
            let originTextWithHamming = inputWithHamming.slice();
            console.log('originText length: ', originTextWithHamming.length);
            // console.log('text after encoding', inputWithHamming, inputWithHamming.length);
            let inputHamming = [];
            for (let i = 0; i < inputWithHamming.length; i++) {
                inputHamming.push(parseInt(inputWithHamming[i]));
            }
            let imageDataForHamming = ctx.getImageData(0, 0, width, height);
            let imagePixelsForHamming = dividePixels(imageDataForHamming.data);
            let changedHamming = putBits(inputHamming, imagePixelsForHamming, lambda);
            changedHamming = mergePixels(changedHamming);
            for (let i = 0; i < imageDataForHamming.data.length; i++) {
                imageDataForHamming.data[i] = changedHamming[i];
            }
            ctx.putImageData(imageDataForHamming, 0, 0);
            let decodeImageDataForHamming = ctx.getImageData(0, 0, width, height);
            let decodeImageDataForHammingArr = dividePixels(decodeImageDataForHamming.data);
            let decodedHamming = getPixels(decodeImageDataForHammingArr);
            console.log('decodedHamming length: ', decodedHamming.length);
            let arrForDecode = decodedHamming.match(/.{1,7}/g).toString().replace(/,/g, ' ').split( ' ');
            console.log(arrForDecode);
            let resOfHamming = [];
            for (let i = 0; i < arrForDecode.length; i++) {
                resOfHamming.push(hammingDecode(arrForDecode[i]));
            }
            resOfHamming = resOfHamming.join('');
            console.log('resOfHamming lenght: ', resOfHamming.length);
            let count = 0;
            for (let i = 0; i < originText.length; i++) {
                if (originText[i] === resOfHamming[i]) {
                    count++;
                }
            }
            console.log('Не совпало символов: ', originText.length - count);
            hammingBits.push([lambda, Number((count / originText.length).toFixed(3))]);
        }
        console.log("HAMMING BITS: ", hammingBits)
        return hammingBits;
    }
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
        let count = 0;
        for (let i = 0; i < inputArr.length; i++) {
            if (inputText[i] === decodedMessage[i]) {
                count++;
            }
        }
        bits.push([lambda, Number((count / inputArr.length).toFixed(3))]);
    }
    console.log('BITS: ', bits);
    return bits;
}

let calcDistortion = function (ctx, useHammingCode) {
    if (useHammingCode === true) {
        let hammingDistortion = [];
        for (let lambda = 0.01; lambda <= 0.5; lambda += 0.05) {
            lambda = Number(lambda.toFixed(2));
            console.log('LAMBDA', lambda);
            /** ENCODING */
            let inputText = convertTextToBinary(readyTexts[0]);
            inputText = hammingEncode(inputText);
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
            hammingDistortion.push([lambda, ((dist * 100) / (inputText.length * 256))]);
        }
        console.log("HAMMING BITS: ", hammingDistortion)
        return hammingDistortion;
    }
    let distortion = [];
    for (let lambda = 0.01; lambda <= 0.5; lambda += 0.05) {
        lambda = Number(lambda.toFixed(2));
        console.log('LAMBDA', lambda);
        /** ENCODING */
        let inputText = convertTextToBinary(readyTexts[0]);
        // inputText = hammingEncode(inputText);
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




//
// function calcCorrectnessWithHammingCode(ctx) {
//     let bits = [];
//     for (let lambda = 0.01; lambda <= 0.5; lambda += 0.05) {
//         lambda = Number(lambda.toFixed(2));
//         console.log('LAMBDA', lambda);
//         /** ENCODING */
//         let inputText = convertTextToBinary(readyTexts[0]);
//         inputText = hammingEncode(inputText);
//         let inputArr = [];
//         for (let i = 0; i < inputText.length; i++) {
//             inputArr.push(parseInt(inputText[i]));
//         }
//         let imageData = ctx.getImageData(0, 0, width, height);
//         let imagePixels = dividePixels(imageData.data);
//         let changed = putBits(inputArr, imagePixels, lambda);
//         changed = mergePixels(changed);
//         for (let i = 0; i < imageData.data.length; i++) {
//             imageData.data[i] = changed[i];
//         }
//         ctx.putImageData(imageData, 0, 0);
//         /** DECODING */
//         let decodeImageData = ctx.getImageData(0, 0, width, height);
//         let decodeImageDataArr = dividePixels(decodeImageData.data);
//         let decodedMessage = getPixels(decodeImageDataArr);
//         decodedMessage = hammingDecode(decodedMessage);
//         let count = 0;
//         for (let i = 0; i < inputArr.length; i++) {
//             if (inputText[i] === decodedMessage[i]) {
//                 count++;
//             }
//         }
//         bits.push([lambda, Number((count / inputArr.length).toFixed(3))]);
//
//     }
//     console.log('BITS: ', bits);
//     return bits;
// }
//
// let calcDistortionWithHammingCode = function (ctx) {
//     let distortion = [];
//     for (let lambda = 0.01; lambda <= 0.5; lambda += 0.05) {
//         lambda = Number(lambda.toFixed(2));
//         console.log('LAMBDA', lambda);
//         /** ENCODING */
//         let inputText = convertTextToBinary(readyTexts[0]);
//         inputText = hammingEncode(inputText);
//         let inputArr = [];
//         for (let i = 0; i < inputText.length; i++) {
//             inputArr.push(parseInt(inputText[i]));
//         }
//         let imageData = ctx.getImageData(0, 0, width, height);
//         let imagePixels = dividePixels(imageData.data);
//         let changed = putBits(inputArr, imagePixels, lambda);
//
//         let originalImage = dividePixels(imageData.data)
//         let dist = 0.0, amount = 0;
//         for (let j = sigma; j < height - sigma; j++) {
//             for (let i = j; i < width - sigma; i += sigma) {
//                 if (amount === inputText.length) {
//                     break;
//                 }
//                 dist += Math.abs(changed[j * width + i][2] - originalImage[j * width + i][2]);
//                 amount++;
//             }
//             if (amount === inputText.length) {
//                 break;
//             }
//         }
//         distortion.push([lambda, ((dist * 100) / (inputText.length * 256))]);
//
//     }
//     console.log('DISTORTION: ', distortion);
//     return distortion;
// }