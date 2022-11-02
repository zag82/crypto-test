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

const fileNameSrc = __dirname + '/secret.json';
const fileNameDest = __dirname + '/file.json';
const inData = String(fs.readFileSync(fileNameSrc));
const ini = JSON.parse(inData);

// decryption...
const key = c.scryptSync(pass, salt, alg.bits / 8);
const iv = Uint8Array.from(buf.Buffer.from(ini.pos, 'hex'));
const decipher = c.createDecipheriv(algName, key, iv);

let decrypted = '';
decipher.on('readable', () => {
  let chunk;
  while (null !== (chunk = decipher.read())) {
    decrypted += chunk.toString('utf8');
  }
});
decipher.on('end', () => {
  console.log(decrypted);
  // fs.writeFileSync(fileNameDest, decrypted);
});

const encrypted = ini.line;
decipher.write(encrypted, 'hex');
decipher.end();
