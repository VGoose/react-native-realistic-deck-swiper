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
      currentIndex: Number.isInteger(this.props.startIndex) ? this.props.startIndex : 0,
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
    //get initial offset angles for the deck
    const { offsetAngleMin, offsetAngleMax, deckSize, rotationMultiplier } = this.props
    this.cardOffsets = getInitialOffsets(offsetAngleMin, offsetAngleMax, deckSize)

    this.rotationTopCard.setValue(getInterpolatedRotation(this.cardOffsets[0], ROTATION_MAGNITUDE * rotationMultiplier ))
    this.rotationBottomCard.setValue(this.cardOffsets[this.cardOffsets.length - 2])

  }

  static defaultProps = {
    offsetAngleMin: -4,
    offsetAngleMax: 4,
    deckSize: 3,
    infiniteSwipe: true,
    onSwiped: () => { },
    onReset: () => { },
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
        const { cardsData, velocityThreshold, topCardAnimationDuration, onSwiped } = this.props

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
          onSwiped({ vx: vx, vy: vy })
          this.animateCardOffScreen(finalPosition, finalRotation,
            () => this.onSwipe(currentIndex, cardsData)
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
        duration: this.props.topCardAnimationDuration
      }),
      Animated.timing(this.rotationTopCard, {
        toValue: finalRotation,
        duration: this.props.topCardAnimationDuration
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
      ...this.props.springConstants
    }).start()
    Animated.spring(this.position, {
      toValue: { x: 0, y: 0 },
      ...this.props.springConstants
    }).start()
  }
  measureAnimatedView = (event) => {
    const { x, y, width, height } = event.nativeEvent.layout
    const cardCenter = { x: x + width / 2, y: y + height / 2 }
    if (!this.state.cardCenter || cardCenter.x !== this.state.cardCenter.x || cardCenter.y !== this.state.cardCenter.y)
      this.setState({
        cardCenter,
      })
  }

  resetTopCardAnimatedValues = (x0, y0, rotation0) => {
    this.position.setValue({ x: x0, y: y0 })
    this.rotationTopCard.setValue(rotation0)
  }

  onSwipe = (currentIndex, cardsData) => {
    const { offsetAngleMin, offsetAngleMax, rotationMultiplier } = this.props


    this.cardOffsets = updateCardOffsets(this.cardOffsets, offsetAngleMin, offsetAngleMax)
    this.rotationBottomCard.setValue(this.cardOffsets[this.cardOffsets.length - 2])
    const topCardInitialRotation =
      getInterpolatedRotation(this.cardOffsets[0], ROTATION_MAGNITUDE * rotationMultiplier )

    if (currentIndex === cardsData.length - 1) {
      this.setState({ currentIndex: 0 }, this.resetTopCardAnimatedValues(0, 0, topCardInitialRotation))
    } else {
      this.setState({
        currentIndex: this.state.currentIndex + 1
      }, this.resetTopCardAnimatedValues(0, 0, topCardInitialRotation))
    }
  }

  animateBottomCard = (cb, value) => {
    Animated.timing(this.rotationBottomCard, {
      toValue: value,
      duration: this.props.bottomCardAnimationDuration > 0 ? this.props.bottomCardAnimationDuration : 500
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
  makeDeck = (style, currentIndex, deckSize, renderCard, cardsData) => {
    let deck = []
    for (let i = 0; i < deckSize; i++) {
      deck.push(this.makeCard(style, i, currentIndex, deckSize, renderCard, cardsData))
    }
    return deck
  }

  render() {
    const { currentIndex } = this.state
    const { deckSize, renderCard, cardsData, style, containerStyle } = this.props
    return (
      <View
        style={{ ...styles.container, ...containerStyle }}
      >
        {this.makeDeck(style, currentIndex, deckSize, renderCard, cardsData)}
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
  deckSize: PropTypes.number,
  offsetAngleMin: PropTypes.number,
  offsetAngleMax: PropTypes.number,
  onSwipe: PropTypes.func,
  onReset: PropTypes.func,
  startIndex: PropTypes.number,
  velocityThreshold: PropTypes.number,
  rotationMultiplier: PropTypes.number,
  topCardAnimationDuration: PropTypes.number,
  bottomCardAnimationDuration: PropTypes.number,
  springConstants: PropTypes.shape({
    stiffness: PropTypes.number,
    damping: PropTypes.number,
    mass: PropTypes.number,
  })
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  card: {
    position: 'absolute',
  }
})

