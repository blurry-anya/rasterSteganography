const startMark = 154;

let blueChannel, quantTable;

// console.table(quantTable);

function encode() {

    let input = document.getElementById("message").value;
    input = convertTextToBinary(input);
    let imageData = ctx.getImageData(0, 0, width, height);

    let changedPixels = putPixels(blueChannel, startMark, input, imageData.data, quantTable);

    for (let i = 0, index = 0; i < imageData.data.length; i += 4) {
        imageData.data[i + 2] = changedPixels[index++];
    }
    console.log(imageData.data);

    ctx.putImageData(imageData, 0, 0);
    alert("Your data was successfully encoded!");
    return quantTable;
}

function putPixels(arr, st, input, imageDataArr, quantTable) {
    let key = parseInt(prompt('Enter key for decoding: ', '6'));

    let inputLength = intToBinary(input.length);
    console.log(inputLength);
    for (let i = 0, index = 0; i < 48; i += 2) {
        let delta = arr[i] - arr[i + 1];
        let tmp = quantTable.find(i => i[0] === delta);

        if (tmp[1] !== parseInt(inputLength[index])) {
            let bias = 0;
            for (let j = quantTable.indexOf(tmp); j < quantTable.length; j++) {
                if (quantTable[j][1] === parseInt(inputLength[index])) {
                    arr[i] += bias;
                    break;
                }
                bias++;
            }
        }
        index++;
    }
    for (let i = 0, index = 0; i < imageDataArr.length; i++) {
        if (i === st) {
            let delta = arr[i] - arr[i + 1];
            let tmp = quantTable.find(i => i[0] === delta);
            if (typeof tmp === 'undefined') {
                alert('Your key is too big, so not all information will be encoded..');
                break;
            }
            if (tmp[1] !== parseInt(input[index])) {
                let bias = 0;
                for (let j = quantTable.indexOf(tmp); j < quantTable.length; j++) {
                    if (quantTable[j][1] === parseInt(input[index])) {
                        if (arr[i] + bias > 255) {
                            do {
                                arr[i]--;
                                j--;
                            } while (quantTable[j][1] !== parseInt(input[index]));
                        }
                        arr[i] += bias;
                        break;
                    }
                    bias++;
                }
            }
            st += step(i.toString(2), key);
            index++;
        }
        if (index === input.length) {
            break;
        }
    }
    return arr;
}

function step(x, k) {
    let count = 0;
    for (let i = 0; i < x.length; i++) {
        if (x[i] === '1') {
            count++
        }
    }
    return k * count;
}

function decode() {
    let key = parseInt(prompt('Enter key for decoding: ', '6'));

    let tmp = document.getElementsByClassName('input-wrapper');
    console.log(tmp[0].children.length);
    let output;
    if (tmp[0].children.length <= 3) {
        output = document.createElement('textarea');
        output.id = 'messageOutput';
        tmp[0].appendChild(output);
    } else {
        output = document.getElementById('messageOutput');
    }
    let decodeImageData = ctx.getImageData(0, 0, width, height);

    let blueChannel = getBlueChannel(decodeImageData.data);


    let decodedMessage = getPixels(blueChannel, startMark, key, decodeImageData.data, quantTable);
    console.log(decodedMessage);
    output.innerText += convertBinaryToText(decodedMessage);

}

function getPixels(arr, st, key, imageData, quantTable) {
    let output = '', inputLength = '';
    for (let i = 0; i < 48; i += 2) {
        let delta = arr[i] - arr[i + 1];
        let tmp = quantTable.find(item => item[0] === delta);
        inputLength += tmp[1];
    }
    inputLength = parseInt(inputLength, 2);

    for (let i = 0, index = 0; i < arr.length; i++) {
        if (i === st) {
            let delta = arr[i] - arr[i + 1];
            let tmp = quantTable.find(i => i[0] === delta);
            output += tmp[1];

            st += step(i.toString(2), key);
            index++;
        }
        if (index === inputLength) {
            break;
        }
    }
    return output;
}

let decodeBtn = document.getElementById('decodebtn');
decodeBtn.addEventListener('click', decode);