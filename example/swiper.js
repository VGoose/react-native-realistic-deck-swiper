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
      cardCenter: null
    }
    this.initializePanResponder()
    this.position = new Animated.ValueXY()
    this.rotation = new Animated.Value()
    this.cardOffsets = [],
      this.rotate = this.rotation.interpolate({
        inputRange: [-100000, 0, 100000],
        outputRange: ['-150deg', '0deg', '150deg'],
        // extrapolate: 'clamp'
      })

    this.rotateAndTranslate = {
      transform: [
        ...this.position.getTranslateTransform(),
        {
          rotate: this.rotate
        },
      ]
    }
  }
  componentDidMount() {
    //get initial offset angles for the visible deck
    this.initializeOffsets()
  }
  static defaultProps = {
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

        this.rotation.setValue(rotation)
        Animated.event([null, { dx: this.position.x, dy: this.position.y }])(null, gestureState)
      },
      onPanResponderRelease: (e, gestureState) => {
        const { moveX, moveY, dx, dy, vx, vy } = gestureState
        const { cardCenter } = this.state
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
            Animated.timing(this.rotation, {
              toValue: rotation0 + rotation1000,
              duration: 1000
            })
          ]
          ).start(() => {
            this.onSwipe()
          })
        }
        else {
          Animated.spring(this.rotation, {
            toValue: 0,
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

  measureParentView = (event) => {
    const { x, y, width, height } = event.nativeEvent.layout
  }


  measureAnimatedView = (event) => {
    const { x, y, width, height } = event.nativeEvent.layout
    const cardCenter = { x: x + width / 2, y: y + height / 2 }
    if (!this.state.cardCenter || cardCenter.x !== this.state.cardCenter.x || cardCenter.y !== this.state.cardCenter.y)
      this.setState({
        cardCenter
      })
  }

  onSwipe = () => {
    const { currentIndex } = this.state
    const { cardsData } = this.props
    //handle offset angles
    this.cardOffsets.shift()
    console.log(this.cardOffsets)
    this.cardOffsets.push(this.getInitialRotation())
    console.log(this.cardOffsets)
    const topCardInitialRotation = this.cardOffsets[0] * 100000 / 150
    //update currentIndex and return position and rotation values to initial position
    if (currentIndex === cardsData.length - 1) {
      this.setState({ currentIndex: 0 }, () => {
        this.position.setValue({ x: 0, y: 0 })
        this.rotation.setValue(topCardInitialRotation)
      })
    } else {
      this.setState({ currentIndex: this.state.currentIndex + 1 }, () => {
        this.position.setValue({ x: 0, y: 0 })
        this.rotation.setValue(topCardInitialRotation)
      })
    }
  }

  initializeOffsets = () => {
    const { visibleDeckSize } = this.props
    for (i = 0; i < visibleDeckSize; i++) {
      this.cardOffsets.push(this.getInitialRotation())
    }
  }
  getInitialRotation = () => {
    const { offsetAngleMax } = this.props
    return deg = Math.random() * 2 * offsetAngleMax - offsetAngleMax
  }
  makeCard = (i) => {
    const { cardsData, renderCard, keyExtractor, visibleDeckSize } = this.props
    const { currentIndex } = this.state
    let j = i
    if (j > cardsData.length - 1) {
      j = j - cardsData.length
    }
    if (i === currentIndex) {
      return <Animated.View
        style={
          [
            this.rotateAndTranslate,
            {
              ...styles.card,
              zIndex: cardsData.length + 100 - i,
            }
          ]
        }
        onLayout={event => this.measureAnimatedView(event)}
        key={keyExtractor ? keyExtractor(cardsData[j]) : j}
        desc={cardsData[j].desc}

        {...this.panResponder.panHandlers}
      >
        {renderCard(cardsData[j])}
      </Animated.View>
    } else {
      return <Animated.View
        style={
          {
            ...styles.card,
            zIndex: cardsData.length + 100 - i,
            transform: [{ rotate: `${this.cardOffsets[i - currentIndex]}deg` }]
          }
        }
        onLayout={event => this.measureAnimatedView(event)}
        key={keyExtractor ? keyExtractor(cardsData[j]) : j}
        desc={cardsData[j].desc}
      >
        {renderCard(cardsData[j])}
      </Animated.View>
    }
  }
  makeDeck = () => {
    let { currentIndex } = this.state
    const { visibleDeckSize } = this.props
    let deck = []
    for (i = currentIndex; i < visibleDeckSize + currentIndex; i++) {
      deck.push(this.makeCard(i))
    }
    return deck
  }

  render() {
    console.log('render')
    return (
      <View
        style={styles.container}
        onLayout={(event) => this.measureParentView(event)}
      >
        {this.makeDeck()}
      </View>
    )
  }
}

Swiper.propTypes = {
  cardsData: PropTypes.array.isRequired,
  renderCard: PropTypes.func.isRequired,
  keyExtractor: PropTypes.func,
  visibleDeckSize: PropTypes.number,
  offsetAngleMax: PropTypes.number,
  startIndex: PropTypes.number,
}

const styles = StyleSheet.create({
  container: {
    position: 'relative'
  },
  card: {
    position: 'absolute',
  }
})

