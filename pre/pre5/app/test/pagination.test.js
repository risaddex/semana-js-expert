const { describe, it, before, afterEach } = require('mocha')
const assert = require('assert')
const { createSandbox } = require('sinon')
const Pagination = require('../src/pagination')


// #####IMPORTANT##### 
// stub é um pedaço de código utilizado para preencher uma lacuna temporária (como simular uma conexão com DB, etc...)
// #####IMPORTANT##### 
describe('Pagination tests', () => {
    let sandbox
    before(() => {
        sandbox = createSandbox()
    })

    afterEach(() => sandbox.restore())

    describe('#Pagination', () => { //casos de erro 1º, -> casos de sucesso

        it('#sleep should be a Promise and not return values', async () => {
            
            const clock = sandbox.useFakeTimers() // gera um timeout fake
            const time = 1
            const pendingPromise = Pagination.sleep(time)
            clock.tick(time)

            assert.ok(pendingPromise instanceof Promise)
            const result = await pendingPromise
            assert.ok(result === undefined)
        })

        describe('#handleRequest', () => {

        
            it('should retry an request twice before throwing an exception and validate request params and flow', async () => {
                const expectedCallCount = 2
                const expectedTimeout = 10

                const pagination = new Pagination()
                pagination.maxRetries = expectedCallCount
                pagination.retryTimeout = expectedTimeout
                pagination.maxRequestTimeout = expectedTimeout

                const error = new Error("timeout")
                sandbox.spy(pagination, pagination.handleRequest.name) // espionar quantas requisções foram passadas
                sandbox.stub(
                    Pagination,
                    Pagination.sleep.name
                ).resolves() // faz a promise retornar resolve
            
                sandbox.stub(
                    pagination.request,
                    pagination.request.makeRequest.name
                ).rejects(error)


                const dataRequest = { url: 'https://google.com' , page: 0 }
                await assert.rejects(pagination.handleRequest(dataRequest), error) //caso de erro promise
                assert.deepStrictEqual(pagination.handleRequest.callCount, expectedCallCount)
                
                const lastCall = 1
                const firstCallArg = pagination.handleRequest.getCall(lastCall).firstArg
                const firstCallRetries = firstCallArg.retries
                assert.deepStrictEqual(firstCallRetries, expectedCallCount)

                const expectedArgs = {
                    url: `${dataRequest.url}?tid=${dataRequest.page}`,
                    method: 'get',
                    timeout: expectedTimeout
                }
                const firstCallArgs = pagination.request.makeRequest.getCall(0).args //getCall retorna a Enésima chamada da f.
                assert.deepStrictEqual(firstCallArgs, [expectedArgs])

                assert.ok(Pagination.sleep.calledWithExactly(expectedTimeout))

            })

            it('should return data from request when succeded', async () => {
                const data = { result: 'ok'}
                const pagination = new Pagination()
                sandbox.stub(
                    pagination.request,
                    pagination.request.makeRequest.name,
                ).resolves(data)

                const result = await pagination.handleRequest({ url: 'https://google.com', page: 1 })
                assert.deepStrictEqual(result, data)
            })

        })

        describe('#getPaginated', () => {
            const responseMock = [
                {
                    "tid":5705,
                    "date":1373123005,
                    "type":"sell",
                    "price":196.52,
                    "amount":0.01
                },
                {
                    "tid":5706,
                    "date":1373124523,
                    "type":"buy",
                    "price":200,
                    "amount":0.3
                }
            ]

            it('should udpdate request id on each request', async () => {
                const pagination = new Pagination()
                sandbox.stub(
                    Pagination,
                    Pagination.sleep.name
                ).resolves() // faz a promise retornar resolve
            
                sandbox.stub(
                    pagination,
                    pagination.handleRequest.name
                )
                    .onCall(0).resolves([responseMock[0]])
                    .onCall(1).resolves([responseMock[1]])
                    .onCall(2).resolves([])
                
                sandbox.spy(pagination, pagination.getPaginated.name)
                const data = { url: 'google.com', page: 1 }

                const secondCallExpectation = {
                    ...data,
                    page: responseMock[0].tid
                }

                const thirdCallExpectation = {
                    ...secondCallExpectation,
                    page: responseMock[1].tid
                }

                // para chamar uma função que é um generator
                // Array.from(pagination.getPaginated()) => dessa forma ele não espera os dados sob demanda!
                // ele vai guardar tudo em memória e só depois jogar no array

                // const r=  pagination.getPaginated()
                // r.next() => { done: true | false, value: {} }
                // a melhor forma é usar o for of
                const gen = pagination.getPaginated(data)
                for await (const result of gen) { }

                const getFirstArgFromCall = value => pagination.handleRequest.getCall(value).firstArg
                assert.deepStrictEqual(getFirstArgFromCall(0), data)
                assert.deepStrictEqual(getFirstArgFromCall(1), secondCallExpectation)
                assert.deepStrictEqual(getFirstArgFromCall(2), thirdCallExpectation)
            })
            it('shoulds stop request when request return an empty array', async () => {
                const expectedThresHold = 20
                const pagination = new Pagination()
                pagination.threshold = expectedThresHold
                sandbox.stub(
                    Pagination,
                    Pagination.sleep.name
                ).resolves() // faz a promise retornar resolve
            
                sandbox.stub(
                    pagination,
                    pagination.handleRequest.name
                )
                    .onCall(0).resolves([responseMock[0]])
                    .onCall(1).resolves([])
                
                sandbox.spy(pagination, pagination.getPaginated.name)

                const data = { url: 'google.com', page: 1 }
                const iterator = await pagination.getPaginated(data)
                const [firstResult, secondResult] = await Promise.all([
                    iterator.next(),
                    iterator.next(),
                ])

                const expectedFirstCall = { done: false, value: [responseMock[0]]}
                assert.deepStrictEqual(firstResult, expectedFirstCall)
                
                const expectedSecondCall = { done: true, value: undefined}
                assert.deepStrictEqual(secondResult, expectedSecondCall)

                assert.deepStrictEqual(Pagination.sleep.callCount, 1)
                assert.ok(Pagination.sleep.calledWithExactly(expectedThresHold))
            })
        })
    })
})