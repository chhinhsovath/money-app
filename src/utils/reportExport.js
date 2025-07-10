import { formatCurrency } from '@/lib/utils'

// CSV Export
export function exportToCSV(data, columns, filename = 'report.csv') {
  const headers = columns.map(col => col.label).join(',')
  
  const rows = data.map(row => {
    return columns.map(col => {
      const value = row[col.key]
      if (value === null || value === undefined) return ''
      
      // Format based on column type
      if (col.type === 'currency') {
        return formatCurrency(value).replace(/,/g, '')
      }
      
      // Escape commas and quotes in string values
      const stringValue = String(value)
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      
      return stringValue
    }).join(',')
  }).join('\n')
  
  const csv = `${headers}\n${rows}`
  
  // Create and download file
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Excel Export (using CSV format that Excel can open)
export function exportToExcel(data, columns, filename = 'report.xlsx') {
  // For a proper Excel export, we'd need a library like xlsx
  // For now, we'll export as CSV which Excel can open
  exportToCSV(data, columns, filename.replace('.xlsx', '.csv'))
}

// PDF Export
export function exportToPDF(data, columns, title, filename = 'report.pdf') {
  // Create a printable HTML table
  const tableHtml = generatePrintableHTML(data, columns, title)
  
  // Open in new window for printing
  const printWindow = window.open('', '_blank')
  printWindow.document.write(tableHtml)
  printWindow.document.close()
  
  // Trigger print dialog (user can save as PDF)
  printWindow.onload = () => {
    printWindow.print()
  }
}

// Print functionality
export function printReport(data, columns, title) {
  const tableHtml = generatePrintableHTML(data, columns, title)
  
  // Create iframe for printing
  const iframe = document.createElement('iframe')
  iframe.style.position = 'absolute'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = 'none'
  
  document.body.appendChild(iframe)
  
  const iframeDoc = iframe.contentWindow.document
  iframeDoc.open()
  iframeDoc.write(tableHtml)
  iframeDoc.close()
  
  // Wait for content to load then print
  iframe.onload = () => {
    iframe.contentWindow.print()
    setTimeout(() => {
      document.body.removeChild(iframe)
    }, 100)
  }
}

// Generate printable HTML
function generatePrintableHTML(data, columns, title) {
  const rows = data.map(row => {
    const cells = columns.map(col => {
      const value = row[col.key]
      if (value === null || value === undefined) return '<td>-</td>'
      
      let formattedValue = value
      if (col.type === 'currency') {
        formattedValue = formatCurrency(value)
      } else if (col.type === 'date') {
        formattedValue = new Date(value).toLocaleDateString()
      } else if (col.type === 'percentage') {
        formattedValue = `${(value * 100).toFixed(2)}%`
      }
      
      const align = col.align || 'left'
      return `<td style="text-align: ${align}; padding: 8px; border: 1px solid #ddd;">${formattedValue}</td>`
    }).join('')
    
    return `<tr>${cells}</tr>`
  }).join('')
  
  const headers = columns.map(col => 
    `<th style="text-align: ${col.align || 'left'}; padding: 8px; border: 1px solid #ddd; background-color: #f5f5f5;">${col.label}</th>`
  ).join('')
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        @media print {
          body { margin: 0; }
          table { page-break-inside: avoid; }
          tr { page-break-inside: avoid; }
        }
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
        }
        h1 {
          font-size: 24px;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .footer {
          text-align: center;
          color: #666;
          font-size: 12px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <table>
        <thead>
          <tr>${headers}</tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
      <div class="footer">
        Generated on ${new Date().toLocaleString()}
      </div>
    </body>
    </html>
  `
}

// Export report with all options
export function exportReport(format, data, columns, title, filename) {
  switch (format) {
    case 'csv':
      exportToCSV(data, columns, filename || `${title.toLowerCase().replace(/\s+/g, '-')}.csv`)
      break
    case 'excel':
      exportToExcel(data, columns, filename || `${title.toLowerCase().replace(/\s+/g, '-')}.xlsx`)
      break
    case 'pdf':
      exportToPDF(data, columns, title, filename || `${title.toLowerCase().replace(/\s+/g, '-')}.pdf`)
      break
    case 'print':
      printReport(data, columns, title)
      break
    default:
      console.error('Unsupported export format:', format)
  }
}