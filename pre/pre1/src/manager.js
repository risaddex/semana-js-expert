const Employee = require("./employee");
const Util = require("./util");

class Manager extends Employee {
    #bonuses = 2000
    get bonuses() {
        return Util.formatCurrency(this.#bonuses)
    }
    get netPay() {
        const finalValue =
            Util.unformatCurrency(super.netPay) + Util.unformatCurrency(this.bonuses)
        //netPay + bonuses
        return Util.formatCurrency(finalValue)
    }
}

module.exports = Manager