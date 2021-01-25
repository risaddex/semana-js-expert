const { describe, it, before, afterEach } = require('mocha')
const { expect } = require('chai')
const TodoRepository = require('../src/todoRepository')
const { createSandBox, createSandbox } = require('sinon')

describe('todoRepository', () => {
    let todoRepository
    let sandBox
    before( () => {
        todoRepository = new TodoRepository()
        sandBox = createSandbox()
    })
    afterEach(() => {
        sandBox.restore()
    })
    describe('methods signature', () => {
        it('should call find from lokijs', () => {
            const mockDatabase =  [
                    {
                        name: 'Xuxa da Silva',
                        age: 90,
                        meta: { revision: 0, created: 1611614299812, version: 0 },
                        '$loki': 1
                    },
                ]

              const functionName = "find"
              const expectReturn = mockDatabase
              sandBox.stub(
                  todoRepository.schedule,
                  functionName
              ).returns(expectReturn)

              const result = todoRepository.list()
              expect(result).to.be.deep.equal(expectReturn)
              expect(todoRepository.schedule[functionName].calledOnce).to.be.ok

        })
        it('should call find from lokijs', () => {

        })
        
    }) //01-01-12 
})

