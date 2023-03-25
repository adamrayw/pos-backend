function getISONow() {
    let localTime = new Date();
    let options = { timeZone: 'Asia/Jakarta' };
    let indonesiaTime = new Date(localTime.toLocaleString('en-US', options));

    return indonesiaTime
}

function getISOStartMonth() {
    let localTime = new Date();
    let options = { timeZone: 'Asia/Jakarta' };
    let indonesiaTime = new Date(localTime.toLocaleString('en-US', options));
    indonesiaTime.setUTCHours(0, 0, 0, 0)
    indonesiaTime.setDate('1')

    return indonesiaTime
}

function getISOEndMonth() {
    let localTime = new Date();
    let options = { timeZone: 'Asia/Jakarta' };
    let indonesiaTime = new Date(localTime.toLocaleString('en-US', options));
    indonesiaTime.setUTCHours(23, 59, 59, 59)
    indonesiaTime.setDate('1')

    return indonesiaTime
}

module.exports = { getISONow, getISOStartMonth, getISOEndMonth }