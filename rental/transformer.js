/**
 * Простой трансформер для Metro
 */
const { transform } = require('metro-react-native-babel-transformer');
 
module.exports.transform = function({ src, filename, options }) {
  return transform({ src, filename, options });
}; 