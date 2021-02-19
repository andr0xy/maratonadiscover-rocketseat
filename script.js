const Modal = {
    toggle() {
        document.querySelector('.modal-overlay').classList.toggle('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem('dev.finances:transactions')) || []
    },
    set(transactions) {
        localStorage.setItem('dev.finances:transactions', JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),
    add(transaction) {
        Transaction.all.push(transaction)
        App.reload()
    },
    remove(index) {
        Transaction.all.splice(index, 1)
        App.reload()
    },
    incomes() {
        const allIncomes = Transaction.all.reduce((total, current) => {
            if (current.amount > 0) {
                total += current.amount
            }

            return total
        }, 0)

        return allIncomes
    },
    expenses() {
        const allExpenses = Transaction.all.reduce((total, current) => {
            if (current.amount < 0) {
                total += current.amount
            }

            return total
        }, 0)

        return allExpenses
    },
    total() {
        return Transaction.incomes() + Transaction.expenses()
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
        DOM.updateBalance()
    },
    innerHTMLTransaction(transaction, index) {
        const { description, amount, date } = transaction
        const CSSClass = amount < 0 ? "expense" : "income"
        const html = `
        <td class="description">${description}</td>
        <td class=${CSSClass}>${Utils.formatCurrency(amount)}</td>
        <td class="date">${date}</td>
        <td>
            <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
        </td>
        `

        return html
    },
    updateBalance() {
        document
            .querySelector('#income-display')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())

        document
            .querySelector('#expense-display')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())

        document
            .querySelector('#total-display')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },
    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ''
    }
}

const Utils = {
    formatCurrency(value = 0) {
        const signal = Number(value) < 0 ? '-' : ''

        value = String(value).replace(/\D/g, '')
        value = Number(value) / 100
        value = value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        })

        return signal + value
    },
    formatAmount(value = 0) {
        value = Number(value) * 100
        return value
    },
    formatDate(date) {
        const splittedDate = date.split('-')
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },
    validateFields() {
        const { description, amount, date } = Form.getValues()

        if (description.trim() === '' || amount.trim() === '' || date.trim() === '') {
            throw new Error('Por favor, preencha todos os campos.')
        }
    },
    formatValues() {
        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },
    saveTransaction(transaction) {
        Transaction.add(transaction)
    },
    clearFields() {
        Form.description.value = ''
        Form.amount.value = ''
        Form.date.value = ''
    },
    submit(event) {
        event.preventDefault()

        try {
            Form.validateFields()

            const transaction = Form.formatValues()

            Form.saveTransaction(transaction)
            Form.clearFields()
            Modal.toggle()
        } catch (err) {
            alert(err.message)
        }
    }
}

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction)
        DOM.updateBalance()
        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    }
}

App.init()