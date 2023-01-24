function hammingEncode(input) {
    if (typeof input !== 'string' || input.match(/[^10]/)) {
        return console.error('hamming-code error: ' +
            'input should be binary string, for example "101010"');
    }

    let output = input;
    let controlBitsIndexes = [];
    let controlBits = [];
    let l = input.length;
    let i = 1;
    let key, j, arr, temp, check;
    while (l / i >= 1) {
        controlBitsIndexes.push(i);
        i *= 2;
    }
    for (j = 0; j < controlBitsIndexes.length; j++) {
        key = controlBitsIndexes[j];
        arr = output.slice(key - 1).split('');
        temp = chunk(arr, key);
        check = (temp.reduce(function (prev, next, index) {
            if (!(index % 2)) {
                prev = prev.concat(next);
            }
            return prev;
        }, []).reduce(function (prev, next) {
            return +prev + +next
        }, 0) % 2) ? 1 : 0;
        output = output.slice(0, key - 1) + check + output.slice(key - 1);
        if (j + 1 === controlBitsIndexes.length && output.length / (key * 2) >= 1) {
            controlBitsIndexes.push(key * 2);
        }
    }

    return output;
}

function hammingPureDecode(input) {
    if (typeof input !== 'string' || input.match(/[^10]/)) {
        return console.error('hamming-code error: input should be binary string, for example "101010"');
    }

    let controlBitsIndexes = [];
    let l = input.length;
    let originCode = input;
    let hasError = false;
    let inputFixed, i;

    i = 1;
    while (l / i >= 1) {
        controlBitsIndexes.push(i);
        i *= 2;
    }
    controlBitsIndexes.forEach(function (key, index) {
        originCode = originCode.substring(0, key - 1 - index) + originCode.substring(key - index);
    });
    return originCode;
}

function hammingDecode(input) {
    if (typeof input !== 'string' || input.match(/[^10]/)) {
        return console.error('hamming-code error: input should be binary string, for example "101010"');
    }
    let controlBitsIndexes = [],
        sum = 0,
        l = input.length,
        i = 1,
        output = hammingPureDecode(input),
        inputFixed = hammingEncode(output);
    while (l / i >= 1) {
        controlBitsIndexes.push(i);
        i *= 2;
    }
    controlBitsIndexes.forEach(function (i) {
        if (input[i] !== inputFixed[i]) {
            sum += i;
        }
    });
    if (sum) {
        output[sum - 1] === '1'
            ? output = replaceCharacterAt(output, sum - 1, '0')
            : output = replaceCharacterAt(output, sum - 1, '1');
    }
    return output;
}


function hammingCheck(input) {
    if (typeof input !== 'string' || input.match(/[^10]/)) {
        return console.error('hamming-code error: input should be binary string, for example "101010"');
    }

    var inputFixed = hammingEncode(hammingPureDecode(input));

    return hasError = !(inputFixed === input);
}


function replaceCharacterAt(str, index, character) {
    return str.substr(0, index) + character + str.substr(index + character.length);
}

function chunk(arr, size) {
    var chunks = [],
        i = 0,
        n = arr.length;
    while (i < n) {
        chunks.push(arr.slice(i, i += size));
    }
    return chunks;
}




/**
 *
 * Тестовый запуск в консоль
 *
 *
let testText = readyTexts[1];
console.log(testText)
testText = convertTextToBinary(testText);
console.log('testText: ', testText, testText.length);
let hammingText = hammingEncode(testText);
console.log('hammingText: ', hammingText, hammingText.length);
let corruptedHamming = hammingText.slice();


let c = 0;
for (let i = 0; i < corruptedHamming.length; i++) {
    if (corruptedHamming[i] !== hammingText[i]) {
        c++;
    }
}
console.log('were changed: ', c);


let decodeHammingText = hammingDecode(corruptedHamming);
let count = 0, prob = 0;
for (let i = 0; i < decodeHammingText.length; i++) {
    if (decodeHammingText[i] === testText[i]) {
        count++;
    }
}
prob = count / testText.length;
console.log(prob);
let decodeTestText = convertBinaryToText(decodeHammingText)
// console.log(decodeTestText)

console.log('\n\t\t\tANOTHER IMPLEMENTATION\n');

let testText2 = readyTexts[2];
testText2 = convertTextToBinary(testText2);
let originText2 = testText2.slice();
testText2 = testText2.match(/.{1,4}/g).toString().replace(/,/g, ' ');
testText2 = testText2.split(' ');
console.log(testText2);

let arr1 = [];
for (let i = 0; i < testText2.length; i++) {
    arr1.push(hammingEncode(testText2[i]));
}
console.log(arr1, arr1.length);
arr1 = arr1.join('')
console.log('text after encoding', arr1, arr1.length);

let arr = arr1.slice();
if (arr[252] === '1'){
    arr = replaceChars2(arr, 252, '0');
} else {
    arr = replaceChars2(arr, 252, '1');
}
if (arr[500] === '1'){
    arr = replaceChars2(arr, 500, '0');
} else {
    arr = replaceChars2(arr, 500, '1');
}

let c2 = 0;
for (let i = 0; i < arr.length; i++) {
    if (arr[i] !== arr1[i]) {
        c2++;
    }
}
console.log('were changed: ', c2);



let arrForDecode = arr.match(/.{1,7}/g).toString().replace(/,/g, ' ').split( ' ');
console.log(arrForDecode);
let res = [];
for (let i = 0; i < arrForDecode.length; i++) {
    res.push(hammingDecode(arrForDecode[i]));
}
console.log(res);
res = res.join('');
console.log(res, res.length)
let count2 = 0, prob2 = 0;
for (let i = 0; i < res.length; i++) {
    if (res[i] === originText2[i]) {
        count2++;
    }
}
prob2 = count2 / testText.length;
console.log(prob);
let decodeText2 = convertBinaryToText(res);

*/




