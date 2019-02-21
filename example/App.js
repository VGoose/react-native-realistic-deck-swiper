import React from 'react';
import { View } from 'react-native';

import Swiper from './swiper'

const Data = [
  { id: "1" },
  { id: "2" },
  { id: "3" },
  { id: "4" },
  { id: "5" },
]
export default class App extends React.Component {
  _renderCard = (item) => {
    return <View style={{ width: 300, height: 400, borderRadius: 5 }}>
    </View>
  }
  render() {
    return (
      <Swiper
        cardsData={Data}
        renderCard={this._renderCard}
        visibleDeckSize={3}
        offSetAngleMin={-3}
        offSetAngleMax={3}
        velocityThreshold={0.4}
        rotationMultiplier={1}
        bottomCardAnimationDuration={500}
        onSwiped={(vector) => console.log('vx is: ', vector.vx, ' ', 'vy is: ', vector.vy)}
        onReset={() => console.log('reset')}
        containerStyle={{
          display: 'flex',
          alignItems: 'center',
          // justifyContent: 'center', //TODO
        }}
        style={{
          margin: 20,
          backgroundColor: 'white',
          borderColor: 'black',
          borderWidth: 1,
          borderRadius: 5,

        }}
      />
    );
  }
}



