function getISO() {

    let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    let localISOTime = (new Date(Date.now() - tzoffset))

    localISOTime.setUTCHours(0, 0, 0, 0)
    localISOTime.setDate(localISOTime.getDate() + 1)

    return localISOTime.toISOString()
}

function getISONow() {

    let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    let localISOTime = (new Date(Date.now() - tzoffset))
    localISOTime.setMonth(localISOTime.getMonth() + 1)
    localISOTime.setUTCHours(0, 0, 0, 0)

    return localISOTime.toISOString()
}

module.exports = { getISO, getISONow }