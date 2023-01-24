const N = 8,
    Pr = 15;

function initC() {
    let c = new matrix(N, N);
    for (let i = 1; i < N; i++) {
        for (let j = 1; j < N; j++) {
            c[i][j] = 1;
        }
    }
    for (let i = 0; i < N; i++) {
        c[i][0] = 1 / Math.sqrt(2.0);
        c[0][i] = 1 / Math.sqrt(2.0);
    }
    c[0][0] = 0.5;
    return c;
}

let c = initC();
console.log(c);


function directDCT(inputData) {
    let outputData = new matrix(N, N);
    for (let u = 0; u < N; u++) {
        for (let v = 0; v < N; v++) {
            let sum = 0.0;
            for (let x = 0; x < N; x++) {
                for (let y = 0; y < N; y++) {
                    sum += inputData[x][y] * Math.cos(((2 * x + 1) / (2.0 * N)) * u * Math.PI) * Math.cos(((2 * y + 1) / (2.0 * N)) * v * Math.PI);
                }
            }
            sum *= c[u][v] / 4.0;
            outputData[u][v] = Math.sign(parseInt(sum.toString())) === -0 ? 0 : parseInt(sum.toString());
        }
    }
    return outputData;
}

function inverseDCT(inputData) {
    let outputData = new matrix(N, N);
    for (let x = 0; x < N; x++) {
        for (let y = 0; y < N; y++) {
            let sum = 0.0;
            for (let u = 0; u < N; u++) {
                for (let v = 0; v < N; v++) {
                    sum += c[u][v] * inputData[u][v] * Math.cos(((2 * x + 1) / (2.0 * N)) * u * Math.PI) * Math.cos(((2 * y + 1) / (2.0 * N)) * v * Math.PI);
                }
            }
            sum /= 4.0;
            outputData[x][y] = parseInt(sum.toString());
            if (outputData[x][y] > 255) outputData[x][y] = 255;
            if (outputData[x][y] < 0) outputData[x][y] = 0;
        }
    }
    return outputData;
}

function toYCbCrModel(pixelsRGB) {
    let YCbCrModel = [];
    for (let i = 0; i < pixelsRGB.length; i++) {
        YCbCrModel.push([
            parseInt((0.299 * pixelsRGB[i][0] + 0.587 * pixelsRGB[i][1] + 0.114 * pixelsRGB[i][2]).toString()),
            parseInt((-0.169 * pixelsRGB[i][0] - 0.331 * pixelsRGB[i][1] + 0.5 * pixelsRGB[i][2] + 128).toString()),
            parseInt((.5 * pixelsRGB[i][0] - 0.4187 * pixelsRGB[i][1] - 0.081 * pixelsRGB[i][2] + 128).toString())
        ]);
    }
    return YCbCrModel;
}

function toRGB(pixelsYCbCr) {
    let RGBmodel = [];
    for (let i = 0; i < pixelsYCbCr.length; i++) {
        RGBmodel.push([
            parseInt(((pixelsYCbCr[i][0] + 1.402 * (pixelsYCbCr[i][2] - 128))).toString()),
            parseInt(((pixelsYCbCr[i][0] - 0.33414 * (pixelsYCbCr[i][1] - 128) - 0.71414 * (pixelsYCbCr[i][2] - 128))).toString()),
            parseInt(((pixelsYCbCr[i][0] + 1.772 * (pixelsYCbCr[i][1] - 128))).toString())
        ]);
    }
    return RGBmodel;
}


/** transform arr to matrix **/
function toMatrix(input) {
    let redMatrix = [];
    for (let i = 0; i < height; i++) {
        let tmp = [];
        for (let j = 0; j < width; j++) {
            tmp.push(input[i * width + j]);
        }
        redMatrix.push(tmp);
    }
    return redMatrix;
}

function imageToBlock(image) {
    let nn = height / N, mm = width / N;
    let r = new matrix(nn, mm);
    for (let x = 0; x < mm; x++) {
        for (let y = 0; y < nn; y++) {
            let RR = new matrix(N, N);
            for (let i = 0; i < N; i++) {
                for (let j = 0; j < N; j++) {
                    RR[i][j] = image[i + x * N][j + y * N];
                }
            }
            r[x][y] = RR;
        }
    }
    return r;
}

function useDCTtoBlocks(blockedImage) {
    let nn = height / N, mm = width / N, blockDCT = new matrix(nn, mm);
    for (let i = 0; i < mm; i++) {
        for (let j = 0; j < nn; j++) {
            blockDCT[i][j] = directDCT(blockedImage[i][j])
        }
    }
    return blockDCT;
}

function useIDCTtoBlocks(input) {
    let nn = height / N, mm = width / N, blockDCT = new matrix(nn, mm);
    for (let i = 0; i < mm; i++) {
        for (let j = 0; j < nn; j++) {
            blockDCT[i][j] = inverseDCT(input[i][j])
        }
    }
    return blockDCT;
}

function flatBlocked(input) {
    let output = [];
    for (let i = 0; i < input.length; i++) {
        let tmp = input[i];
        for (let j = 0; j < N; j++) {
            for (let k = 0; k < tmp.length; k++) {
                output.push(tmp[k][j])
            }
        }
    }
    return output.flat();
}