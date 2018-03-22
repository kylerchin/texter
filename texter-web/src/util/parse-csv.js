import * as Papa from 'papaparse'

export const parseCsv = file => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: results => {
        resolve(
          results.data.map(row => ({
            firstName: row[0],
            lastName: row[1],
            phone: row[2],
          })),
        )
      },
    })
  })
}
