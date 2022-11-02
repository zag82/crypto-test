#!/usr/bin/env node

const fs = require('fs');
const c = require('crypto');
const buf = require('buffer');
const { alg, pass, salt } = require('./config.json');
const algName = `${alg.family}-${alg.bits}-${alg.type}`;
// configuration data (sample from ./config.json)
// {
//   "alg": {
//     "family": "aes",
//     "type": "cbc",
//     "bits": 192
//   },
//   "pass": "My super secret password",
//   "salt": "salt"
// }

const fileNameSrc = __dirname + '/file.json';
const fileNameDest = __dirname + '/secret.json';
const inData = String(fs.readFileSync(fileNameSrc));
console.log('Input data:', inData);

// encryption...
const key = c.scryptSync(pass, salt, alg.bits / 8);
const iv = c.randomFillSync(new Uint8Array(16));
const cipher = c.createCipheriv(algName, key, iv);

let encrypted = '';
cipher.setEncoding('hex');

cipher.on('data', (chunk) => (encrypted += chunk));
cipher.on('end', () => {
  const res = {
    line: encrypted,
    pos: buf.Buffer.from(iv).toString('hex')
  };
  fs.writeFileSync(fileNameDest, JSON.stringify(res, null, 2));
});

cipher.write(inData);
cipher.end();
