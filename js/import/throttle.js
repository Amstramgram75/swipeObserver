/**
 * 
 * @param {String} events - Name of the events to throttle (separated by space)
 * @param {String} name 
 * @param {EventTarget} obj 
 */
export default function throttle(events, name, obj) {
  if (typeof obj == 'undefined') {
    if (typeof window !== 'undefined') obj = window; else return
  }
  let
    running = false,
    func = (e) => {
      if (running) return
      running = true
      requestAnimationFrame(() => {
        obj.dispatchEvent(new CustomEvent(name, { detail: e }))
        running = false
      })
    }
  events.split(' ').forEach(event => obj.addEventListener(event, func))
}
