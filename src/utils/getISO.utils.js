function getISONow() {
    let localTime = new Date();
    let options = { timeZone: 'Asia/Jakarta' };
    let indonesiaTime = new Date(localTime.toLocaleString('en-US', options));

    return indonesiaTime
}

module.exports = getISONow