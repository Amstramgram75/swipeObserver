**A small ES6 class to observe swipe events on a HTML element.**

# USAGE

```
import SwipeObserver from './import/swipeObserver.js'

const swipeObserver = new SwipeObserver(document.querySelector('.swipe'), 'swipe-right swipe-left')  

document.querySelector('.swipe').addEventListener('swipe-right', e => {
  console.log('Swipe to the right !', e.detail)
}) 

document.querySelector('.swipe').addEventListener('swipe-left', e => {
  console.log('Swipe to the left !', e.detail)
})

//Remove swipe-right event listener
swipeObserver.off('swipe-right')

//Add swipe-up event listener
swipeObserver.on('swipe-up')
```

## What do I get in **event.detail** ?
**name :** swipe / swipe-left / swipe-right / swipe-up / swipe-down / swiping / swiping-left / swiping-right / swiping-up / swiping-down  
**type :** swipe / swiping  
**dir :** left / right / up / down  
**pointerType :** mouse / touch /pen  
**startPageX :** start point pageX  
**startClientX :** start point clientX  
**pageX :** current point pageX  
**clientX :** current point clientX  
**startPageY :** start point pageY  
**startClientY :** start point clientY  
**pageY :** current point pageY  
**clientY :** current point clientY  
**deltaX :**  horizontal delta between start and current positions  
**deltaY :** vertical delta between start and current positions  
**duration :** time duration in ms since start 

## Constructor
```
/**
* @param {HTMLElement} el : element to observe
* @param {String} events : list of events to be registered separated by a space - default = ''
* @param {Integer} threshold : minimum distance in pixels between the start and the end of the movement - default = 20
* @param {Integer} timeout : maximum delay in ms between the start and the end of the movement - default 1000
*/
new SwipeObserver(el, events, threshold, timeout)
```
Note that there is no check about the *el* validity !  
All registered events share the same *threshold* and *timeout* values.  
Available events :
- swipe
- swipe-left
- swipe-right
- swipe-up
- swipe-down
- swiping
- swiping-left
- swiping-right
- swiping-up
- swiping-down  

If registered, *Swiping* events are dispatched during pointer movements.  
## Methods
### on
```
/**
* @param {String} events : list of events to registered separated by a space - default = 'swipe'
* @param {Integer} threshold : minimum distance in pixels between the start and the end of the movement
* @param {Integer} timeout : maximum delay in ms between the start and the end of the movement
*/

const swipeObserver = new SwipeObserver(el)
//Listen to swipe events with threshold = 20 and timeout = 1000
swipeObserver.on()
```
### off
```
/**
* @param {String} events : list of events to removed separated by a space
* if events is empty, all dispatchers are removed
*/
const swipeObserver = new SwipeObserver(el, 'swipe-left swiping-left swipe-right swiping-right')
//Remove swiping listeners
swipeObserver.off('swiping-left swiping-right')
//Remove all listeners
swipeObserver.off()
```
## Getters / Setters
### threshold
### timeout
## Getters
### active
Return true if there is at least one event registered.
### events
Return an array of the registered events.
