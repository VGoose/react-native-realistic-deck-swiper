'use strict'
const { getInitialOffsets, updateCardOffsets, getInterpolatedRotation } = require('./helpers')

describe('getInitialOffsets', () => {
  test('throws error if missing arguments', () => {
    expect(() => getInitialOffsets( 2, 6)).toThrow(/Missing/)
  })
  test('throws error if any arguments are not integers', () => {
    expect(() => getInitialOffsets(-1.1, 3, '2')).toThrow(/integer/)
  })
  test('throws error if min is greater than max argument', () => {
    expect(() => getInitialOffsets(2, -2, 1)).toThrow(/less than/)
  })
  test('throws error if deckSize is less than 2', () => {
    expect(() => getInitialOffsets(-2, 2, 1)).toThrow(/two/)
  })
  test('throws error if range of numbers [min .. max] is less than deckSize', () => {
    expect(() => getInitialOffsets(-2, 2, 6)).toThrow(/range/)
  })
  test('returns an array', () => {
    expect(Array.isArray(getInitialOffsets(-2, 2, 3))).toBe(true)
  })
  test('returns an array of integers', () => {
    expect(getInitialOffsets(-2, 2, 3).every((value) => {
      console.log(value)
      return Number.isInteger(value)
    })).toBe(true)
  })
  test('returns an array of unique elements', () => {
    const _set = new Set(getInitialOffsets(-2, 2, 4))
    expect([..._set].length).toBe(4)
  })
})

describe('updateCardOffsets', () => {
  test('throws error if missing arguments', () => {
    expect(() => updateCardOffsets([], 1)).toThrow(/Missing/)
  })
  test('throws error if arguments are of wrong type', () => {
    expect(() => updateCardOffsets(1, [], 'a')).toThrow(/type/)
  })
  test('throws error if offsetAngleMin >= offsetAngleMax', () => {
    expect(() => updateCardOffsets([], -2, -4)).toThrow(/less than/)
  })
  test('returns an array of unique elements', () => {
    const _set = new Set(updateCardOffsets([2, 3, 4], 2, 4))
    expect([..._set].length).toBe(3)
  })
})

describe('getInterpolatedRotation', () => {
  test('throws error if missing arguments or arguments are of wrong type', () => {
    expect(() => getInterpolatedRotation('a', 12)).toThrow(/Invalid/)
  })
  test('returns a number', () => {
    expect(typeof getInterpolatedRotation(1, 1000) === 'number').toBe(true)
  })
  test('returns 10 given inputs of (10, 360)', () => {
    expect(getInterpolatedRotation(10, 360)).toBe(10) 
  })
})
