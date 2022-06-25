**A small ES6 class to observe swipe events on a HTML element.**

# USAGE

`const swipeObserver1 = new SwipeObserver(document.querySelector('.swipe1'), 'swipe-right, swipe-left')
document.querySelector('.swipe1').addEventListener('swipe-right', e => console.log('Swipe to the right !', e.detail))
document.querySelector('.swipe1').addEventListener('swipe-left', e => console.log('Swipe to the left !', e.detail))`