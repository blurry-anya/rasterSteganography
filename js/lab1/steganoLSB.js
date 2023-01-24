let encode = function () {
    console.log("\t\t\t\tПРОЦЕСС КОДИРОВАНИЯ");
    console.log("Достаём пиксели изображения:");
    let imageData = ctx.getImageData(0, 0, width, height);
    let encodeImageData = arrayToBinary(imageData.data);
    let imageDataCopy = encodeImageData.slice();
    console.log("Достаём текст:");
    let input = document.getElementById("message").value; // получили сообщение из дива
    console.log(input);

    let newCanvas = document.createElement('canvas');
    wrapper[0].appendChild(newCanvas);
    newCanvas.height = height;
    newCanvas.width = width;
    let context = newCanvas.getContext('2d');
    let newCanvasData = context.getImageData(0, 0, newCanvas.width, newCanvas.height);

    newCanvas.classList = "hoverCanvas";
    input = convertTextToBinary(input);

    let array = '';
    for (let i = 0, index = 0; i < input.length; i++) {
        if (i % 4 === 0) {
            imageDataCopy[i] = '11111111';
            encodeImageData[i] = replaceChars2(encodeImageData[i], LSB, input[index]);
            array += input[index];
            index++;
            // FOR EXPERIMENTS START
            // encodeImageData[i] = replaceChars2(encodeImageData[i], LSB - 1, input[index]);
            // array += input[index];
            // index++;
            // encodeImageData[i] = replaceChars2(encodeImageData[i], LSB - 2, input[index]);
            // array += input[index];
            // index++;
            // encodeImageData[i] = replaceChars2(encodeImageData[i], LSB - 3, input[index]);
            // array += input[index];
            // index++;
            // encodeImageData[i] = replaceChars2(encodeImageData[i], LSB - 4, input[index]);
            // array += input[index];
            // index++;
            // encodeImageData[i] = replaceChars2(encodeImageData[i], LSB - 5, input[index]);
            // array += input[index];
            // index++;
            // FOR EXPERIMENTS END
        }
    }

    console.log("Данные, помещаемые в encodeImageData:  ", array, array.length);
    console.log("Данные изображения: ", encodeImageData);
    encodeImageData = parseFromBinary(encodeImageData);
    console.log("Изменённый массив: ", encodeImageData);
    imageData.data.set(encodeImageData);
    console.log("Пиксели в изображении: \n", imageData);
    ctx.putImageData(imageData, 0, 0);

    imageDataCopy = parseFromBinary(imageDataCopy);
    newCanvasData.data.set(imageDataCopy);
    context.putImageData(newCanvasData,0,0);
    alert("Your data was successfully encoded!");
};

let decode = function () {
    console.log("\tПРОЦЕСС ДЕКОДИРОВАНИЯ");
    let tmp = document.getElementsByClassName('input-wrapper');
    let output;
    if (tmp[0].children.length < 3) {
        output = document.createElement('textarea');
        output.id = 'messageOutput';
        tmp[0].appendChild(output);
    } else {
        output = document.getElementById('messageOutput');
    }
    console.log("Достаём пиксели изображения:");
    let decodeImageData = arrayToBinary(ctx.getImageData(0, 0, width, height).data);

    let decodedText = '';
    for (let i = 0; i < decodeImageData.length; i += 4) {
        decodedText += getChar(decodeImageData[i], LSB);

    }
    output.innerText += convertBinaryToText(decodedText);
};

let decodeBtn = document.getElementById('decodebtn');
decodeBtn.addEventListener('click', decode);



