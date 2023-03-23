function getISO() {

    let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    let localISOTime = (new Date(Date.now() - tzoffset))

    localISOTime.setUTCHours(0, 0, 0, 0)
    localISOTime.setDate(localISOTime.getDate())

    return localISOTime.toISOString()
}

function getISONow() {

    let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    let localISOTime = (new Date(Date.now() - tzoffset)).toISOString()

    return localISOTime
}

module.exports = { getISO, getISONow }