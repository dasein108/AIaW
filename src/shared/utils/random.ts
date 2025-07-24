function randomSyllable(): string {
  const consonants = 'bcdfghjklmnpqrstvwxyz'
  const vowels = 'aeiou'

  const c = consonants[Math.floor(Math.random() * consonants.length)]
  const v = vowels[Math.floor(Math.random() * vowels.length)]
  const c2 = consonants[Math.floor(Math.random() * consonants.length)]

  return c + v + (Math.random() > 0.5 ? c2 : '')
}

export function generateName(): string {
  const word1 = randomSyllable() + randomSyllable()
  const word2 = randomSyllable() + randomSyllable()

  return `${word1} ${word2}`
}
