import React from 'react';
import { StyleSheet, Text, View, Dimensions, Image, Animated, PanResponder } from 'react-native';
// import math from 'mathjs'
import Swiper from './swiper'
import Foo from './foo'

const SCREEN_HEIGHT = Dimensions.get('window').height
const SCREEN_WIDTH = Dimensions.get('window').width

const Users = [
  { id: "1", desc: 'icecream', uri: require('./assets/1.jpg') },
  { id: "2", desc: 'soup', uri: require('./assets/2.jpg') },
  { id: "3", desc: 'popcorn', uri: require('./assets/3.jpg') },
  { id: "4", desc: 'popcorn+', uri: require('./assets/4.jpg') },
  { id: "5", desc: 'popcorn++', uri: require('./assets/5.jpg') },
]

export default class App extends React.Component {

  constructor() {
    super()

    this.position = new Animated.ValueXY()
    this.rotation = new Animated.Value()
    this.state = {
      currentIndex: 0,
      eventX: 0,
      eventY: 0,
      gestureX0: 0,
      gestureY0: 0,
      vx: 0,
      vy: 0,
      gestureDX: 0,
      gestureDY: 0,
      normalizedRadius: 0,
      clockwise: null,
      result: null,
      resultRelease: null,
    }

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

    this.likeOpacity = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [0, 0, 1],
      extrapolate: 'clamp'
    })
    this.dislikeOpacity = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [1, 0, 0],
      extrapolate: 'clamp'
    })

    this.nextCardOpacity = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [1, 0, 1],
      extrapolate: 'clamp'
    })
    this.nextCardScale = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [1, 0.8, 1],
      extrapolate: 'clamp'
    })

  }
  _renderCard = (item) => {
    return <View style={{ width: 300, height: 400, borderRadius: 5 }}>
    </View>
  }
  componentWillMount() {
    this.PanResponder = PanResponder.create({

      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onPanResponderMove: (evt, gestureState) => {

        const { moveX, moveY, x0, y0, dx, dy, vx, vy, } = gestureState

        const originX = 1 / 2 * (250) + (SCREEN_WIDTH - 250) / 2
        const originY = 1 / 2 * (400) + 70 //offset from top
        let x = moveX - originX
        let y = moveY - originY
        // let crossProduct = math.cross([x, y, 0], [dx, dy, 0])
        let rotation = x * dy - y * dx
        // let result = crossProduct[2]

        Animated.event([null, { dx: this.position.x, dy: this.position.y }])(null, gestureState)
        this.rotation.setValue(rotation)
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { moveX, moveY, dx, dy, vx, vy } = gestureState
        const originX = 1 / 2 * (250) + (SCREEN_WIDTH - 250) / 2
        const originY = 1 / 2 * (400) + 70 //offset from top
        let x = moveX - originX
        let y = moveY - originY
        // let crossProduct = math.cross([x, y, 0], [dx, dy, 0])
        // let resultRelease = crossProduct[2]
        let rotation0 = x * dy - y * dx
        // let intCrossProduct = math.cross([x, y, 0], [vx * 1000, vy * 1000, 0])
        // let interpolation = intCrossProduct[2]
        let rotation1000 = x * vy * 1000 - y * vx * 1000
        this.setState({ vx, vy, resultRelease })
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
        else if (gestureState.vx < -0.8) {
          Animated.spring(this.position, {
            toValue: { x: -SCREEN_WIDTH - 100, y: gestureState.dy }
          }).start(() => {
            this.setState({ currentIndex: this.state.currentIndex + 1 }, () => {
              this.position.setValue({ x: 0, y: 0 })
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
      }
    })
  }

  renderUsers = () => {

    return Users.map((item, i) => {


      if (i < this.state.currentIndex) {
        return null
      }
      else if (i == this.state.currentIndex) {

        return (
          <Animated.View
            {...this.PanResponder.panHandlers}
            key={item.id} style={
              [this.rotateAndTranslate,
              {
                height: 400,
                width: 250, padding: 10,
                position: 'absolute'
              }]
            }>
            <Animated.View style={{ opacity: this.likeOpacity, transform: [{ rotate: '-30deg' }], position: 'absolute', top: 50, left: 40, zIndex: 1000 }}>
              <Text style={{ borderWidth: 1, borderColor: 'green', color: 'green', fontSize: 32, fontWeight: '800', padding: 10 }}>LIKE</Text>

            </Animated.View>

            <Animated.View style={{ opacity: this.dislikeOpacity, transform: [{ rotate: '30deg' }], position: 'absolute', top: 50, right: 40, zIndex: 1000 }}>
              <Text style={{ borderWidth: 1, borderColor: 'red', color: 'red', fontSize: 32, fontWeight: '800', padding: 10 }}>NOPE</Text>

            </Animated.View>

            <Image
              style={{ flex: 1, height: null, width: null, resizeMode: 'cover', borderRadius: 20 }}
              source={item.uri} />

          </Animated.View>
        )
      }
      else {
        return (
          <Animated.View

            key={item.id} style={[{
              opacity: this.nextCardOpacity,
              transform: [{ scale: this.nextCardScale }],
              height: 400, width: 250, padding: 10, position: 'absolute'
            }]}>
            <Animated.View style={{ opacity: 0, transform: [{ rotate: '-30deg' }], position: 'absolute', top: 50, left: 40, zIndex: 1000 }}>
              <Text style={{ borderWidth: 1, borderColor: 'green', color: 'green', fontSize: 32, fontWeight: '800', padding: 10 }}>LIKE</Text>

            </Animated.View>

            <Animated.View style={{ opacity: 0, transform: [{ rotate: '30deg' }], position: 'absolute', top: 50, right: 40, zIndex: 1000 }}>
              <Text style={{ borderWidth: 1, borderColor: 'red', color: 'red', fontSize: 32, fontWeight: '800', padding: 10 }}>NOPE</Text>

            </Animated.View>

            <Image
              style={{ flex: 1, height: null, width: null, resizeMode: 'cover', borderRadius: 20 }}
              source={item.uri} />

          </Animated.View>
        )
      }
    }).reverse()
  }

  render() {
    return (
      <Swiper cardsData={Users} renderCard={this._renderCard} 
      style={{margin: 50,
        backgroundColor: 'white',
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 5,}}/>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});