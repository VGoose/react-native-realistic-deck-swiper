export function getInitialOffsets(offsetAngleMin, offsetAngleMax, deckSize) {
  if(typeof offsetAngleMin === 'undefined' || typeof offsetAngleMax === 'undefined' || typeof deckSize === 'undefined') {
    throw new Error('Missing arguments.')
  }
  if(!Number.isInteger(offsetAngleMin)|| !Number.isInteger(offsetAngleMax) || !Number.isInteger(deckSize)) {
    throw new Error('All arguments must be integers')
  }
  if(offsetAngleMin >= offsetAngleMax) {
    throw new Error('offsetAngleMin must be less than offsetAngleMax.')
  }
  if(deckSize < 2) {
    throw new Error('deckSize must be two or more.')
  }
  if(offsetAngleMax - offsetAngleMin + 1 < deckSize) {
    throw new Error('Min Max integer range must be greater than or equal to deckSize.')
  }
  let offsets = []
  //TODO
  //O(n*m) where n is visibleDeckSize and m depends on probability of hitting a non-unique
  //which gets higher as offsets.length approaches visibleDeckSize
  //O(n^2)
  //Sol: initialize map of all possible offsets 
  //add to offsets from that map and remove from map
  //shift offsets adds to the map
  //O(n)
  for (let i = 0; i < deckSize; i++) {
    offsets.push(getUniqueElement(offsets, offsetAngleMin, offsetAngleMax))
  }
  return offsets
}

//TODO
//problems: uniques <= range(min, max)
//if deckSize > range(min, max) there's not enough uniques
//sol: add minimumOffsetDelta, calc and throw error if deckSize too big
export function updateCardOffsets(offsets, offsetAngleMin, offsetAngleMax) {
  if(!offsets || !offsetAngleMin || !offsetAngleMax) {
    throw new Error('Missing arguments.')
  }
  if(!Array.isArray(offsets) || !Number.isInteger(offsetAngleMin) || !Number.isInteger(offsetAngleMax)) {
    throw new Error('Invalid argument type, expected (offsets = array, offsetAngleMin = integer, offsetAngleMax = integer.')
  }
  if(offsetAngleMin >= offsetAngleMax) {
    throw new Error('offsetAngleMin must be less than offsetAngleMax.')
  }
  return [...offsets.slice(1), getUniqueElement(offsets.slice(1), offsetAngleMin, offsetAngleMax)]
}
export function getInterpolatedRotation(deg, rotation) {
  if(typeof deg === 'undefined' || typeof rotation === 'undefined' || !Number.isInteger(deg) || !Number.isInteger(rotation)) {
    throw new Error(`Invalid arguments, expected (deg = integer, rotation = integer.`)
  }
  return deg * rotation / 360
}


function getInitialRotation(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getUniqueElement(array, min, max) {
  let newElement = getInitialRotation(min, max)
  while (array.some(e => e === newElement)) {
    newElement = getInitialRotation(min, max)
  }
  return newElement
}





