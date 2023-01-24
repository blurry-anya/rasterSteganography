let chartsWrapper = document.getElementsByClassName('chartsWrapper');

let stegoContainers = ['../../js/lab4/stegoContainers/stego5.jpeg', '../../js/lab4/stegoContainers/stego10.jpeg',
    '../../js/lab4/stegoContainers/stego15.jpeg', '../../js/lab4/stegoContainers/stego20.jpeg', '../../js/lab4/stegoContainers/stego25.jpeg',
    '../../js/lab4/stegoContainers/stego30.jpeg', '../../js/lab4/stegoContainers/stego35.jpeg', '../../js/lab4/stegoContainers/stego40.jpeg',
    '../../js/lab4/stegoContainers/stego45.jpeg', '../../js/lab4/stegoContainers/stego50.jpeg'];

function initContext(contextType) {
    let canvas = document.createElement('canvas');
    return canvas.getContext(contextType);
}

function loadImage(imageSource, context) {
    let state = [];
    let imageObj = new Image();
    imageObj.onload = function () {
        context.drawImage(imageObj, 0, 0);
        let imageData = context.getImageData(0, 0, width, height);
        state.push(readImage(imageData));
    };
    imageObj.src = imageSource;
    return state;
}

function readImage(imageData) {
    return imageData.data;
}

let canvases = [];
for (let i = 0; i < 10; i++) {
    let context = initContext('2d');
    canvases.push(loadImage(stegoContainers[i], context));
    console.log(canvases)
}

let showChartsBtn = document.getElementById('showChartBtn');
showChartsBtn.addEventListener('click', function () {
    chartsWrapper[0].classList.remove('noDisplay');
    let correctnessCanvas = document.getElementById('correctnessCanvas');
    let distortionCanvas = document.getElementById('distortionCanvas');
    // console.log(canvases);

    let calcButton = document.getElementsByClassName('calcButton');
    calcButton[0].addEventListener('click', function () {
        let dependencies = calcDependencies();
        let chart1 = new Chart(correctnessCanvas, {
            type: 'line',
            data: {
                labels: Array.from(dependencies.inaccuracy, i => i[0]),
                datasets: [{
                    label: "Inaccuracy of encoded message",
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
        });
        new Chart(distortionCanvas, {
            type: 'line',
            data: {
                labels: Array.from(dependencies.distortion, i => i[0]),
                datasets: [{
                    label: "Distortion of encoded message",
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


function calcDependencies() {
    console.log("canvases", canvases)
    let bits = [], distortion = [];
    let input = convertTextToBinary(readyTexts[1]);
    for (let i = 0, index = 5; i < 10; i++) {
        let decodeImageData = canvases[i];
        console.log('imageData for decoding: ', decodeImageData);
        console.log('origin:', originalPixels)
        let dist = 0;
        for (let j = 0; j < decodeImageData[0].length; j++) {
            // console.log(decodeImageData[0][i]);
            // console.log(originalPixels[i]);
            dist += Math.abs(decodeImageData[0][j] - originalPixels[j]);
            // console.log(dist)
        }
        console.log('dist: ', dist)
        let divided = dividePixels(decodeImageData[0]);
        let YCbCr = toYCbCrModel(divided); //RGB to YCbCr transform
        let merged = mergePixels(YCbCr);
        console.log('image in YCbCr: ', merged);
        let Ychannel = getRedChannel(merged); // getting Y from YCbCr
        let YchannelMatrix = toMatrix(Ychannel);
        let blockedImage = imageToBlock(YchannelMatrix);
        console.log('YCbCr image in blocks: ', blockedImage);
        let blockedImageWithDCT = useDCTtoBlocks(blockedImage);
        console.log('YCbCr with DCT: ', blockedImageWithDCT)
        let decodedMessage = [];
        let i1 = parseInt((N / 3).toString()), i2 = i1 + i1;
        for (let i = 0; i < blockedImageWithDCT.length; i++) {
            for (let j = 0; j < blockedImageWithDCT[i].length; j++) {
                if (Math.abs(blockedImageWithDCT[i][j][i2][i1]) > Math.abs(blockedImageWithDCT[i][j][i1][i2])) {
                    decodedMessage.push('1');
                } else {
                    decodedMessage.push('0');
                }
            }
        }
        decodedMessage = decodedMessage.join('');
        let count = 0;
        for (let i = 0; i < input.length; i++) {
            if (input[i] !== decodedMessage[i]) {
                count++;
            }
        }
        console.log(count)
        bits.push([index, Number((count / input.length).toFixed(3))]);
        distortion.push([index, ((dist) / (width * height * 256))])
        // distortion.push([index, dist])
        index += 5
    }
    console.log('BITS: ', bits);
    console.log('DISTORTION: ', distortion);
    return {
        inaccuracy: bits,
        distortion: distortion
    };
}
