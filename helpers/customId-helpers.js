const customId = (length = 5, firstletter = '') => {
    let inputs = '123456789ABCDEFGHJKLMNOPQRSTUVWXYZ'
    // function create_random_id(sting_length) {

    let randomString = '';
    // var inputs = '123456789'
    for (var i, i = 0; i < length; i++) {
        randomString += inputs.charAt(Math.floor(Math.random() * inputs.length))
    }
    return firstletter + randomString

    // }
    // create_random_id(5)
}

module.exports = { customId }