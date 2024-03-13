function generateNonStandardCPR() {
  const moment = require("moment");

  let randomDate = moment(
    new Date(+new Date() - Math.floor(Math.random() * 10000000000))
  ).format("DD/MM/YY");

  let formattedDate = randomDate.replace("/", "").replace("/", "");

  let random4digits = Math.floor(
    Math.pow(10, 4 - 1) + Math.random() * 9 * Math.pow(10, 4 - 1)
  );

  let randCPR = formattedDate.toString() + random4digits.toString();
  return randCPR;
}

module.exports = generateNonStandardCPR;
