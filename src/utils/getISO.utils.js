function getISONow() {

    let localTime = new Date();
    let options = { timeZone: 'Asia/Jakarta' };
    const date = new Date(localTime.toLocaleString('en-US', options));

    return date
}

module.exports = getISONow 