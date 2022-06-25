//cSpell:words amstramgram amst

/**
 * @class PointerDetector
 * @description Singleton in charge of pointer events names standardization
 * @example :
    //Add the ofds__mouse class to the body when the current pointer used is a mouse
    //If the PointerEvent API is supported, we set a callback to the pointerDetector onChange method
    //If current pointer used changes, the function is called with the new pointer type currently used as parameter :
    //"pen", "touch" or "mouse"

    import pointerDetector from './import/pointerDetector.js'

    if (pointerDetector.data.pointerEventsInterface == 'pointer') {
      function onPointerChange(pointerType) {
        if (pointerType == 'mouse') {
          document.body.classList.add('ofds__mouse')
        } else {
          document.body.classList.remove('ofds__mouse')
        }
      }
      pointerDetector.onChange(onPointerChange)
      onPointerChange(pointerDetector.currentPointerType)
    } else if (pointerDetector.pointerEventsInterface == 'mouse') document.body.classList.add('ofds__mouse')
 * 
 * 
 * 
 */
class PointerDetector {
  /* -------------------------------------------------------------------------- */
  /*                               PRIVATE FIELDS                               */
  /* -------------------------------------------------------------------------- */
  //Stores the current pointer type ("pen", "touch" or "mouse")
  #currentPointerType

  /*
    Stores the corresponding names for :
    - pointerEventsInterface ("pointer", "touch" or "mouse")
    - pointerenter ("pointerenter", "none", "mouseenter")
    - pointerleave ("pointerleave", "none", "mouseleave")
    - pointerup ("pointerup", "touchend", "mouseup")
    - pointerdown ("pointerdown", "touchstart", "mousedown")
    - pointermove ("pointermove", "touchmove", "mousemove")
  */
  #data = {}

  /*
    Stores the callback(s) passed to the onChange() method
  */
  #changeCallbacks = new Set()

  /* -------------------------------------------------------------------------- */
  /*                                  GETTERS                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * @getter currentPointerType
   * @returns {string} "pen", "mouse" or "touch"
   */

  /**
   * @getter data
   * @returns {object}
   * {
   *  pointerEventsInterface: 'pointer',
   *  pointerenter: 'pointerenter',
   *  pointerleave: 'pointerleave',
   *  pointerup: 'pointerup',
   *  pointerdown: 'pointerdown',
   *  pointermove: 'pointermove'
   * }
   * OR
   * {
   *  pointerEventsInterface: 'touch',
   *  pointerenter: 'none',
   *  pointerleave: 'none',
   *  pointerup: 'touchend',
   *  pointerdown: 'touchstart',
   *  pointermove: 'touchmove'
   * }
   * OR
   * {
   *  pointerEventsInterface: 'mouse',
   *  pointerenter: 'mouseenter',
   *  pointerleave: 'mouseleave',
   *  pointerup: 'mouseup',
   *  pointerdown: 'mousedown',
   *  pointermove: 'mousemove'
   * }
   */


  /* -------------------------------------------------------------------------- */
  /*                                 CONSTRUCTOR                                */
  /* -------------------------------------------------------------------------- */
  constructor() {
    //If first instantiation
    if (!PointerDetector.pointerDetector) {
      const
        w = window,
        self = this,
        /*
          If PointerEvent is detected, pointerEventsInterface is set to 'pointer'.
          If not and if TouchEvent is detected, pointerEventsInterface is set to 'touch'.
          Finally, if neither PointerEvent nor TouchEvent are detected, pointerEventsInterface is set to 'mouse'.
        */
        pointerEventsInterface = this.#data.pointerEventsInterface = (w.PointerEvent) ? 'pointer' : (w.TouchEvent) ? 'touch' : 'mouse'

      //Setting the resulting events names
      this.#data.pointerenter = (pointerEventsInterface == 'touch') ? 'none' : pointerEventsInterface + 'enter'
      this.#data.pointerleave = (pointerEventsInterface == 'touch') ? 'none' : pointerEventsInterface + 'leave'
      this.#data.pointerup = (pointerEventsInterface == 'touch') ? 'touchend' : pointerEventsInterface + 'up'
      this.#data.pointerdown = (pointerEventsInterface == 'touch') ? 'touchstart' : pointerEventsInterface + 'down'
      this.#data.pointermove = pointerEventsInterface + 'move'

      //By default, we set the currentPointerType as touch
      //unless the detected pointerEventsInterface is 'mouse'
      this.#currentPointerType = (pointerEventsInterface == 'mouse') ? 'mouse' : 'touch'

      /*
        If the browser supports pointer events API, we have to know whether mouse is used or not to adapt the UI accordingly.
        When a change is detected, all the functions registered by the onChange method are executed.
      */
      if (pointerEventsInterface == 'pointer') {
        //Listening function
        function getPointerType(e) {
          //As long as no change is detected, we leave...
          if (e.pointerType == self.#currentPointerType) return false
          //If the pointer type is now mouse 
          if (e.pointerType == 'mouse') {
            //We don't need anymore to watch the pointermove event
            //If the pointer changes from mouse to touch,
            //the pointerdown event will be triggered before the pointermove event
            w.removeEventListener('pointermove', getPointerType)
          } else {
            //We're now waiting for a mouse event
            //We listen to the pointermove event which will be triggered
            //before pointerdown if the pointer changes from touch to mouse
            w.addEventListener('pointermove', getPointerType)
          }
          //Store the new detected pointerType
          self.#currentPointerType = e.pointerType
          //Execute the registered callbacks
          self.#changeCallbacks.forEach(function (fn) {
            fn.apply(self, [e.pointerType])
          })
        }
        //By default, we have defined the currentPointerType as touch
        //So we listen to the pointermove event to detect future mouse event
        w.addEventListener('pointermove', getPointerType)
        //And we listen to the pointerdown event
        //to detect if pointer type is 'pen' or 'touch'
        w.addEventListener('pointerdown', getPointerType)
      }
      PointerDetector.pointerDetector = this
    } 
    return PointerDetector.pointerDetector
  }
  /* -------------------------------------------------------------------------- */
  /*                               END CONSTRUCTOR                              */
  /* -------------------------------------------------------------------------- */




  /* -------------------------------------------------------------------------- */
  /*                                   GETTERS                                  */
  /* -------------------------------------------------------------------------- */
  /**
   * @getter currentPointerType
   * @returns {string} "pen", "mouse" or "touch"
   */
  get currentPointerType() {
    return this.#currentPointerType
  }

  /**
   * @getter data
   * @returns {object}
   * @example :
   * {
   *  pointerEventsInterface : 'touch',
   *  pointerenter: 'none',
   *  pointerleave: 'none',
   *  pointerup: 'touchup',
   *  pointerdown: 'touchdown',
   *  pointermove: 'touchmove'
   * }
   */
  get data() {
    return this.#data
  }
  /* -------------------------------------------------------------------------- */
  /*                                 END GETTERS                                */
  /* -------------------------------------------------------------------------- */



  /* -------------------------------------------------------------------------- */
  /*                               PUBLIC METHODS                               */
  /* -------------------------------------------------------------------------- */

  /**
   * 
   * @param {function} : function to be called when pointerType changes 
   */
  onChange(fn) {
    if (!this.#changeCallbacks.has(fn)) {
      this.#changeCallbacks.add(fn)
    }
    return this
  }

  /**
   * 
   * @param {function} : remove the given function from the onChange callbacks
   */
  offChange(fn) {
    if (this.#changeCallbacks.has(fn)) this.#changeCallbacks.delete(fn)
  }
  /* -------------------------------------------------------------------------- */
  /*                                  END CLASS                                 */
  /* -------------------------------------------------------------------------- */
}

//Creating, freezing and exporting an unique instance
const pointerDetector = new PointerDetector()
Object.freeze(pointerDetector)
export default pointerDetector