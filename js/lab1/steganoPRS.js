

let keyMatrix = [
    [1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1]
];

console.log(keyMatrix);

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

    input = shiftInputBits(convertTextToBinaryArray(input), keyMatrix);

    let array = '';
    for (let i = 0, index = 0; i < input.length * 4; i++) {
        if (i % 4 === 0) {
            imageDataCopy[i] = '11111111';
            encodeImageData[i] = replaceChars(encodeImageData[i], LSB, input[index]);
            array += input[index];
            index++;
        }
    }

    console.log("Данные, помещаемые в encodeImageData:  ", array, array.length);
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

function shiftInputBits(input, matrix) {
    let res = [];
    for (let i = 0; i < input.length; i++) {
        let tmp = vectorOnMatrix(input[i], matrix);
        res.push(tmp);
    }
    console.log("После умножения на матрицу: \n", res);
    return res.join('').replace(/,/g, '');
}

function convertTextToBinaryArray(input) {
    console.log("ПРОЦЕСС КОНВЕРТИРОВАНИЯ ТЕКСТА В ДВОИЧНЫЙ..");
    let output = [];
    for (let i = 0; i < input.length; i++) {
        let tmp = input[i].charCodeAt(0).toString(2);
        tmp = make8bit(tmp);
        tmp = tmp.split('');
        for (let j = 0; j < tmp.length; j++) {
            tmp[j] = parseInt(tmp[j], 2);
        }
        output.push(tmp);
    }
    // console.log("После конвертирования текст имеет вид: \n", output.toString().replace(/,/g, ''));
    console.log("Его тип: ", typeof output, output.length);
    return output;
}

function vectorOnMatrix(vector, matrix) {
    let result = [];
    for (let i = 0; i < matrix.length; i++) {
        let tmp = 0;
        for (let j = 0; j < matrix[i].length; j++) {
            tmp += vector[j] * matrix[i][j];
        }
        result.push(tmp);
    }
    return result;
}

let decode = function () {
    console.log("\tПРОЦЕСС ДЕКОДИРОВАНИЯ");
    let tmp = document.getElementsByClassName('input-wrapper');
    console.log(tmp[0].children.length);
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
    // console.log(decodedText);

    output.innerText += convertBinaryToTextArray(decodedText);

};


function convertBinaryToTextArray(str) {
    console.log("\tПРОЦЕСС КОНВЕРТИРОВАНИЯ ДВОИЧНОГО КОДА В ТЕКСТ");
    str = str.match(/.{1,8}/g).toString().replace(/,/g, ' ').split(' ');
    let tmp = [];
    for (let i = 0; i < str.length; i++) {
        tmp.push((str[i].split('')).map(item => parseInt(item)));
    }
    console.log(tmp);
    let newMatrix = TransMatrix(keyMatrix);
    let output = shiftInputBits(tmp, newMatrix);
    output = output.match(/.{1,8}/g).toString().replace(/,/g, ' ').split(' ');


    let binCode = [];
    for (let i = 0; i < output.length; i++) {
        binCode.push(String.fromCharCode(parseInt(output[i], 2)));
    }
    console.log("После конвертирования текст имеет вид:\n", binCode.join(''));
    console.log("Его тип: ", typeof binCode.join(''));
    return binCode.join('');
}


let decodeBtn = document.getElementById('decodebtn');
decodeBtn.addEventListener('click', decode);


function TransMatrix(matrix) {
    let m = matrix.length, n = matrix[0].length, matrixTrans = [];
    for (let i = 0; i < n; i++) {
        matrixTrans[i] = [];
        for (let j = 0; j < m; j++)
            matrixTrans[i][j] = matrix[j][i];
    }
    return matrixTrans;
}
