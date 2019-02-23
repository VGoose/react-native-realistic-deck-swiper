'use strict'
import React from 'react'
import { StyleSheet, View, Animated, PanResponder } from 'react-native';
import PropTypes from 'prop-types'
import { getInitialOffsets, getInterpolatedRotation, updateCardOffsets } from './helpers'

const ROTATION_MAGNITUDE = 25000 * 16

export default class Swiper extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      currentIndex: Number.isInteger(this.props.startIndex) && this.props.startIndex >= 0 ? this.props.startIndex : 0,
      parentDimensions: null,
      cardDimensions: null,
      cardCenter: null,
    }
    this.initializePanResponder()

    this.position = new Animated.ValueXY({ x: 0, y: 0 })
    this.rotationTopCard = new Animated.Value(0)
    this.rotationBottomCard = new Animated.Value(0)
    this.cardOffsets = []

    this.rotateTop = this.rotationTopCard.interpolate({
      inputRange: [
        -ROTATION_MAGNITUDE * this.props.rotationMultiplier,
        0,
        ROTATION_MAGNITUDE * this.props.rotationMultiplier
      ],
      outputRange: ['-360deg', '0deg', '360deg'],
    })
    this.rotateBottom = this.rotationBottomCard.interpolate({
      inputRange: [this.props.offsetAngleMin, 0, this.props.offsetAngleMax],
      outputRange: [`${this.props.offsetAngleMin}deg`, '0deg', `${this.props.offsetAngleMax}deg`]
    })
    this.topTransform = {
      transform: [
        ...this.position.getTranslateTransform(),
        {
          rotate: this.rotateTop
        },
      ]
    }
    this.bottomTransform = {
      transform: [{ rotate: this.rotateBottom }]
    }
  }
  componentDidMount() {
    const { offsetAngleMin, offsetAngleMax, deckSize, rotationMultiplier } = this.props
    this.cardOffsets = getInitialOffsets(offsetAngleMin, offsetAngleMax, deckSize)
    this.rotationTopCard.setValue(getInterpolatedRotation(this.cardOffsets[0], ROTATION_MAGNITUDE * rotationMultiplier))
    this.rotationBottomCard.setValue(this.cardOffsets[this.cardOffsets.length - 2])

  }
  componentDidUpdate(prevProps, prevState) {
    const { parentDimensions, cardDimensions } = this.state
    const { parentDimensions: oldParent, cardDimensions: oldCard } = prevState
    if (parentDimensions && cardDimensions) {
      if (
        oldParent === null
        || oldCard === null
        || parentDimensions.x !== oldParent.x
        || parentDimensions.y !== oldParent.y
        || cardDimensions.x !== oldCard.x
        || cardDimensions.y !== oldCard.y
        || cardDimensions.width !== oldCard.width
        || cardDimensions.height !== oldCard.height
      ) {
        const cardCenter = {
          x: parentDimensions.x + cardDimensions.x + cardDimensions.width / 2,
          y: parentDimensions.y + cardDimensions.y + cardDimensions.height / 2
        }
        this.setState({ cardCenter })
      }
    }

  }

  static defaultProps = {
    offsetAngleMin: -4,
    offsetAngleMax: 4,
    deckSize: 3,
    infiniteSwipe: true,
    onSwiped: () => { },
    onReset: () => { },
    onSwipedAll: () => { },
    startIndex: 0,
    velocityThreshold: 0.4,
    rotationMultiplier: 1,
    topCardAnimationDuration: 1000,
    bottomCardAnimationDuration: 500,
    springConstants: {
      stiffness: 50,
      damping: 30,
      mass: 0.5
    },
    style: {},
    containerStyle: {}
  }

  initializePanResponder = () => {
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e, gestureState) => true,
      onPanResponderGrant: (e, gestureState) => { },
      onPanResponderMove: (e, gestureState) => {
        const { moveX, moveY, dx, dy } = gestureState
        const { cardCenter } = this.state
        let x = moveX - cardCenter.x
        let y = moveY - cardCenter.y
        let rotation = x * dy - y * dx

        this.rotationTopCard.setValue(rotation)
        Animated.event([null, { dx: this.position.x, dy: this.position.y }])(null, gestureState)
      },
      onPanResponderRelease: (e, gestureState) => {
        const { moveX, moveY, dx, dy, vx, vy } = gestureState
        const { cardCenter, currentIndex } = this.state
        const { cardsData, velocityThreshold, topCardAnimationDuration } = this.props

        const validThreshold = velocityThreshold > 0 ? velocityThreshold : 0.4
        const validTopDuration = topCardAnimationDuration > 0 ? topCardAnimationDuration : 1000

        let x = moveX - cardCenter.x
        let y = moveY - cardCenter.y

        let rotation0 = x * dy - y * dx
        let rotationT = (x * vy - y * vx) * validTopDuration

        const finalPosition = { x: vx * validTopDuration, y: vy * validTopDuration }
        const finalRotation = rotation0 + rotationT

        const vMagnitude = Math.sqrt(vx * vx + vy * vy)
        if (vMagnitude > validThreshold) {


          this.animateCardOffScreen(finalPosition, finalRotation,
            () => this.onSwipe(currentIndex, cardsData, { vx: vx, vy: vy })
          )
        }
        else {
          this.animateReset({ vx: vx, vy: vy })
        }
      },
    })
  }
  animateCardOffScreen = (finalPosition, finalRotation, cb) => {
    Animated.parallel([
      Animated.timing(this.position, {
        toValue: finalPosition,
        duration: this.props.topCardAnimationDuration,
        useNativeDriver: true
      }),
      Animated.timing(this.rotationTopCard, {
        toValue: finalRotation,
        duration: this.props.topCardAnimationDuration,
        useNativeDriver: true
      })
    ]
    ).start(() => {
      cb()
    })
  }
  animateReset = (velocityVector) => {
    this.props.onReset(velocityVector)
    Animated.spring(this.rotationTopCard, {
      toValue: getInterpolatedRotation(this.cardOffsets[0], ROTATION_MAGNITUDE * this.props.rotationMultiplier),
      useNativeDriver: true,
      ...this.props.springConstants
    }).start()
    Animated.spring(this.position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
      ...this.props.springConstants
    }).start()
  }
  measureAnimatedView = (event) => {
    const { x, y, width, height } = event.nativeEvent.layout
    const cardDimensions = { x, y, width, height }
    if (
      !this.state.cardDimensions
      || x !== this.state.cardDimensions.x
      || y !== this.state.cardDimensions.y
      || width !== this.state.cardDimensions.width
      || height !== this.state.cardDimensions.height
    )
      this.setState({
        cardDimensions: cardDimensions,
      })
  }
  measureParentView = (event) => {
    const { x, y } = event.nativeEvent.layout
    const parentDimensions = { x, y }
    if (
      !this.state.parentDimensions
      || x !== this.state.parentDimensions.x
      || y !== this.state.parentDimensions.y
    )
      this.setState({
        parentDimensions: parentDimensions,
      })
  }

  resetTopCardAnimatedValues = (x0, y0, rotation0) => {
    this.position.setValue({ x: x0, y: y0 })
    this.rotationTopCard.setValue(rotation0)
  }

  onSwipe = (currentIndex, cardsData, velocityVector) => {
    const { offsetAngleMin, offsetAngleMax, rotationMultiplier, infiniteSwipe, onSwiped, onSwipedAll } = this.props
    onSwiped(velocityVector)

    this.cardOffsets = updateCardOffsets(this.cardOffsets, offsetAngleMin, offsetAngleMax)
    this.rotationBottomCard.setValue(this.cardOffsets[this.cardOffsets.length - 2])
    const topCardInitialRotation =
      getInterpolatedRotation(this.cardOffsets[0], ROTATION_MAGNITUDE * rotationMultiplier)
    const afterIndexUpdate = () => {
      this.resetTopCardAnimatedValues(0, 0, topCardInitialRotation)
      if (this.state.currentIndex === cardsData.length || this.state.currentIndex === 0) {
        onSwipedAll()
      }
    }
    if (infiniteSwipe) {
      if (currentIndex === cardsData.length - 1) {
        this.setState({ currentIndex: 0 },
          afterIndexUpdate)
      } else {
        this.setState({
          currentIndex: this.state.currentIndex + 1
        }, afterIndexUpdate)
      }
    } else {
      this.setState({
        currentIndex: this.state.currentIndex + 1
      }, afterIndexUpdate)
    }

  }

  animateBottomCard = (cb, value) => {
    Animated.timing(this.rotationBottomCard, {
      toValue: value,
      duration: this.props.bottomCardAnimationDuration > 0 ? this.props.bottomCardAnimationDuration : 500,
      useNativeDriver: true
    }).start(cb())
  }
  makeCard = (style, deckIndex, currentIndex, deckSize, renderCard, cardsData) => {
    let cardIndex = currentIndex + deckIndex
    if (cardIndex >= cardsData.length) {
      cardIndex = cardIndex - cardsData.length
    }
    const isTopCard = deckIndex === 0
    const isLastCard = deckIndex === deckSize - 1
    const transform = isTopCard
      ? this.topTransform
      : isLastCard
        ? this.bottomTransform
        : { transform: [{ rotate: `${this.cardOffsets[deckIndex]}deg` }] }

    if (isLastCard) {
      this.animateBottomCard(() => { }, this.cardOffsets[deckIndex])
    }
    return <Card
      transform={transform}
      cardsData={cardsData}
      renderCard={renderCard}
      measureAnimatedView={this.measureAnimatedView}
      cardIndex={cardIndex}
      deckIndex={deckIndex}
      key={deckIndex}
      panHandlers={this.panResponder.panHandlers}
      style={style}
    />
  }
  makeDeck = (style, currentIndex, deckSize, renderCard, cardsData, infiniteSwipe) => {
    let _deckSize = deckSize
    if (!infiniteSwipe) {
      const isOutOfBound = currentIndex + deckSize > cardsData.length
      if (isOutOfBound) {
        _deckSize = cardsData.length - currentIndex
      }
    }

    let deck = []
    for (let i = 0; i < _deckSize; i++) {
      deck.push(this.makeCard(style, i, currentIndex, _deckSize, renderCard, cardsData))
    }
    return deck
  }

  render() {
    const { currentIndex } = this.state
    const { deckSize, renderCard, cardsData, style, containerStyle, infiniteSwipe } = this.props
    return (
      <View
        onLayout={event => this.measureParentView(event)}
        style={{ ...styles.container, ...containerStyle }}
      >
        {this.makeDeck(style, currentIndex, deckSize, renderCard, cardsData, infiniteSwipe)}
      </View>
    )
  }
}

const Card = ({ style, panHandlers, deckIndex, transform, cardsData, cardIndex, renderCard, measureAnimatedView }) => {
  const _style = {
    ...style,
    ...styles.card,
    zIndex: cardsData.length + 100 - deckIndex,
    ...transform,
  }
  return <Animated.View
    {...panHandlers}
    style={_style}
    onLayout={event => measureAnimatedView(event)}
  >
    {renderCard(cardsData[cardIndex])}
  </Animated.View>
}

Swiper.propTypes = {
  cardsData: PropTypes.array.isRequired,
  renderCard: PropTypes.func.isRequired,
  infiniteSwipe: PropTypes.bool,
  onSwiped: PropTypes.func,
  onSwipedAll: PropTypes.func,
  onReset: PropTypes.func,
  deckSize: (props, propName, componentName) => {
    if (!Number.isInteger(props[propName]) || props[propName] < 2) {
      return new Error(
        `Invalid prop ${propName} supplied to ${componentName}.  
        ${propName} must be a positive integer 2 or greater.`
      );
    }
  },
  offsetAngleMin: (props, propName, componentName) => {
    if (!Number.isInteger(props[propName])) {
      return new Error(
        `Invalid prop ${propName} supplied to ${componentName}.  
        ${propName} must be an integer.`
      );
    }
  },
  offsetAngleMax: (props, propName, componentName) => {
    if (!Number.isInteger(props[propName])) {
      return new Error(
        `Invalid prop ${propName} supplied to ${componentName}.  
        ${propName} must be an integer.`
      );
    }
  },
  startIndex: (props, propName, componentName) => {
    if (!Number.isInteger(props[propName]) || props[propName] < 0) {
      return new Error(
        `Invalid prop ${propName} supplied to ${componentName}.  
        ${propName} must be an integer 0 or greater.`
      );
    }
  },
  velocityThreshold: (props, propName, componentName) => {
    if (typeof props[propName] !== 'number' || props[propName] < 0) {
      return new Error(
        `Invalid prop ${propName} supplied to ${componentName}.  
        ${propName} must be a positive number.`
      );
    }
  },
  rotationMultiplier: (props, propName, componentName) => {
    if (typeof props[propName] !== 'number' || props[propName] < 0) {
      return new Error(
        `Invalid prop ${propName} supplied to ${componentName}.  
        ${propName} must be a positive number.`
      );
    }
  },
  topCardAnimationDuration: (props, propName, componentName) => {
    if (typeof props[propName] !== 'number' || props[propName] < 0) {
      return new Error(
        `Invalid prop ${propName} supplied to ${componentName}.  
        ${propName} must be a positive number.`
      );
    }
  },
  bottomCardAnimationDuration: (props, propName, componentName) => {
    if (typeof props[propName] !== 'number' || props[propName] < 0) {
      return new Error(
        `Invalid prop ${propName} supplied to ${componentName}.  
        ${propName} must be a positive number.`
      );
    }
  },
  springConstants: PropTypes.shape({
    stiffness: PropTypes.number,
    damping: PropTypes.number,
    mass: PropTypes.number,
  })
}

const styles = StyleSheet.create({
  container: {
  },
  card: {
    position: 'absolute',
  }
})

