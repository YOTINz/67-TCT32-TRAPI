/*const md5 = require("md5");
const salt ="";
module.exports = {
  async beforeCreate(event) {
    event.params.data.Phone = md5(event.params.data.Phone)
  },
  async afterCreate(event) {
    console.log('beforeCreate is worked....', event.params.data);
  }
  
};
*/
const crypto = require('crypto');
const md5 = require('md5');

const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.SECRET_KEY); // Should be a 32-byte key for aes-256
const iv = process.env.SECRET_IV; // Should be a 16-byte IV for aes-256-cbc


const encryptedPhone = (Phone) => {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encryptedPhone = cipher.update(Phone, 'utf8', 'hex');
  encryptedPhone += cipher.final('hex');
 // Pad the encrypted phone number to ensure it's at least 128 characters long
  encryptedPhone = padToLength(encryptedPhone, 128);

  return encryptedPhone;
};

const decryptPhone = (encryptedPhone) => {
  encryptedPhone = removePadding(encryptedPhone);
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let Phone = decipher.update(encryptedPhone, 'hex', 'utf8');
  Phone += decipher.final('utf8');

  return Phone;
};

// Custom padding function to ensure fixed length
const padToLength = (string, length) => {
  if (string.length >= length) return string; // No need to pad
  const paddingLength = length - string.length;
  const padding = crypto.randomBytes(paddingLength).toString('hex');
  return string+padding;
};

// Custom function to remove padding
const removePadding = (string) => {
  const paddingLength = 32; // Number of characters to remove
  if (string.length > paddingLength) {
    return string.slice(0, paddingLength); // Remove trailing characters
  } else {
    return string; // No padding to remove
  }
};


module.exports = {
  async beforeCreate(event) {
    console.log('beforeCreate', event.params);
    event.params.data.Phone = encryptedPhone(event.params.data.Phone);
  },
  async beforeUpdate(event) {
    console.log('beforeUpdate', event.params.data);
    event.params.data.Phone = encryptedPhone(event.params.data.Phone);
  },
  async afterFindMany(event) {
    console.log('afterFindMany', event.result);
    event.result.forEach(item => {
      if (item.Phone) {
        item.Phone = decryptPhone(item.Phone);
        console.log('afterFindMany :', item.Phone);
      }
    });
  },
  async afterFindOne(event) {
    console.log('afterFindOne', event.result);
    if (event.result && event.result.Phone) {
      event.result.Phone = decryptPhone(event.result.Phone);
      console.log('afterFindOne :', event.result.Phone);
    }
  },
};
