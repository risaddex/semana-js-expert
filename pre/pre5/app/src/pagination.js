const Request = require("./request")

const DEFAULT_OPTIONS = {
    maxRetries: 4,
    retryTimeout: 1000,
    maxRequestTimeout: 1000, // tempo máximo para retornar req
    threshold: 200 // tempo de intervalo entre uma req e outra
}

class Pagination {
    //configurações da paginação
    constructor(options = DEFAULT_OPTIONS) {
        this.request = new Request
        
        this.maxRetries = options.maxRetries
        this.retryTimeout = options.retryTimeout
        this.maxRequestTimeout = options.maxRequestTimeout
        this.threshold = options.threshold
    }
    async handleRequest({ url, page, retries = 1 }) { //retries será atualizado recursivamente
        try {
            const finalUrl = `${url}?tid=${page}`
            const result = await this.request.makeRequest({
            url: finalUrl,
            method: 'get',
            timeout: this.maxRequestTimeout
         })

            return result
            
        } catch (error) {
            if(retries === this.maxRetries) { // testes da 1ª asserção
                console.error(`[${retries}] max retries reached!`)
                throw error
            }
            
            console.error(`[${retries}] an error: [${error.message}] has happened! trying again in ${this.retryTimeout}ms`)
            await Pagination.sleep(this.retryTimeout)
            // atualiza o numero de tentativas caso dê erro novamente
            return this.handleRequest({ url, page, retries: retries += 1})
        }
        
    }
    static async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
    async getPaginated({ url, page }) { // controle do fluxo

    }

}

module.exports = Pagination