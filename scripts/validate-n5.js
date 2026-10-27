const path = require('path');
const target = require(path.resolve(__dirname, '../../scripts/validate-n5.js'));
module.exports = target;

if (require.main === module) {
  target.runValidation().then(({ errors }) => {
    if (errors.length > 0) {
      process.exit(1);
    }
    process.exit(0);
  }).catch(err => {
    console.error('Fatal error during validation:', err);
    process.exit(1);
  });
}
