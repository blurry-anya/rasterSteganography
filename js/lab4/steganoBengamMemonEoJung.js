function encode() {
    let input = document.getElementById("message").value;
    input = convertTextToBinary(input);
    console.log(input, input.length);
    let imageData = ctx.getImageData(0, 0, width, height);
    let divided = dividePixels(imageData.data);
    let YCbCr = toYCbCrModel(divided); //RGB to YCbCr transform
    let merged = mergePixels(YCbCr);
    console.log(merged);
    let Ychannel = getRedChannel(merged); // getting Y from YCbCr
    let YchannelMatrix = toMatrix(Ychannel);
    console.log(YchannelMatrix)
    let blockedImage = imageToBlock(YchannelMatrix);
    console.log('image in blocks: ', blockedImage);
    let blockedImageWithDCT = useDCTtoBlocks(blockedImage);
    console.log('blockedImageWithDCT: ', blockedImageWithDCT)

    console.table(blockedImageWithDCT[0][2]);
    let index = 0;
    for (let i = 0; i < Math.min(blockedImageWithDCT.length, input.length); i++) {
        let i2 = parseInt((N / 3).toString()), i1 = i2 + i2, i3 = ((i1 + i2)/2);
        // let i2 = 1, i1 = 2, i3 = 3;
        for (let j = 0; j < blockedImageWithDCT[i].length; j++) {
            if (input[index] === '1') {
                if (blockedImageWithDCT[i][j][i3][i3] > 0) {
                    blockedImageWithDCT[i][j][i3][i3] = Math.max(Math.abs(blockedImageWithDCT[i][j][i2][i1]), Math.abs(blockedImageWithDCT[i][j][i1][i2])) + Pr;
                } else {
                    blockedImageWithDCT[i][j][i3][i3] = -Math.max(Math.abs(blockedImageWithDCT[i][j][i2][i1]), Math.abs(blockedImageWithDCT[i][j][i1][i2])) + Pr;
                }
                index++;
            } else {
                if (blockedImageWithDCT[i][j][i3][i3] > 0) {
                    blockedImageWithDCT[i][j][i3][i3] = Math.min(Math.abs(blockedImageWithDCT[i][j][i2][i1]), Math.abs(blockedImageWithDCT[i][j][i1][i2])) - Pr;
                } else {
                    blockedImageWithDCT[i][j][i3][i3] = -Math.min(Math.abs(blockedImageWithDCT[i][j][i2][i1]), Math.abs(blockedImageWithDCT[i][j][i1][i2])) - Pr;
                }
                index++;
            }
        }

    }
    console.log('index: ', index);
    console.table(blockedImageWithDCT[0][2]);

    let blockedImageWithIDCT = useIDCTtoBlocks(blockedImageWithDCT);
    console.log('blockedImageWithIDCT: ', blockedImageWithIDCT);
    let changedYchannel = flatBlocked(blockedImageWithIDCT);

    console.log('changedYchannel: ', changedYchannel)
    for (let i = 0, index = 0; i < merged.length; i++) {//write changes to YCbCr arr
        if (i % 4 === 0) {
            merged[i] = changedYchannel[index];
            index++;
        }
    }
    let div = dividePixels(merged);
    let backToRGB = toRGB(div);
    let backToRGBarr = mergePixels(backToRGB);
    console.log(backToRGBarr);
    imageData.data.set(backToRGBarr);
    ctx.putImageData(imageData, 0, 0);
    alert("Your data was successfully encoded!");
}


let decode = function () {
    let tmp = document.getElementsByClassName('input-wrapper');
    console.log(tmp[0].children.length);
    let output;
    if (tmp[0].children.length <= 2) {
        output = document.createElement('textarea');
        output.id = 'messageOutput';
        tmp[0].appendChild(output);
    } else {
        output = document.getElementById('messageOutput');
    }
    let decodeImageData = ctx.getImageData(0, 0, width, height);
    console.log('imageData for decoing: ', decodeImageData.data)

    let divided = dividePixels(decodeImageData.data);
    let YCbCr = toYCbCrModel(divided); //RGB to YCbCr transform
    let merged = mergePixels(YCbCr);
    console.log('image in YCbCr: ', merged);
    let Ychannel = getRedChannel(merged); // getting Y from YCbCr
    let YchannelMatrix = toMatrix(Ychannel);
    let blockedImage = imageToBlock(YchannelMatrix);
    console.log('YCbCr image in blocks: ', blockedImage);
    let blockedImageWithDCT = useDCTtoBlocks(blockedImage);
    console.log('YCbCr with DCT: ', blockedImageWithDCT)
    let mess = [];
    let i1 = parseInt((N / 3).toString()), i2 = i1 + i1, i3 = ((i1 + i2)/2);
    // let i2 = 1, i1 = 2, i3 = 3;
    for (let i = 0; i < blockedImageWithDCT.length; i++) {
        for (let j = 0; j < blockedImageWithDCT[i].length; j++) {
            if (blockedImageWithDCT[i][j][i3][i3] > Math.max(Math.abs(blockedImageWithDCT[i][j][i2][i1]), Math.abs(blockedImageWithDCT[i][j][i1][i2]))){
                mess.push('1');
            } else {
                mess.push('0');
            }
        }
    }
    console.log(mess.join(''))
    output.innerText += convertBinaryToText(mess.join(''));
}

let decodeBtn = document.getElementById('decodebtn');
decodeBtn.addEventListener('click', decode);