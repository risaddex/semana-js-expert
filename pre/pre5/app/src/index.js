// https://www.mercadobitcoin.net/api/BTC/trades/?tid=5704
const Pagination = require('./pagination')

;(async () => {
    const pagination = new Pagination()

    const firsPage = 770e3
    const req = pagination.getPaginated({
        url: 'https://www.mercadobitcoin.net/api/BTC/trades/',
        page: firsPage
    })
    for await (const items of req) {
        console.table(items)
    }
})()
