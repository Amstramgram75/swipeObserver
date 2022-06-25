import pointerDetector from './pointerDetector.js'

/**
 * CONSTRUCTOR
 * @param {HTMLElement} el - element to observe
 * @param {string} events  - list of events to be triggered by the observed element
 * The available events are :
 * swipe, swipe-left, swipe-right, swipe-up, swipe-down which are dispatched when the swipe ends
 * swiping, swiping-left, swiping-right, swiping-up, swiping-down which are dispatched during the swipe
 * 
 * @param {Integer} threshold - minimum distance in pixels between the start and the end of the movement
 * @param {Integer} timeout - maximum delay in ms between the start and the end of the movement
 * 
 * @example1 :
 * const swipeObserver1 = new SwipeObserver(document.querySelector('.swipe1'), 'swipe-right, swipe-left')
 * document.querySelector('.swipe1').addEventListener('swipe-right', e => console.log('Swipe to the right !', e.detail))
 * document.querySelector('.swipe1').addEventListener('swipe-left', e => console.log('Swipe to the left !', e.detail))
 * 
 * and later :
 * swipeObserver1.on('swiping')
 * document.querySelector('.swipe1').addEventListener('swiping', e => console.log(e.detail))
 * document.querySelector('.reset-swipe').addEventListener('click', _ => swipeObserver1.off('swipe-right, swipe-left'))
 * 
 * @example2 :
 * const swipeObserver2 = new SwipeObserver(document.querySelector('.swipe2'))
 * 
 * and later :
 * swipeObserver2.on()
 */



export default class SwipeObserver {

  //PRIVATE STATIC VARIABLES
  //Hold the name of the swipe events
  static #availableSwipeEvents = new Set(['swipe', 'swipe-left', 'swipe-right', 'swipe-up', 'swipe-down'])
  //Hold the name of the swiping events
  static #availableSwipingEvents = new Set(['swiping', 'swiping-left', 'swiping-right', 'swiping-up', 'swiping-down'])
  //Hold the list of all the events names
  static #availableEvents = new Set([...SwipeObserver.#availableSwipeEvents, ...SwipeObserver.#availableSwipingEvents])
  //Hold the name of the move event accordingly to the pointer used
  // - mousemove if currentPointerType is mouse
  // - touchmove otherwise
  static #moveEvent = (pointerDetector.currentPointerType == 'mouse') ? 'mousemove' : 'touchmove'
  static #endEvent = (pointerDetector.currentPointerType == 'mouse') ? 'mouseup' : 'touchend'

  //Observes the pointerDetector change event and set #moveEvent and #endEvent accordingly
  static {
    pointerDetector.onChange(pointerType => {
      SwipeObserver.#moveEvent = (pointerDetector.currentPointerType == 'mouse') ? 'mousemove' : 'touchmove'
      SwipeObserver.#endEvent = (pointerType == 'mouse') ? 'mouseup' : 'touchend'
    })
  }

  //PRIVATE VARIABLES
  //HTML element to be observed
  #el = null
  //Observer state
  #active = false
  //Default threshold : minimum distance in pixels between the start and the end of the movement
  #threshold = 20
  //Default timeout : maximum delay in ms between the start and the end of the movement
  #timeout = 1000
  //Timestamp of the beginning of the movement
  #t = null
  //PageX, pageY, clientX, clientY of the starting point of the movement
  #startPageX = null
  #startPageY = null
  #startClientX = null
  #startClientY = null
  //Delta between starting and current clientX/clientY values during the movement
  #deltaX = 0
  #deltaY = 0
  //Registered events
  #swipeEvents = new Set()
  #swipingEvents = new Set()


  //PRIVATE METHODS
  #startListener(e) {
    //Store relevant data
    this.#t = Date.now()
    e = e.touches ? e.touches[0] : e
    this.#startPageX = e.pageX
    this.#startPageY = e.pageY
    this.#startClientX = e.clientX
    this.#startClientY = e.clientY
    //Reset delta values
    this.#deltaX = this.#deltaY = 0
    //Set listeners
    this.#el.addEventListener(SwipeObserver.#moveEvent, this.#move, false)
    this.#el.addEventListener(SwipeObserver.#endEvent, this.#end, false)
    this.#el.addEventListener('mouseleave', this.#end, false)
  }
  //Binding
  #start = this.#startListener.bind(this)

  #moveListener(e) {
    if (!this.#startPageX || !this.#startPageY) return
    //If we are past the deadline
    if (Date.now() - this.#t > this.#timeout) {
      this.#endListener()
      return
    }
    if (e.cancelable) {
      e.preventDefault()
      const
        x = e.touches ? e.touches[0].clientX : e.clientX,
        y = e.touches ? e.touches[0].clientY : e.clientY
      if (!this.#el.contains(document.elementFromPoint(x, y))) {
        //The pointer is outside the observed element
        this.#end()
        return
      } else {
        //Compute delta values
        this.#deltaX = x - this.#startClientX
        this.#deltaY = y - this.#startClientY
        //If there is registered swiping event
        if (this.#swipingEvents.size > 0) {
          //Compute event data
          const data = this.#getEventData(true)
          if (!data) return
          //Find corresponding events to dispatch
          const ev = [...this.#swipingEvents].filter(e => (e == 'swiping' || e == data.name))
          if (ev.length == 0) return
          ev.forEach(e => this.#el.dispatchEvent(new CustomEvent(e, { bubbles: true, cancelable: true, detail: data })))
        }
      }
    }
  }
  //Binding
  #move = this.#moveListener.bind(this)

  #endListener() {
    //Compute event data
    const data = this.#getEventData()
    if (Date.now() - this.#t < this.#timeout && data && this.#swipeEvents.size > 0) {
      //Find corresponding events to dispatch
      const ev = [...this.#swipeEvents].filter(e => (e == 'swipe' || e == data.name))
      if (ev.length > 0) {
        ev.forEach(e => this.#el.dispatchEvent(new CustomEvent(e, { bubbles: true, cancelable: true, detail: data })))
      }
    }
    // reset values
    this.#startPageX = this.#startClientX = this.#startPageY = this.#startClientY = this.#t = null
    //Clean event listeners
    this.#el.removeEventListener(SwipeObserver.#moveEvent, this.#move)
    this.#el.removeEventListener(SwipeObserver.#endEvent, this.#end)
    this.#el.removeEventListener('mouseleave', this.#end)
  }
  //Binding
  #end = this.#endListener.bind(this)


  #getEventData(isSwiping = false) {
    let eventType = '', eventData = {}
    if (Math.abs(this.#deltaX) > Math.abs(this.#deltaY)) { // most significant
      if (Math.abs(this.#deltaX) > this.#threshold) {
        eventType = (this.#deltaX < 0) ? 'swipe-left' : 'swipe-right'
      }
    }
    else if (Math.abs(this.#deltaY) > this.#threshold) {
      eventType = (this.#deltaY < 0) ? 'swipe-up' : 'swipe-down'
    }
    if (eventType == '') return false
    const type = isSwiping ? 'swiping' : 'swipe'
    eventData = {
      name: type + eventType.replace(/swipe/, ''),
      type: type,
      dir: eventType.replace(/swipe-/, ''),
      pointerType: pointerDetector.currentPointerType,
      startPageX: parseInt(this.#startPageX, 10),
      startClientX: parseInt(this.#startClientX, 10),
      pageX: parseInt(this.#startPageX, 10) + parseInt(this.#deltaX, 10),
      clientX: parseInt(this.#startClientX, 10) + parseInt(this.#deltaX, 10),
      startPageY: parseInt(this.#startPageY, 10),
      startClientY: parseInt(this.#startClientY, 10),
      pageY: parseInt(this.#startPageY, 10) + parseInt(this.#deltaY, 10),
      clientY: parseInt(this.#startClientY, 10) + parseInt(this.#deltaY, 10),
      deltaX: parseInt(this.#deltaX, 10),
      deltaY: parseInt(this.#deltaY, 10),
      duration: Date.now() - this.#t
    }
    return eventData
  }

  /* -------------------------------------------------------------------------- */
  /*                              CONSTRUCTOR                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * 
   * @param {HTMLElement} el : element to observe
   * @param {string} events : list of events to be registered separated by a space
   * @param {Integer} threshold : minimum distance in pixels between the start and the end of the movement
   * @param {Integer} timeout : maximum delay in ms between the start and the end of the movement
   */
  constructor(el, events, threshold, timeout) {
    this.#el = el
    if (typeof events === 'string') {
      this.on(events, threshold, timeout)
    } else {
      this.#threshold = (threshold > 0) ? threshold : this.#threshold
      this.#timeout = (timeout > 0) ? timeout : this.#timeout
    }
  }
  /* -------------------------------------------------------------------------- */
  /*                              END CONSTRUCTOR                               */
  /*                                  METHODS                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * 
   * @param {string} events : list of events to be registered separated by a space
   * @param {Integer} threshold : minimum distance in pixels between the start and the end of the movement
   * @param {Integer} timeout : maximum delay in ms between the start and the end of the movement
   */
  on(events = 'swipe', threshold, timeout) {
    events = events.split(' ').filter(e => SwipeObserver.#availableEvents.has(e))
    if (events.length > 0) {
      events.forEach(e => {
        if (SwipeObserver.#availableSwipeEvents.has(e)) this.#swipeEvents.add(e)
        if (SwipeObserver.#availableSwipingEvents.has(e)) this.#swipingEvents.add(e)
      })
      this.#threshold = (threshold > 0) ? threshold : this.#threshold
      this.#timeout = (timeout > 0) ? timeout : this.#timeout
      if (!this.#active) {
        this.#active = true
        this.#el.addEventListener(pointerDetector.data.pointerdown, this.#start, false)
      }
    }
  }

  /**
   * 
   * @param {string} events : list of event to be removed separated by a space
   * if there is no parameter, all registered events are removed
   */
  off(events) {
    const self = this
    function clean() {
      self.#active = false
      self.#el.removeEventListener(pointerDetector.data.pointerdown, self.#start)
      self.#el.removeEventListener(SwipeObserver.#moveEvent, self.#move)
      self.#el.removeEventListener(SwipeObserver.#endEvent, self.#end)
      self.#el.removeEventListener('mouseleave', self.#end)
    }
    if (typeof events === 'string') {
      events = events.split(' ').filter(e => SwipeObserver.#availableEvents.has(e))
      events.forEach(e => {
        if (SwipeObserver.#availableSwipeEvents.has(e)) this.#swipeEvents.delete(e)
        if (SwipeObserver.#availableSwipingEvents.has(e)) this.#swipingEvents.delete(e)
      })
      if (this.#swipeEvents.size == 0 && this.#swipingEvents.size == 0) clean()
    } else {
      this.#swipeEvents.clear()
      this.#swipingEvents.clear()
      clean()
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                             END METHODS                                    */
  /*                          GETTERS / SETTERS                                 */
  /* -------------------------------------------------------------------------- */
  /**
   * @getter active
   * @returns {boolean} state of the observer
   */
  get active() {
    return this.#active
  }
  /**
   * @getter threshold
   * @returns {int}
   */
  get threshold() {
    return this.#threshold
  }
  /**
   * @setter {integer} threshold
   */
  set threshold(t) {
    this.#threshold = (t > 0) ? t : this.#threshold
  }
  /**
   * @getter timeout
   * @returns {int}
   */
  get timeout() {
    return this.#timeout
  }
  /**
   * @setter {integer} timeout
   */
  set timeout(t) {
    this.#timeout = (t > 0) ? t : this.#timeout
  }

  /**
   * @getter events
   * @returns {array}
   */
  get events() {
    return [...this.#swipeEvents, ...this.#swipingEvents]
  }

  /* -------------------------------------------------------------------------- */
  /*                          END GETTERS / SETTERS                             */
  /* -------------------------------------------------------------------------- */

}