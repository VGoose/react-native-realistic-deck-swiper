
# React-Native-Swipeable-Deck

Swipeable deck with realistic physics, based on NYer Today app's cartoons swipe deck. 

![Demo](https://media.giphy.com/media/oX7tHujPDy8mBs246V/giphy.gif)
## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.


## Installing


## Deck and Card

|Props | required | type| description | default
|:---|:---|:---| :---|:---:
| cardsData | required| array | data array | |
renderCard | required | function | render function, receives cardsData element | |
|deckSize| optional | integer | number of cards rendered and visible at a time | 3|
|offsetAngleMin | optional| integer| minimum vertical angle offset of cards in degrees| -4|
|offsetAngleMax| optional | integer | maximum vertical angle offset of cards in degrees | 4|
|infiniteSwipe|optional|boolean|renderCard cycles through cardsData infinitely | true|
|startIndex| optional | integer | cardsData index for first card | 0|
|velocityThreshold| optional | positive number | velocity magnitude - compared to gesture velocity magnitude at release to determine successful or unsuccessful swipe | 0.4|

## Animation

|Props | required | type| description | default
|:---|:---|:---| :---|:---:
|rotationMultiplier| optional | positive number | multiplier to rotational animation input range, > 1 will slow down rotation animation, < 1 will speed up | 1 |
|topCardAnimationDuration|optional| positive number | milisecond duration of  top card animation after successful swipe (flying away)| 1000 | 
|bottomCardAnimationDuration|optional| positive number | milisecond duration of  bottom card animation | 500
|springConstants|optional| object  | control reset animation on unsuccessful swipe, object signature: { stiffness, damping, mass } | {stiffness: 50, damping: 30, mass: 0.5} | 

## Callbacks

|Props | required | type| description | default
|:---|:---|:---| :---|:---:
|onSwiped| optional | function | callback function to be called on successful card swipe, at gesture release, with velocity vector object {vx, vy}| |
|onReset|optional|function|callback function to be called on unsuccessful card swipe, at gesture release, with velocity vector object {vx, vy} ||

## Card Style
\*style objects can be modified but default properties cannot be changed

|Props | required | type| description | default
|:---|:---|:---| :---|:---:
|style|optional|object|card style object||
|containerStyle|optional|object| Swiper container view style object |{position: absolute\*, transform: []\*, zIndex: number\*}|

## Author

Anh Vo

## License

This project is licensed under the MIT License.

## Acknowledgments






