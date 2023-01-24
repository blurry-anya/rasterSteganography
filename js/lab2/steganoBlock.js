const startMark = 154;

let encode = function () {
    let key = parseInt(prompt('Enter key for encoding: ', '7'));
    console.log("\t\t\t\tПРОЦЕСС КОДИРОВАНИЯ");
    console.log("Получаем сообщение и объеденим его с меткой..");
    let input = document.getElementById("message").value;
    input = convertTextToBinary(input); //получаем сообщение в двоичном виде
    let binaryLength = intToBinary(input.length);
    console.log("Длина сообщения: ", input.length, "в двоичном виде: ", binaryLength, binaryLength.length);
    console.log("Достаём пиксели изображения:");
    let imageData = ctx.getImageData(0, 0, width, height);
    let encodeImageData = arrayToBinary(imageData.data);
    let imageDataCopy = encodeImageData.slice();
    // console.log('imageDataCopy: ', imageDataCopy);
    console.log("Длина данных изображения: ", encodeImageData.length);
    let greenChannel = arrayToBinary(getGreenChannel(imageData.data));

    let k = encodeImageData.length / 10000 / key;
    k = parseInt(k.toString().split('.')[0]);
    console.log("СЕКРЕТНЫЙ КЛЮЧ: ", k);

    let changed = greenChannel.slice();
    changed = usedPixels_demo(changed, startMark, k);

    greenChannel = putPixelsInBlocks(greenChannel, startMark, k, input, encodeImageData);

    for (let i = 0, index = 0; i < encodeImageData.length; i += 4) {
        imageDataCopy[i + 1] = changed[index];
        encodeImageData[i + 1] = greenChannel[index]; // green
        index++;
    }
    for (let i = 0; i < binaryLength.length; i++) {
        encodeImageData[i] = replaceChars(encodeImageData[i], LSB, binaryLength[i]);
    }
    let newCanvas = document.createElement('canvas');
    wrapper[0].appendChild(newCanvas);
    newCanvas.height = height;
    newCanvas.width = width;
    newCanvas.classList = "hoverCanvas";

    let context = newCanvas.getContext('2d');
    let newCanvasData = context.getImageData(0, 0, newCanvas.width, newCanvas.height);

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

function usedPixels_demo(arr, st, key) {
    let nextSt = 0;
    for (let i = 0; i < arr.length; i++) {
        if (i === st) {
            nextSt = st + 30;
            for (let j = st; j < nextSt; j++) {
                arr[j] = '11111111';
            }
            st += step(i.toString(2), key) + 30;
        }
    }
    return arr;
}

function putPixelsInBlocks(arr, st, key, input) {
    let nextSt = 0;
    for (let i = 0, index = 0; i < arr.length; i++) {
        if (i === st) {
            nextSt = st + 30;
            for (let j = st; j < nextSt; j++) {
                if (typeof input[index] === 'undefined') {
                    break;
                }
                arr[j] = replaceChars(arr[j], LSB, input[index]);
                index++;
                if (index === input.length) {
                    break;
                }
            }
            st += step(i.toString(2), key) + 30;
        }

    }
    console.log("array after putting pixels \n", arr);
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

function getBitsInBlocks(arr, st, key, inputLength, imageDataLength) {
    let output = '';
    console.log("ДЛИНА СООБЩЕНИЯ: ", inputLength);
    let nextSt = 0;
    for (let i = 0, index = 0; i < arr.length; i++) {
        if (i === st) {
            nextSt = st + 30;
            for (let j = st; j < nextSt; j++) {
                output += getChar(arr[j], LSB);
                index++;
            }
            st += step(i.toString(2), key) + 30;
            if (index === inputLength) {
                break;
            }
        }

    }
    console.log("Длина извлеченного сообщения: ", output.length);
    return output;
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
    console.log("Достаём пиксели изображения:");
    let decodeImageData = arrayToBinary(ctx.getImageData(0, 0, width, height).data);
    // let decodedText = '';
    let greenChannel = getGreenChannel(decodeImageData);

    let k = decodeImageData.length / 10000 / key;
    k = parseInt(k.toString().split('.')[0]);
    console.log("СЕКРЕТНЫЙ КЛЮЧ", k);

    let inputLength = '';
    for (let i = 0; i < 24; i++) {
        inputLength += getChar(decodeImageData[i], LSB);
    }
    inputLength = parseInt(inputLength, 2);

    let res = getBitsInBlocks(greenChannel, startMark, k, inputLength, decodeImageData.length);

    console.log("Раскодированный текст: ", res);
    output.innerText += convertBinaryToText(res);

};

let decodeBtn = document.getElementById('decodebtn');
decodeBtn.addEventListener('click', decode);

