export const nodes = [
  {
    question: 'What your favourite color ? ',
    text: 'Hello',
    id: 'start'
  },
  {
    question: 'Like the sun ',
    text: 'yellow',
    id: 'B'
  },
  {
    question: 'Like the sea',
    text: 'blue',
    id: 'C'
  },
  {
    question: 'Like the grass',
    text: 'green',
    id: 'D'
  },
  {
    question: 'It\'s Like fire',
    text: 'red',
    id: 'E'
  },
]

export const links = [
  {
    source: 'start',
    target: 'B'
  },
  {
    source: 'start',
    target: 'C'
  },
  {
    source: 'start',
    target: 'D'
  },
  {
    source: 'start',
    target: 'E'
  }
]
