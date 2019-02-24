//jest #4359
// jest.useFakeTimers()

import React from 'react'
import { shallow } from 'enzyme'
import App from '../App'

describe('App', () => {
  test('should render', () => {
    shallow(<App />)
  } 
)})
