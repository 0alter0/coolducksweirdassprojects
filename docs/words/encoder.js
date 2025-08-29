const chars = {
    " ": 27,
    ".": 28,
    ",": 29,
    "'": 30,
    "?": 31
};
const dchars = {
    27: " ",
    28: ".",
    29: ",",
    30: "'",
    31: "?"
};

function encodeString(str, key = 0) {
    let encWords = [];
    let nonce = Math.floor(Math.random() * 1048576);
    encWords.push(words[nonce ^ 0x4F6]);
    const input = str.toLowerCase();
    for (let i = 0; i < input.length; i += 3) {
        const ind = (encodeChar(input[i + 2]) << 10 | encodeChar(input[i + 1]) << 5 | encodeChar(input[i])) ^ key ^ (nonce++ & 0xFFFFF);
        encWords.push(words[ind]);
    }
    return encWords.join(" ");
}

function decodeString(str, key = 0) {
    const encWords = str.split(" ");
    let output = "";
    let nonce = decodeWords[encWords[0]] ^ 0x4F6;
    for (let i = 1; i < encWords.length; i++) {
        const word = decodeWords[encWords[i]];
        if (!word) {
            output += "|||";
        } else {
            const ind = word ^ key ^ (nonce++ & 0xFFFFF);
            output += decodeChar(ind & 31) + decodeChar(ind >> 5 & 31) + decodeChar(ind >> 10 & 31);
        }
    }
    return output;
}

function encodeRawBinary(data, key = 0) {
    let encWords = [];
    let nonce = Math.floor(Math.random() * 1048576);
    encWords.push(words[nonce ^ 0x2FA]);
    const byteData = new Uint8Array(data);
    let buffer = 0;
    let bitCount = 0;
    for (let i = 0; i < byteData.length; i++) {
        buffer |= byteData[i] << bitCount;
        bitCount += 8;
        while (bitCount >= 20) { 
            encWords.push(words[(buffer & 0xFFFFF) ^ key ^ (nonce++ & 0xFFFFF)]);
            buffer >>= 20;
            bitCount -= 20;
        }
    }
    if (bitCount > 0) {
        encWords.push(words[(buffer & 0xFFFFF) ^ key ^ (nonce++ & 0xFFFFF)]);
    }
    return encWords.join(" ");
}

function decodeRawBinary(str, key = 0) {
    const data = str.split(" ");
    let nonce = decodeWords[data[0]] ^ 0x2FA;
    const encData = data.slice(1).map(e => decodeWords[e] ^ key ^ (nonce++ & 0xFFFFF));
    return wordDataToBytes(encData);
}

function wordDataToBytes(wordData) {
    let bytes = [];
    let buffer = 0;
    let bitCount = 0;
    for (let i = 0; i < wordData.length; i++) {
        buffer |= wordData[i] << bitCount;
        bitCount += 20;
        while (bitCount >= 8) {
            bytes.push(buffer & 0xFF);
            buffer >>= 8;
            bitCount -= 8;
        }
    }
    if (bitCount > 0) {
        bytes.push(buffer & 0xFF);
    }
    return bytes;
}

function decodeChar(i) {
    if (i == 0) return "";
    if (i >= 1 && i <= 26) return String.fromCharCode(96 + i);
    return dchars[i] ? dchars[i] : "|";
}

function encodeChar(i) {
    if (!i) return 0;
    const val = i.charCodeAt();
    if (val >= 97 && val <= 122) return val - 96;
    return chars[i] ? chars[i] : 0;
}

