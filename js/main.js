
import pointerDetector from './import/pointerDetector.js'
import {_$, _$$} from './import/selector.js'
import throttle from './import/throttle.js'
import SwipeObserver from './import/swipeObserver.js'

const 
	finalInitCounterValue = 1,
	w = window,
	$ = _$(),//$() = document.body, $('div) = document.body.querySelector('div')
	$$ = _$$()//$$('div) = document.body.querySelectorAll('div')
let initCounter = 0

/* -------------------------------------------------------------------------- */
/*                          POINTER EVENTS MANAGEMENT                         */
/* -------------------------------------------------------------------------- */
if (pointerDetector.data.pointerEventsInterface == 'pointer') {
	function onPointerChange(e) {
		if (e == 'mouse') {
			$().classList.add('ofds__mouse')
		} else {
			$().classList.remove('ofds__mouse')
		}
	}
	pointerDetector.onChange(onPointerChange)
	onPointerChange(pointerDetector.currentPointerType)
} else if (pointerDetector.pointerEventsInterface == 'mouse') $().classList.add('ofds__mouse')
/* -------------------------------------------------------------------------- */
/*                        END POINTER EVENTS MANAGEMENT                       */
/* -------------------------------------------------------------------------- */

throttle('resize', 'throttleResize')
w.addEventListener('throttleResize', resize)

w.addEventListener('load', _ => {
	init('Window load event dispatched')
})



function init (str) {
	console.log(str)
	initCounter ++
  if (initCounter < finalInitCounterValue) return
	console.log('init function start')
	const swipe = new SwipeObserver(document.querySelector('.swipe'), 'swipe swipe-left swiping')
	document.querySelector('.swipe').addEventListener('swipe', function(e){console.log('SWIPE', e.detail)})
	document.querySelector('.swipe').addEventListener('swipe-left', function(e){console.log('SWIPE-LEFT', e.detail)})
	document.querySelector('.swipe').addEventListener('swiping', function(e){console.log('SWIPING', e.detail)})
	document.querySelector('.inswipe').addEventListener('click', function(e){
		if(swipe.active) {
			swipe.off()
		} else swipe.on('swipe-left')
		console.log(swipe.events)
	})
	console.log(swipe.events)
}

function resize(){
	console.log('windowsWidth =', w.innerWidth,'\nwindowsHeight =', w.innerHeight)
}