// const path = '../../js/lab4/stegoContainers/stego15.jpeg',
const path = '../../images/friends.png',
    LSB = 7;

let wrapper = document.getElementsByClassName('container-wrapper'),
    container = document.createElement('canvas');
container.id = 'container';
wrapper[0].appendChild(container);

// let image = new Image();
// image.src = path;

let image, width, height;

// let height = image.naturalHeight,
//     width = image.naturalWidth;

// container.height = height;
// container.width = width;

// image.onload = function () {
//     draw(this);
// };

let ctx = container.getContext('2d');

// function draw(img) {
//     ctx.drawImage(img, 0, 0);
//     img.style.display = 'none';
//     return ctx.getImageData(0, 0, width, height).data;
// }

// let originalPixels = draw(image);
// console.log("Оригинальные пиксели изображения:\n", originalPixels);


let originalPixels;

document.getElementById("uploadbtn").addEventListener("change", function (e) {
    let reader = new FileReader();
    reader.onload = function (event) {
        image = new Image();
        image.onload = function () {
            width = image.naturalWidth;
            height = image.naturalHeight;
            container.width = width;
            container.height = height;
            ctx.drawImage(image, 0, 0);
            originalPixels = ctx.getImageData(0, 0, container.width, container.height).data;
            console.log("Оригинальные пиксели изображения:\n", originalPixels);
            // for Quant method start
            blueChannel = getBlueChannel(originalPixels);
            quantTable = initQuantTable(blueChannel);
            // for Quant method end

            //for KvaziOrthogonal start
            ansamblWidth = width;
            arrayFunction1 = arrayFunction();
            //for KvaziOrthogonal end
        }
        image.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);
});

function convertTextToBinary(input) {
    console.log("ПРОЦЕСС КОНВЕРТИРОВАНИЯ ТЕКСТА В ДВОИЧНЫЙ..");
    let output = [];
    for (let i = 0; i < input.length; i++) {
        output.push(make8bit(input[i].charCodeAt(0).toString(2)));
    }
    // console.log("После конвертирования текст имеет вид: ", output.join(''));
    // console.log("Его тип: ", typeof output.join(''), output.join('').length);
    return output.join('');
}


function convertBinaryToText(str) {
    console.log("\tПРОЦЕСС КОНВЕРТИРОВАНИЯ ДВОИЧНОГО КОДА В ТЕКСТ");
    str = str.match(/.{1,8}/g).toString().replace(/,/g, ' ');
    str = str.split(' ');
    let binCode = [];
    for (let i = 0; i < str.length; i++) {
        binCode.push(String.fromCharCode(parseInt(str[i], 2)));
    }
    console.log("После конвертирования текст имеет вид:\n", binCode.join(''));
    console.log("Его тип: ", typeof binCode.join(''));
    return binCode.join(''); // return string
}

function arrayToBinary(data) {
    console.log("\tПРОЦЕСС ПРЕОБРАЗОВАНИЯ МАССИВА В ДВОИЧНЫЙ");
    let array = [];
    for (let i = 0; i < data.length; i++) {
        array[i] = make8bit(data[i].toString(2));
    }
    console.log('Получаем двоичный массив: ', array);
    // console.log("Его тип: ", typeof array, array.length);
    return array;
}

function make8bit(str) {
    let result = [];
    for (let i = 0; i < 8 - str.length; i++) {
        result.push('0');
    }
    result.push(str);
    return result.join('');
}

function intToBinary(x) {
    let res = x.toString(2).toString();
    let result = [];
    for (let i = 0; i < 24 - res.length; i++) {
        result.push('0');
    }
    result.push(res);
    return result.join('');
}

function replaceChars(string, index, replacement) {
    return string.slice(0, index) + replacement;
}

function replaceChars2(string, index, replacement) {
    let strStart = string.slice(0, index);
    let strEnd = string.slice(index + 1);
    return strStart + replacement + strEnd;
}

function getChar(str, index) {
    return str.slice(index);
}

function parseFromBinary(arr) {
    for (let i = 0; i < arr.length; i++) {
        arr[i] = parseInt(arr[i], 2);
    }
    return arr;
}

function getRedChannel(pixels) {
    let tmpData = [];
    for (let i = 0, index = 0; i < pixels.length; i += 4) {
        tmpData[index++] = pixels[i];
    }
    // console.log("Канал красного:", tmpData);
    return tmpData;
}

function getGreenChannel(pixels) {
    let tmpData = [];
    for (let i = 0, index = 0; i < pixels.length; i += 4) {
        tmpData[index] = pixels[i + 1];
        index++
    }
    console.log("Канал зелёного:", tmpData);
    return tmpData;
}

function getBlueChannel(pixels) {
    let tmpData = [];
    for (let i = 0, index = 0; i < pixels.length; i += 4) {
        tmpData[index++] = pixels[i + 2];
    }
    console.log("Канал синего:", tmpData);
    return tmpData;
}

let encodeBtn = document.getElementById('encodebtn');
encodeBtn.addEventListener('click', function () {
    let input = document.getElementById("message").value;
    if (input.length > width * height) {
        alert("Your message is too long for this image!");
    } else if (input.length === 0) {
        alert("You need to enter message first!");
    } else {
        encode();
    }
});

document.getElementById('downloadbtn').addEventListener('click', function (e) {
    let originalPath = document.getElementById("uploadbtn").value;
    let format = originalPath.substring(originalPath.lastIndexOf('.')); //get format of original img
    console.log(ctx.getImageData(0, 0, container.width, container.height).data)
    let link = container.toDataURL(`image/${format}`, 0.4);
    downloadImage(link, `stego${format}`);
});

function downloadImage(data, filename = 'untitled.jpeg') {
    let a = document.createElement('a');
    a.href = data;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
}

let readyTexts = [
    'Hagrid looked at Harry with warmth and respect blazing in his eyes, but Harry, instead of feeling pleased and proud, felt quite sure there had been a horrible mistake. A wizard? Him? How could he possibly be? He\'d spent his life being clouted by Dudley, and bullied by Aunt Petunia and Uncle Vernon; if he was really a wizard, why hadn\'t they been turned into warty toads every time they\'d tried to lock him in his cupboard? If he\'d once defeated the greatest sorcerer in the world, how come Dudley had always been able to kick him around like a football?',
    'Steganography is the technique of hiding secret data within an ordinary, non-secret, file or message in order to avoid detection; the secret data is then extracted at its destination. The use of steganography can be combined with encryption as an extra step for hiding or protecting data.',
    'But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. '
];

let loadText1 = document.getElementById('loadText1Btn');
loadText1.addEventListener('click', function () {
    return document.getElementById('message').value = readyTexts[0];
});

let loadText2 = document.getElementById('loadText2Btn');
loadText2.addEventListener('click', function () {
    return document.getElementById('message').value = readyTexts[1];
});

let loadText3 = document.getElementById('loadText3Btn');
loadText3.addEventListener('click', function () {
    return document.getElementById('message').value = readyTexts[2];
});

let readRed = function () {
    var imageData = ctx.getImageData(0, 0, width, height);
    let data = imageData.data;
    for (var i = 0; i < data.length; i += 4) {
        data[i] = data[i]; // red
        data[i + 1] = 0; // green
        data[i + 2] = 0; // blue
    }
    ctx.putImageData(imageData, 0, 0);
    // console.log('red: ', imageData.data);
    return imageData.data;
};
let readGreen = function () {
    var imageData = ctx.getImageData(0, 0, width, height);
    let data = imageData.data;
    for (var i = 0; i < data.length; i += 4) {
        data[i] = 0; // red
        data[i + 1] = data[i + 1]; // green
        data[i + 2] = 0; // blue
    }
    ctx.putImageData(imageData, 0, 0);
    console.log('green: ', imageData);
};
let readBlue = function () {
    var imageData = ctx.getImageData(0, 0, width, height);
    let data = imageData.data;
    for (var i = 0; i < data.length; i += 4) {
        data[i] = 0; // red
        data[i + 1] = 0; // green
        data[i + 2] = data[i + 2]; // blue
    }
    ctx.putImageData(imageData, 0, 0);
    console.log('blue: ', imageData);
};
let invert = function () {
    var imageData = ctx.getImageData(0, 0, width, height);
    let data = imageData.data;
    for (var i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];     // red
        data[i + 1] = 255 - data[i + 1]; // green
        data[i + 2] = 255 - data[i + 2]; // blue
    }
    ctx.putImageData(imageData, 0, 0);
};
let grayscale = function () {
    var imageData = ctx.getImageData(0, 0, width, height);
    let data = imageData.data;
    for (var i = 0; i < data.length; i += 4) {
        var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg; // red
        data[i + 1] = avg; // green
        data[i + 2] = avg; // blue
    }
    ctx.putImageData(imageData, 0, 0);
};

let readRedBtn = document.getElementById('readRedbtn');
readRedBtn.addEventListener('click', readRed);

let readGreenBtn = document.getElementById('readGreenbtn');
readGreenBtn.addEventListener('click', readGreen);

let readBlueBtn = document.getElementById('readBluebtn');
readBlueBtn.addEventListener('click', readBlue);

let invertBtn = document.getElementById('invertbtn');
invertBtn.addEventListener('click', invert);

let grayscaleBtn = document.getElementById('grayscalebtn');
grayscaleBtn.addEventListener('click', grayscale);

let clearbtn = document.getElementById('clearbtn');
clearbtn.addEventListener('click', function () {
    // draw(image);
    ctx.drawImage(image, 0, 0);
});


let matrix = function (rows, columns) {
    this.rows = rows;
    this.columns = columns;
    this.myarray = new Array(this.rows);
    for (let i = 0; i < this.columns; i += 1) {
        this.myarray[i] = new Array(this.rows)
    }
    return this.myarray;
}

let myArray = function (length) {
    this.myarr = new Array(this.length);
    for (let i = 0; i < length; i++) {
        this.myarr[i] = 0;
    }
    return this.myarr;
}

function arrayCopy(src, srcIndex, dest, destIndex, length) {
    dest.splice(destIndex, length, ...src.slice(srcIndex, srcIndex + length));
}

function getRGB(imageData, index) {
    for (let i = 0; i < imageData.length; i++) {
        if (i === index) {
            return imageData[i];
        }
    }
}

function setRGB(imageData, index, newRed, newGreen, newBlue) {
    for (let i = 0; i < imageData.length; i++) {
        if (i === index) {
            imageData[i] = [newRed, newGreen, newBlue];
        }
    }
    return imageData;
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

function multString(a, b) {
    let res = 0;
    for (let i = 0; i < a.length; i++) {
        res += a[i] * b[i];
    }
    return res;
}

// Quant method starts
function initQuantTable(colorChannel) {
    let arr = [], value;
    for (let i = 0; i < 511; i++) {
        value = onesAmount(colorChannel[i]) % 2;
        if ((i + 1) % 3 === 0) {
            value = value || 1;
        }
        arr.push([i - 255, value]);
    }
    return arr;
}

function onesAmount(str) {
    let count = 0;
    for (let i = 0; i < str.length; i++) {
        if (str[i] === '1') {
            count++;
        }
    }
    return count;
}
// Quant method ends


// Kvazi method starts
const ansamblHeight = 1024,
    g = 45;

function arrayFunction() {
    let resArr = [];
    console.log("ansamblHeight, ansamblWidth:", ansamblHeight, ansamblWidth)
    for (let i = 0; i < ansamblHeight; i++) {
        let a = [];
        for (let j = 0; j < ansamblWidth; j++) {
            let b = getRndInteger(0, 1);
            a.push(b === 0 ? -1 : 1)
        }
        resArr.push(a);
    }
    console.log('arrayFunction: ',  resArr);
    return resArr;
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
// Kvazi method ends


// let header = document.getElementById("menu");
// let btns = header.getElementsByClassName("choice");
// for (let i = 0; i < btns.length; i++) {
//     btns[i].addEventListener("click", function() {
//         let current = document.getElementsByClassName("active");
//         current[0].className = current[0].className.replace(" active", "");
//         this.className += " active";
//     });
// }