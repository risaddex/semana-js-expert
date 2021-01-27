const Request = require("./request")

const DEFAULT_OPTIONS = {
    maxRetries: 4,
    retryTimeout: 1000,
    maxRequestTimeout: 2000, // tempo máximo para retornar req
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

    /**
     Os generators são usados para trabalhar com dados sob demanda
     precisamos anotar a funcção com * e usar o yield para retornar dados sob demanda
     quando usamos o yield { 0 }

     o retorno pode ser { done: false, value: 0 }
     const r = getPaginated()
     r.next() -> { done: false, value: 0 }
     r.next() -> { done: true, value: 0 }

     quando queremos delegar uma execução (não retornar valor, delegar!)

     yield* função
     * 
     */

    async * getPaginated({ url, page }) { // controle do fluxo
        const result = await this.handleRequest({ url, page })
        const lastId =  result[result.length - 1] ? result[result.length - 1].tid : 0 // ? = opcional ?? retorna 0 caso retorne udnefined mesmo depois da tentativa opcional [node 14+]

        //CUIDADO, mais de 1M de requisições
        if(lastId === 0) return;

        yield result
        await Pagination.sleep(this.threshold) // para não causar DDoS no servidor
        yield* this.getPaginated({ url, page: lastId })

    }

}

module.exports = Pagination