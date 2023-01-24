

let ansamblWidth;

let arrayFunction1;

function split10blockMessage(arr) {
    let resDesArr = [];
    for (let i = 0; i < arr.length / 10; i++) {
        /** let a = [];*/
        let a = 0;//способ с методички
        for (let j = 0; j < 10; j++) {
            if (typeof arr[10 * i + j] === 'undefined') {
                // console.log(10 * i + j, arr[10 * i + j])
                arr[i * 10 + j] = 0;
                continue;
            }
            a += arr[10 * i + j] * parseInt((Math.pow(2, j).toString())) //способ с методички
            /** a.push(arr[i * 10 + j]);*/

        }
        // console.table(a);
        /** resDesArr.push(parseInt(a.join(''), 2));*/
        resDesArr.push(a);//способ с методички
    }
    return resDesArr;
}

function sum(md, g, arrayFunction) {
    let sum = [];
    for (let i = 0; i < height; i++) {
        if (i === md.length) {
            console.log('i === md.length', i, md.length);
            break;
        }
        sum.push(arrayFunction[md[i]].map(item => g * item));
    }
    console.log('SUM: ', sum);
    // console.table(sum)
    return sum;
}

function encode() {
    let input = document.getElementById("message").value;
    // let input = readyTexts[1];
    input = convertTextToBinary(input);
    console.log('binaryInput: ', input)
    let transInput = split10blockMessage(input);
    console.log('сообщение, преобразованное блоками в десят число', transInput);
    let sum1 = sum(transInput, g, arrayFunction1);

    let imageData = ctx.getImageData(0, 0, width, height);

    let imagePixels = dividePixels(imageData.data);
    console.log('imageData origin: ', imageData.data)

    let redChannel = getRedChannel(imageData.data);
    let arrayString = [];
    for (let i = 0; i < height; i++) {
        let a = [];
        for (let j = 0; j < ansamblWidth; j++) {
            a.push(redChannel[i * ansamblWidth + j]);
        }
        arrayString.push(a);
    }
    let c = 0;
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            if (i < sum1.length) {
                let newRed = arrayString[i][j] + sum1[i][j];
                if (newRed > 255) newRed = 255;
                if (newRed < 0) newRed = 0;
                arrayString[i][j] = newRed;
                c++;
            }

        }

    }
    console.log('Written ', c)
    console.log('изменённый канал красного ', arrayString.flat())
    let newRedChannel = arrayString.flat();
    for (let i = 0, index = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = newRedChannel[index]; // red
        index++;
    }

    console.log('imageData after change', imageData.data)
    setTimeout(() => ctx.putImageData(imageData, 0, 0), 1000);
    alert("Your data was successfully encoded!");
}

// encode();

let decode = function () {
    let tmp = document.getElementsByClassName('input');
    let output;
    console.log(tmp);
    if (tmp[0].children.length === 1) {
        output = document.createElement('textarea');
        output.id = 'messageOutput';
        tmp[0].appendChild(output);
    } else {
        output = document.getElementById('messageOutput');
    }
    let decodeImageData = ctx.getImageData(0, 0, width, height);
    console.log('imageData for decoding: ', decodeImageData.data)
    let redChannel = getRedChannel(decodeImageData.data);
    let arrayString = [];
    for (let i = 0; i < height; i++) {
        let a = [];
        for (let j = 0; j < ansamblWidth; j++) {
            a.push(redChannel[i * ansamblWidth + j]);
        }
        arrayString.push(a);
    }
    console.log(arrayString)
    let md1 = [];
    for (let i = 0; i < height; i++) {
        let a = 0;
        for (let j = 0; j < ansamblHeight; j++) {
            if (multString(arrayString[i], arrayFunction1[j]) > a) {
                a = multString(arrayString[i], arrayFunction1[j]);
                // console.log(i, multString(arrayString[i], arrayFunction1[j]));
                md1[i] = j;
            }
        }
    }
    console.log(md1);
    let messBinary = [];
    for (let i = 0; i < md1.length; i++) {
        let a = md1[i];
        for (let j = 0; j < 10; j++) {
            messBinary[i * 10 + j] = Math.trunc(a % 2);
            a /= 2;
        }
    }
    console.log(messBinary.join(''));
    output.innerText += convertBinaryToText(messBinary.join(''));


}

let decodeBtn = document.getElementById('decodebtn');
decodeBtn.addEventListener('click', decode);

