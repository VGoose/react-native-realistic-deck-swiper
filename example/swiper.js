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

  }
  static defaultProps = {
    offsetAngle: 4,
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
        this.setState({ vx, vy, resultRelease: rotation0 })
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
            this.setState({ currentIndex: this.state.currentIndex + 1 }, () => {
              this.position.setValue({ x: 0, y: 0 })
              this.rotation.setValue(0)
            })
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
  makeDeck = () => {
    console.log('makeDeck')
    let { currentIndex } = this.state
    const { cardsData, renderCard, keyExtractor, visibleDeckSize } = this.props
    if (currentIndex === cardsData.length) {
      this.setState({ currentIndex: 0 })
    }
    let deck = []
    for (i = currentIndex; i < visibleDeckSize + currentIndex; i++) {

      console.log('i: ' + i)
      if (i === cardsData.length) {
        i = 0
      }
      deck.push(
        <Animated.View
          style={
            [
              this.rotateAndTranslate,
              {
                ...styles.card,
                zIndex: 1000 - i, //TODO
              }
            ]
          }
          onLayout={event => this.measureAnimatedView(event)}
          key={keyExtractor ? keyExtractor(cardsData[i]) : i}
          {...this.panResponder.panHandlers}
        >
          {renderCard(cardsData[i])}
        </Animated.View>
      )
    }
    return deck
  }
  renderDeck = () => {
    // let { currentIndex } = this.state
    // let cards = this.makeDeck()
    // return 
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
  offsetAngle: PropTypes.number,
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

