let lambda = 0.8,
    sigma = 5;

console.log("Lambda: ", lambda);

let encode = function () {
    let input = document.getElementById("message").value;
    input = convertTextToBinary(input);

    // console.log('HammingEncoded before: ', input);
    // input = hammingEncode(input);
    // console.log('HammingEncoded before: ', input);

    let inputArr = [];
    for (let i = 0; i < input.length; i++) {
        inputArr.push(parseInt(input[i]));
    }
    let imageData = ctx.getImageData(0, 0, width, height);
    let imagePixels = dividePixels(imageData.data);
    // console.log(imagePixels);
    let changed = putBits(inputArr, imagePixels, lambda);
    // console.log(changed);
    changed = mergePixels(changed);

    for (let i = 0; i < imageData.data.length; i++) {
        imageData.data[i] = changed[i];
    }

    ctx.putImageData(imageData, 0, 0);
    alert("Your data was successfully encoded!");
}


function getRGB(imageData, index) {
    for (let i = 0; i < imageData.length; i++) {
        if (i === index) {
            return imageData[i];
        }
    }
}

function dividePixels(imageData) {
    let res = [];
    for (let i = 0; i < imageData.length; i += 4) {
        let tmp = [imageData[i], imageData[i + 1], imageData[i + 2]];
        res.push(tmp);
    }
    return res;
}

function mergePixels(imageDataArr) {
    let res = [];
    for (let i = 0; i < imageDataArr.length; i++) {
        res.push([].concat(imageDataArr[i], 255));
    }
    return res.flat();
}

function putBits(input, imageData, lambda) {
    console.log('putBits started..');
    for (let j = sigma, index = 0; j < height - sigma; j++) {
        for (let i = j; i < width - sigma; i += sigma) {
            if (index === input.length) {
                break;
            }
            let color = getRGB(imageData, j * width + i);
            let br = 0.29890 * color[0] + 0.58662 * color[1] + 0.11448 * color[2];
            let newBlue = parseInt(((color[2] + ((2 * input[index] - 1)) * br * lambda)).toString());
            imageData[j * width + i] = [color[0], color[1], newBlue < 0 ? 0 : Math.min(newBlue, 255)];
            index++;
        }
    }
    let binaryLength = intToBinary  (input.length);
    for (let i = imageData.length - 24, index = 0; i < imageData.length; i++) {
        let tmp = make8bit(getRGB(imageData, i)[1].toString(2));
        imageData[i][1] = parseInt(replaceChars2(tmp, LSB, binaryLength[index++]), 2);

    }
    return imageData;
}

let decode = function () {
    let tmp = document.getElementsByClassName('input');
    let output;
    if (tmp[0].children.length === 1) {
        output = document.createElement('textarea');
        output.id = 'messageOutput';
        tmp[0].appendChild(output);
    } else {
        output = document.getElementById('messageOutput');
    }
    let decodeImageData = ctx.getImageData(0, 0, width, height);

    let decodeImageDataArr = dividePixels(decodeImageData.data);
    let decodedMessage = getPixels(decodeImageDataArr);

    // console.log('HammingDecoded before: ', decodedMessage);
    // decodedMessage = hammingDecode(decodedMessage);
    // console.log('HammingDecoded after: ', decodedMessage);

    console.log(decodedMessage);
    output.innerText += convertBinaryToText(decodedMessage);
}


function getPixels(imageData) {
    console.log('getPixels started..');
    let inputLength = '';
    for (let i = imageData.length - 24; i < imageData.length; i++) {
        let tmp = make8bit(getRGB(imageData, i)[1].toString(2));
        inputLength += getChar(tmp, LSB);
    }
    inputLength = parseInt(inputLength, 2);

    let output = [], count = 0;
    for (let j = sigma; j < height - sigma; j++) {
        for (let i = j; i < width - sigma; i += sigma) {
            if(count === inputLength){
                break;
            }
            let color = getRGB(imageData, j * width + i);
            let sum = 0.0;
            for (let k = i - sigma; k <= i + sigma; k++) {
                if (i !== k) {
                    let tmp = getRGB(imageData, j * width + k);
                    sum += tmp[2];
                }
            }
            for (let k = j - sigma; k <= j + sigma; k++) {
                if (j !== k) {
                    let tmp = getRGB(imageData, k * width + i);
                    sum += tmp[2];
                }
            }
            sum /= 4 * sigma;
            let diff = color[2] - sum;
            output.push(diff > 0 ? '1' : '0');
            count++;
        }
    }
    return output.join('');
}

let decodeBtn = document.getElementById('decodebtn');
decodeBtn.addEventListener('click', decode);


