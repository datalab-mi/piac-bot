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
    from: 'start',
    to: 'B'
  },
  {
    from: 'start',
    to: 'C'
  },
  {
    from: 'start',
    to: 'D'
  },
  {
    from: 'start',
    to: 'E'
  }
]
