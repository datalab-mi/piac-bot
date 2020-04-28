let data

export const loadData = async () => {
  const res = await fetch('faq-saisis.json')
  data = await res.json()
  return data
}
