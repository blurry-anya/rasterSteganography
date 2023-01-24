const startMark = 154;

let encode = function () {
    let key = parseInt(prompt('Enter key for encoding: ', '7'));
    console.log("\t\t\t\tПРОЦЕСС КОДИРОВАНИЯ");
    let input = document.getElementById("message").value;
    input = convertTextToBinary(input); //получаем сообщение в двоичном виде
    let binaryLength = intToBinary(input.length);
    console.log("Длина сообщения: ", input.length, "в двоичном виде: ", binaryLength, binaryLength.length);
    let imageData = ctx.getImageData(0, 0, width, height);
    let encodeImageData = arrayToBinary(imageData.data);
    let imageDataCopy = encodeImageData.slice();

    let redChannel = arrayToBinary(getRedChannel(imageData.data));
    let k = encodeImageData.length / 10000 / key;
    k = parseInt(k.toString().split('.')[0]);
    console.log("СЕКРЕТНЫЙ КЛЮЧ: ", k);

    let changedPixels = redChannel.slice();

    changedPixels = usedPixels_demo(changedPixels, startMark, k);
    console.log('changedPixels: ', changedPixels);

    let newCanvas = document.createElement('canvas');
    wrapper[0].appendChild(newCanvas);
    newCanvas.height = height;
    newCanvas.width = width;
    newCanvas.classList = "hoverCanvas";

    let context = newCanvas.getContext('2d');
    let newCanvasData = context.getImageData(0, 0, newCanvas.width, newCanvas.height);

    redChannel = putPixelsInInterval(redChannel, startMark, k, input, redChannel);//закладываем сообщение в LSB

    for (let i = 0, index = 0; i < encodeImageData.length; i++) {
        if (i % 4 === 0) {
            imageDataCopy[i] = changedPixels[index];
            encodeImageData[i] = redChannel[index];
            index++;
        }
    }
    for (let i = 0; i < binaryLength.length; i++) {
        encodeImageData[i] = replaceChars(encodeImageData[i], LSB, binaryLength[i]);
    }

    encodeImageData = parseFromBinary(encodeImageData);
    console.log("Изменённый массив: ", encodeImageData);
    imageData.data.set(encodeImageData);
    console.log("Пиксели в изображении: ", imageData);
    ctx.putImageData(imageData, 0, 0);

    imageDataCopy = parseFromBinary(imageDataCopy);
    newCanvasData.data.set(imageDataCopy);
    context.putImageData(newCanvasData, 0, 0);
    alert("Your data was successfully encoded!");
};

function putPixelsInInterval(arr, st, key, input, imageDataArr) {
    for (let i = 0, index = 0; i < imageDataArr.length; i++) {
        if (i === st) {
            arr[i] = replaceChars(arr[i], LSB, input[index]);
            st += step(i.toString(2), key);
            index++;
        }
        if (index === input.length) {
            break;
        }
    }
    return arr;
}

function getBitsInIntervals(arr, st, key, inputLength, imageDataLength) {
    let output = '';
    console.log("ДЛИНА СООБЩЕНИЯ: ", inputLength);
    for (let i = 0, index = 0; i < imageDataLength; i++) {
        if (i === st) {
            output += getChar(arr[i], LSB);
            st += step(i.toString(2), key);
            index++;
        }
        if (i > arr.length) {
            console.log(i, arr[i]);
            break;
        }

        if (index === inputLength) {
            break;
        }
    }
    console.log("Длина извлеченного сообщения: ", output.length);
    return output;
}

function usedPixels_demo(arr, st, key) {
    for (let i = 0; i < arr.length; i++) {
        if (i === st) {
            arr[i] = '11111111';
            st += step(i.toString(2), key);
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

let decode = function () {
    let key = parseInt(prompt('Enter key for decoding: ', '7'));
    console.log("\t\t\tПРОЦЕСС ДЕКОДИРОВАНИЯ");
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
    let decodeImageData = arrayToBinary(ctx.getImageData(0, 0, width, height).data);
    let redChannel = getRedChannel(decodeImageData);

    let k = decodeImageData.length / 10000 / key;
    k = parseInt(k.toString().split('.')[0]);

    let inputLength = '';
    for (let i = 0; i < 24; i++) {
        inputLength += getChar(decodeImageData[i], LSB);
    }
    inputLength = parseInt(inputLength, 2);

    let res = getBitsInIntervals(redChannel, startMark, k, inputLength, decodeImageData.length);

    console.log("Раскодированный текст: ", res);
    output.innerText += convertBinaryToText(res);

};

let decodeBtn = document.getElementById('decodebtn');
decodeBtn.addEventListener('click', decode);




