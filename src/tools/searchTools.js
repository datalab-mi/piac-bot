let data

export const loadData = async () => {
  const res = await fetch('__FAQ__')
  data = await res.json()
  return data
}

export const loadCountries = async () => {
  const res = await fetch('__COUNTRIES__')
  data = await res.json()
  return data
}
