let imageDataDCT = ctx.getImageData(0, 0, width, height);
let imagePixels = imageDataDCT.data;

changeHighFrequency();
changeLowFrequency();

/**  SEE HOW TRANSFORM FROM RGB TO YCbCr AND FROM YCbCr TO RGB WORKS **/
// checkYCbCrTransform();

function changeHighFrequency() {
    let contWrapper1 = document.getElementById('canvas1');
    let container12 = document.createElement('canvas');
    container12.id = 'container12';
    contWrapper1.appendChild(container12);
    container12.height = height;
    container12.width = width;
    let ctx12 = container12.getContext('2d');

    let divided = dividePixels(imagePixels);
    let YCbCr = toYCbCrModel(divided); //RGB to YCbCr transform
    let merged = mergePixels(YCbCr);
    console.log(merged);

    let Ychannel = getRedChannel(merged); // getting Y from YCbCr
    let YchannelMatrix = toMatrix(Ychannel);
    console.log(YchannelMatrix)
    let blockedImage = imageToBlock(YchannelMatrix);
    console.log('image in blocks: ', blockedImage);
    console.table(blockedImage[0][0])
    let blockedImageWithDCT = useDCTtoBlocks(blockedImage);
    console.log('blockedImageWithDCT: ', blockedImageWithDCT);
    console.table(blockedImageWithDCT[0][0])
    for (let i = 0; i < blockedImageWithDCT.length; i++) {
        for (let j = 0; j < blockedImageWithDCT[i].length; j++) {
            blockedImageWithDCT[i][j][0][0] += (parseInt((blockedImageWithDCT[i][j][0][0] * 0.3).toString()));
        }
    }
    console.log('blockedImageWithDCT after increasing high frequency: ', blockedImageWithDCT);
    console.table(blockedImageWithDCT[0][0])
    let blockedImageWithIDCT = useIDCTtoBlocks(blockedImageWithDCT);
    console.log('blockedImageWithIDCT: ', blockedImageWithIDCT);
    console.table(blockedImageWithIDCT[0][0])
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

    imageDataDCT.data.set(backToRGBarr);
    ctx12.putImageData(imageDataDCT, 0, 0);
}


function changeLowFrequency() {
    imageDataDCT.data.set(originalPixels);
    console.log(imageDataDCT.data);
    let contWrapper2 = document.getElementById('canvas2');
    /**Отрисовка оригинального канваса **/
    let originCont = document.createElement('canvas');
    let originCtx = originCont.getContext('2d');
    contWrapper2.appendChild(originCont);
    originCont.height = height;
    originCont.width = width;
    originCtx.putImageData(imageDataDCT, 0, 0);
    /**Отрисовка изменённого канваса **/
    let container22 = document.createElement('canvas');
    container22.id = 'container22';
    contWrapper2.appendChild(container22);
    let ctx22 = container22.getContext('2d');
    container22.height = height;
    container22.width = width;

    let divided = dividePixels(imagePixels);
    let YCbCr = toYCbCrModel(divided); //RGB to YCbCr transform
    let merged = mergePixels(YCbCr);
    console.log(merged);

    let Ychannel = getRedChannel(merged); // getting Y from YCbCr
    let YchannelMatrix = toMatrix(Ychannel);
    console.log(YchannelMatrix)
    let blockedImage = imageToBlock(YchannelMatrix);
    console.log('image in blocks: ', blockedImage);
    console.table(blockedImage[0][0])
    let blockedImageWithDCT = useDCTtoBlocks(blockedImage);
    console.log('blockedImageWithDCT: ', blockedImageWithDCT);
    console.table(blockedImageWithDCT[0][0])
    for (let i = 0; i < blockedImageWithDCT.length; i++) {
        for (let j = 0; j < blockedImageWithDCT[i].length; j++) {
            blockedImageWithDCT[i][j][N - 1][N - 1] += blockedImageWithDCT[i][j][N - 1][N - 1];
        }
    }
    console.log('blockedImageWithDCT after increasing high frequency: ', blockedImageWithDCT);
    console.table(blockedImageWithDCT[0][0])
    let blockedImageWithIDCT = useIDCTtoBlocks(blockedImageWithDCT);
    console.log('blockedImageWithIDCT: ', blockedImageWithIDCT);
    console.table(blockedImageWithIDCT[0][0])
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

    imageDataDCT.data.set(backToRGBarr);
    ctx22.putImageData(imageDataDCT, 0, 0);
}
function checkYCbCrTransform(){
    let contWrapper1 = document.getElementById('canvas1');
    let container12 = document.createElement('canvas');
    container12.id = 'container12';
    contWrapper1.appendChild(container12);
    container12.height = height;
    container12.width = width;
    let ctx12 = container12.getContext('2d');

    let divided = dividePixels(imagePixels);
    let YCbCr = toYCbCrModel(divided); //RGB to ECbCr transform
    let merged = mergePixels(YCbCr);
    console.log(merged);

    let div = dividePixels(merged);
    let backToRGB = toRGB(div);
    let backToRGBarr = mergePixels(backToRGB);
    console.log(backToRGBarr);

    imageDataDCT.data.set(backToRGBarr);
    ctx12.putImageData(imageDataDCT, 0, 0);
}