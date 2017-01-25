Slim.tag('s-table', class extends Slim {

    get template() {
        return `<div>
<table>
    <thead><tr #header>
    </tr></thead>
    <tbody></tbody>
</table></div>`
    }

    set data(value) {
        this._data = value
        this.parseData(this._data)
        this.update()
    }

    get data() {
        return this._data
    }

    update() {
        this.columnNames.forEach( columnName => {
            let tdElement = document.createElement('th')
            tdElement.innerHTML = columnName
            this.header.appendChild(tdElement)
        })
        this.parsedData && this.parsedData.forEach( rowData => {
            let rowElement = document.createElement('tr')
            this.find('tbody').appendChild(rowElement)
            for (let columnName of this.columnNames) {
                let tdElement = document.createElement('td')
                tdElement.innerHTML = rowData[columnName]
                rowElement.appendChild(tdElement)
            }
        })
        super.update()
    }

    parseData(tableData) {
        let columns = {}
        let data = []
        tableData.forEach( rowData => {
            Object.keys(rowData).forEach( key => {
                columns[key] = true
            })
        })
        this.columnNames = Object.keys(columns)
        data = tableData.concat()
        data.forEach( rowData => {
            for (let colName of this.columnNames) {
                if (rowData[colName] === undefined) {
                    rowData[colName] = ''
                }
            }
        })
        this.parsedData = data
    }
})