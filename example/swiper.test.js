// //jest #4359
// jest.useFakeTimers()

// import React from 'react'
// import { shallow } from 'enzyme'
// import Swiper from './swiper'

// let WARN
// beforeAll(() => {
//   WARN = jest.spyOn(console, "error")
// })

// let WRAPPER
// describe('Swiper', () => {
//   beforeAll(() => {
//     WRAPPER = shallow(
//       <Swiper
//         cardsData={[1, 2, 3]}
//         renderCards={() => { }}
//         startIndex={4}
//       />
//     )
//   })
//   test('should throw if not provided required props', () => {
//     expect(() => shallow(<Swiper />)).toThrow()
//   })
//   test('should render with correct props', () => {
//     shallow(<Swiper cardsData={[]} renderCards={() => { }} />)
//   })
//   test('should assign cardIndex prop to state.currentIndex', () => {
//     expect(WRAPPER.state('currentIndex')).toBe(4)
//   })
// })


// describe('deckSize prop', () => {
//   test('should throw if < 2', () => {
//     expect(() => shallow(<Swiper deckSize={1} cardsData={[]} renderCards={() => { }} />)).toThrow(/two or more/)
//   })
//   test('should throw if not an integer', () => {
//     expect(() => shallow(<Swiper deckSize={1.1} cardsData={[]} renderCards={() => { }} />)).toThrow(/integer/)
//   })
// })
// describe('startIndex prop', () => {
//   test('should warn if not integer', () => {
//     shallow(<Swiper cardsData={[]} renderCards={() => { }} />)
//     expect(WARN).toBeCalled()
//   })
// })
// describe('startIndex prop', () => {
//   test('should assign 0 to state.currentIndex if given non-integer cardIndex prop', () => {
//     const _wrapper = shallow(
//       <Swiper
//         cardsData={[1, 2, 3]}
//         renderCards={() => { }}
//         startIndex={3.2}
//       />
//     )
//     expect(_wrapper.state('currentIndex')).toBe(0)
//   })
//   test('should assign 0 to state.currentIndex if given negative cardIndex prop', () => {
//     const _wrapper = shallow(
//       <Swiper
//         cardsData={[1, 2, 3]}
//         renderCards={() => { }}
//         startIndex={-16}
//       />
//     )
//     expect(_wrapper.state('currentIndex')).toBe(0)
//   })
// })

// afterAll(() => {
//   console.error.mockRestore();
// });