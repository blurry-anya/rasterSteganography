const k = 7,
    g = 2;


function generateHadamardMatrix(n) {
    let size = parseInt(Math.pow(n, 2).toString());
    let hadamard = matrix(size, size);
    hadamard[0][0] = 1;
    for (let k = 1; k < size; k += k) {
        for (let i = 0; i < k; i++) {
            for (let j = 0; j < k; j++) {
                hadamard[i + k][j] = hadamard[i][j];
                hadamard[i][j + k] = hadamard[i][j];
                hadamard[i + k][j + k] = -hadamard[i][j];
            }
        }
    }
    // console.log('generated Hadamard matrix: ')
    // console.table(hadamard);
    return hadamard;
}

function sum(m, k, hadamard, g) {
    let sum = new matrix(hadamard.length, hadamard.length);
    for (let i = 0; i < hadamard.length; i++) {
        let a = new myArray(hadamard.length);
        for (let j = 0; j < k; j++) {
            let arr = [];
            arr.length = hadamard.length;
            arrayCopy(hadamard[j + 1], 0, arr, 0, hadamard.length);
            for (let l = 0; l < arr.length; l++) {
                arr[l] *= (((i * k + j) < m.length) ? m[i * k + j] * g : 0);
                a[l] += arr[l];
            }
        }
        arrayCopy(a, 0, sum[i], 0, a.length);
    }
    console.table(sum);
    return sum;
}

function transformToSignal(str) {

    let inputArr = [];
    for (let i = 0; i < str.length; i++) {
        inputArr.push(parseInt((str[i] === '0' ? -1 : 1).toString()));
    }
    return inputArr;
}


function encode() {
    let input = document.getElementById("message").value;
    // let input = readyTexts[1];
    input = convertTextToBinary(input);
    console.log(input);
    let imageData = ctx.getImageData(0, 0, width, height);
    let n = parseInt(log2(Math.min(height, width)).toString());
    console.log('size of n ', n)
    let hadamard = generateHadamardMatrix(n);
    console.log('MULTSTRING OF ORTHOGONAL', multString(hadamard[0], hadamard[1]));
    input = transformToSignal(input)
    let tmp = sum(input, k, hadamard, g);
    console.log('MULTSTRING OF SUM & WALSH', multString(tmp[5], hadamard[18]));
    let imagePixels = dividePixels(imageData.data);
    for (let i = 0; i < hadamard.length; i++) {
        for (let j = 0; j < hadamard.length; j++) {
            let color = getRGB(imagePixels, i * hadamard.length + j);
            // console.log('old red: ', color[0], '+', tmp[i][j]);
            let newRed = color[0] + tmp[i][j];
            // console.log('new red: ', newRed);
            if (newRed > 255) newRed = 255;
            if (newRed < 0) newRed = 0;
            imagePixels = setRGB(imagePixels, i * hadamard.length + j, newRed, color[1], color[2]);
        }
    }
    imagePixels = mergePixels(imagePixels);
    for (let i = 0; i < imageData.data.length; i++) {
        imageData.data[i] = imagePixels[i];
    }
    console.log('imageData after change', imageData.data)


    setTimeout(() => ctx.putImageData(imageData, 0, 0), 1000);
    alert("Your data was successfully encoded!");
}


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
    console.log('imageData for decoing: ', decodeImageData.data)
    let n = parseInt(log2(Math.min(height, width)).toString());
    console.log('size of n ', n);
    let hadamard = generateHadamardMatrix(n);

    let decodeImageDataArr = dividePixels(decodeImageData.data);

    let arrayString = []; //array of divided RED colors
    for (let i = 0; i < hadamard.length; i++) {
        let arrRed = [];//array of RED
        for (let j = 0; j < hadamard.length; j++) {
            arrRed.push(getRGB(decodeImageDataArr, i * hadamard.length + j)[0]);
        }
        arrayString.push(arrRed);
    }
    console.log(arrayString)
    let outputSignal = [];
    for (let i = 0; i < hadamard.length; i++) {
        for (let j = 0; j < k; j++) {
            outputSignal.push(multString(arrayString[i], hadamard[j + 1]) > 0 ? '1' : '0');
        }
    }
    // console.table(outputSignal);
    let mess = outputSignal.concat().join('');
    console.log(convertBinaryToText(mess));

    output.innerText += convertBinaryToText(mess);

}

function log2(n) {
    return parseInt((Math.log(n) / Math.log(2)).toString());
}

let decodeBtn = document.getElementById('decodebtn');
decodeBtn.addEventListener('click', decode);
