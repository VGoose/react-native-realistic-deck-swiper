import React from 'react'
import { StyleSheet, Text, View, Dimensions, Animated, PanResponder } from 'react-native';
import PropTypes from 'prop-types'

const SCREEN_WIDTH = Dimensions.get('window').width
const SCREEN_HEIGHT = Dimensions.get('window').height

export default class Swiper extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      currentIndex: this.props.startIndex,
      cardCenter: null,
    }
    this.initializePanResponder()

    this.position = new Animated.ValueXY({ x: 0, y: 0 })
    this.rotationTopCard = new Animated.Value(0)
    this.rotationBottomCard = new Animated.Value(0)
    this.rotationBottomCardValue = null
    this.rotationBottomCard.addListener(({ value }) => this.rotationBottomCardValue = value)
    this.cardOffsets = []

    this.rotateTop = this.rotationTopCard.interpolate({
      inputRange: [-100000, 0, 100000],
      outputRange: ['-150deg', '0deg', '150deg'],
    })
    this.rotateBottom = this.rotationBottomCard.interpolate({
      inputRange: [-4, 0, 4],
      outputRange: ['-4deg', '0deg', '4deg']
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
    //get initial offset angles for the visible deck
    const { offsetAngleMin, offsetAngleMax } = this.props
    this.cardOffsets = this.getInitialOffsets(offsetAngleMin, offsetAngleMax)
    this.rotationTopCard.setValue(this.cardOffsets[0] * 100000 / 150)
    this.rotationBottomCard.setValue(this.cardOffsets[2])

  }
  componentWillUnmount() {
    this.rotationBottomCard.removeAllListeners()
  }
  static defaultProps = {
    offsetAngleMin: -4,
    offsetAngleMax: 4,
    visibleDeckSize: 3,
    startIndex: 0,
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
        const { cardsData } = this.props
        let x = moveX - cardCenter.x
        let y = moveY - cardCenter.y

        let rotation0 = x * dy - y * dx
        let rotation1000 = x * vy * 1000 - y * vx * 100
        const vMagnitude = Math.sqrt(vx * vx + vy * vy)
        if (vMagnitude > .4) {
          Animated.parallel([
            Animated.timing(this.position, {
              toValue: { x: vx * 1000, y: vy * 1000 },
              duration: 1000
            }),
            Animated.timing(this.rotationTopCard, {
              toValue: rotation0 + rotation1000,
              duration: 1000
            })
          ]
          ).start(() => {
            this.onSwipe(currentIndex, cardsData)
          })
        }
        else {
          Animated.spring(this.rotationTopCard, {
            toValue: this.getInterpolatedRotation(this.cardOffsets[0]),
            stiffness: 50,
            damping: 30,
            mass: 0.5
          }).start()
          Animated.spring(this.position, {
            toValue: { x: 0, y: 0 },
            friction: 4
          }).start()
        }
      },
    })
  }

  measureAnimatedView = (event) => {
    const { x, y, width, height } = event.nativeEvent.layout
    const cardCenter = { x: x + width / 2, y: y + height / 2 }
    if (!this.state.cardCenter || cardCenter.x !== this.state.cardCenter.x || cardCenter.y !== this.state.cardCenter.y)
      this.setState({
        cardCenter
      })
  }
  //TODO
  //problems: uniques <= range(min, max)
  //if deckSize > range(min, max) there's not enough uniques
  //sol: add minimumOffsetDelta, calc and throw error if deckSize too big
  getUniqueElement = (array, min, max) => {
    let newElement = this.getInitialRotation(min, max)
    while (array.some(e => e === newElement)) {
      newElement = this.getInitialRotation(min, max)
    }
    return newElement
  }
  updateCardOffsets = (offsets) => {
    const { offsetAngleMin, offsetAngleMax } = this.props
    return [...offsets.slice(1), this.getUniqueElement(offsets.slice(1), offsetAngleMin, offsetAngleMax)]
  }
  getInterpolatedRotation = (deg) => {
    return deg * 100000 / 150
  }
  resetAnimatedValues = (x0, y0, rotation0) => {
    this.position.setValue({ x: x0, y: y0 })
    this.rotationTopCard.setValue(rotation0)


  }
  animateBottomCard = (cb, value) => {
    Animated.timing(this.rotationBottomCard, {
      toValue: value,
      duration: 500
    }).start(cb())
  }
  onSwipe = (currentIndex, cardsData) => {
    this.cardOffsets = this.updateCardOffsets(this.cardOffsets)
    console.log('onswipe: ' + this.cardOffsets)
    const topCardInitialRotation = this.getInterpolatedRotation(this.cardOffsets[0])
    this.rotationBottomCard.setValue(this.cardOffsets[this.cardOffsets.length - 2])
    console.log('onswipe rbc: ' + this.rotationBottomCardValue)

    if (currentIndex === cardsData.length - 1) {
      this.setState({ currentIndex: 0 }, this.resetAnimatedValues(0, 0, topCardInitialRotation))
    } else {
      this.setState({ currentIndex: this.state.currentIndex + 1 }, this.resetAnimatedValues(0, 0, topCardInitialRotation))
    }
  }

  getInitialOffsets = (min, max) => {
    const { visibleDeckSize } = this.props
    let offsets = []
    //TODO
    //O(n*m) where n is visibleDeckSize and m depends on probability of hitting a non-unique
    //which gets higher as offsets.length approaches visibleDeckSize
    //O(n^2)
    //Sol: initialize map of all possible offsets 
    //add to offsets from that map and remove from map
    //shift offsets adds to the map
    //O(n)
    for (i = 0; i < visibleDeckSize; i++) {
      offsets.push(this.getUniqueElement(offsets, min, max))
    }
    return offsets
  }
  getInitialRotation = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  makeCard = (style, deckIndex, currentIndex, visibleDeckSize, renderCard, cardsData) => {
    let cardIndex = currentIndex + deckIndex
    if (cardIndex >= cardsData.length) {
      cardIndex = cardIndex - cardsData.length
    }
    const isTopCard = deckIndex === 0
    const isLastCard = deckIndex === visibleDeckSize - 1
    if (isLastCard) {
      // this.animateBottomCard(() => { },this.cardOffsets[deckIndex])
    }
    return <Card
      transform={
        isTopCard
          ? this.topTransform
          : isLastCard
            ? this.bottomTransform
            : { transform: [{ rotate: `${this.cardOffsets[deckIndex]}deg` }] }
      }
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
  makeDeck = (style, currentIndex, visibleDeckSize, renderCard, cardsData) => {
    let deck = []
    for (i = 0; i < visibleDeckSize; i++) {
      deck.push(this.makeCard(style, i, currentIndex, visibleDeckSize, renderCard, cardsData))
    }
    return deck
  }

  render() {
    this.animateBottomCard(() => { },this.cardOffsets[2])
    const { currentIndex } = this.state
    const { visibleDeckSize, renderCard, cardsData, style } = this.props
    return (
      <View
        style={styles.container}
      >
        {this.makeDeck(style, currentIndex, visibleDeckSize, renderCard, cardsData)}
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
  visibleDeckSize: PropTypes.number,
  offsetAngleMax: PropTypes.number,
  startIndex: PropTypes.number,
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',

  },
  card: {
    position: 'absolute',
  }
})

