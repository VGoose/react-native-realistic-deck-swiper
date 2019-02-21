import React from 'react';
import { View, Text } from 'react-native';

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
    return <View style={{
      width: 300,
      height: 400,
      borderRadius: 5,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Text style={{ fontSize: 80 }}>{item.id}</Text>
    </View>
  }
  render() {
    return (
      <View style={{flex: 1}}>
        <Swiper
          cardsData={Data}
          renderCard={this._renderCard}
          startIndex={-4}
          visibleDeckSize={3}
          offSetAngleMin={-3}
          offSetAngleMax={3}
          velocityThreshold={0.4}
          rotationMultiplier={1}
          bottomCardAnimationDuration={500}
          onSwiped={(vector) => console.log('vx is: ', vector.vx, ' ', 'vy is: ', vector.vy)}
          onReset={(vector) => console.log('reset ', vector.vx)}
          containerStyle={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          style={{
            margin: 20,
            backgroundColor: 'white',
            borderColor: 'black',
            borderWidth: 1,
            borderRadius: 5,
  
          }}
        />
      </View>
    );
  }
}



