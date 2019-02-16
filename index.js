import React from 'react'
import { StyleSheet, Text, View, Dimensions, Animated, PanResponder } from 'react-native';
import PropTypes from 'prop-types'

const SCREEN_WIDTH = Dimensions.get('window').width
const SCREEN_HEIGHT = Dimensions.get('window').height

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
  componentDidMount() {

  }
  static defaultProps = {
    offsetAngle = 4,
    visibleDeckSize = 3,
    startIndex = 0,
  }
  initializePanResponder = () => {
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder = (e, gestureState) => true,
      onPanResponderGrant = (e, gestureState) => { },
      onPanResponderMove = (e, gestureState) => {
        const { moveX, moveY, x0, y0, dx, dy, vx, vy, t } = gestureState
        const originX = SCREEN_WIDTH / 2
        const originY = SCREEN_HEIGHT / 2
        let x = moveX - originX
        let y = moveY - originY
        let crossProduct = math.cross([x, y, 0], [dx, dy, 0])
        let result = crossProduct[2]

        this.rotation.setValue(result)
        Animated.event([null, { dx: this.position.x, dy: this.position.y }])(null, gestureState)
      },
      onPanResponderRelease = (e, gestureState) => {
        const { moveX, moveY, dx, dy, vx, vy } = gestureState
        const originX = SCREEN_WIDTH / 2
        const originY = SCREEN_HEIGHT / 2
        let x = moveX - originX
        let y = moveY - originY

        let crossProduct = math.cross([x, y, 0], [dx, dy, 0])
        let rotation0 = crossProduct[2]
        let intCrossProduct = math.cross([x, y, 0], [vx * 1000, vy * 1000, 0])
        let rotation1000 = intCrossProduct[2]
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
  }
  renderDeck = () => {
    const { cardsData, renderCard, keyExtractor, visibleDeckSize, startIndex } = this.props
    let deck = []
    for (i = startIndex; i < visibleDeckSize + startIndex; i++) {
      deck.push(
        <Animated.View
          style={{
            ...styles.card,
            zIndex: 1000 - i
          }}
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
  render() {
    return (
      <View
        style={styles.container}
        // pointerEvents='box-none' 
        onLayout={(event) => this.measureParentView(event)}
      >
        {this.renderDeck()}
      </View>
    )
  }
}

Swiper.propTypes = {
  cardsData = PropTypes.array.isRequired,
  renderCard = PropTypes.func.isRequired,
  keyExtractor = PropTypes.func,
  visibleDeckSize = PropTypes.number,
  offsetAngle = PropTypes.number,
  startIndex = PropTypes.number,
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EFEFEF'
  },
  card: {
    flex: 1,
    position: 'absolute'
  }
})