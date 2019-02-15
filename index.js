import React from 'react'
import { StyleSheet, Text, View, Dimensions, Animated, PanResponder } from 'react-native';

export default class Swiper extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      index: 0,
    }
    initializePanResponder()
    this.position = Animated.ValueXY()
    this.rotation = Animated.Value()
  }
  static defaultProps = {
    offsetAngle = 4,
    
  }
  initializePanResponder = () => {
    this.panResponder = PanResponder.create({
      onPanResponderGrant = (e, gestureState) => { },
      onPanResponderMove = (e, gestureState) => {
        const { moveX, moveY, dx, dy, vx, vy } = gestureState
        const originX = //f(parentX, margin, padding, cardWidth)
        const originY = //f(parentY, margin, padding, cardHeight)
      },
      onPanResponderRelease = (e, gestureState) => { },
    })
  }
  render() {
    return (

    )
  }
}

Swiper.propTypes = {
  offsetAngle = PropTypes.number
}

const styles = StyleSheet.create({

})