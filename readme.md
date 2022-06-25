**A small ES6 class to observe swipe events on a HTML element.**

# USAGE

```
import SwipeObserver from './import/swipeObserver.js'

const swipeObserver1 = new SwipeObserver(document.querySelector('.swipe1'), 'swipe-right, swipe-left')  

document.querySelector('.swipe1').addEventListener('swipe-right', e => {
  console.log('Swipe to the right !', e.detail)
}) 

document.querySelector('.swipe1').addEventListener('swipe-left', e => {
  console.log('Swipe to the left !', e.detail)
})
```

## What do I get in **detail** ?
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

## constructor
```
/**
* @param {HTMLElement} el : element to observe
* @param {string} events : list of events to be registered separated by a space
* @param {Integer} threshold : minimum distance in pixels between the start and the end of the movement
* @param {Integer} timeout : maximum delay in ms between the start and the end of the movement
*/
new SwipeObserver(el, events, threshold, timeout)
```

## Methods
```
/**
* @param {string} events : list of events to be registered separated by a space
* @param {Integer} threshold : minimum distance in pixels between the start and the end of the movement
* @param {Integer} timeout : maximum delay in ms between the start and the end of the movement
*/
on(events = 'swipe', threshold, timeout)
```

