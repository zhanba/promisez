const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

function Promise(executor) {
  let self = this
  self.status = PENDING
  self.value = undefined
  self.reason = undefined
  self.onFulfilledCallbacks = []
  self.onRejectedCallbacks = []

  function resolve(value) {
    if (value instanceof Promise) {
      return value.then(resolve, reject)
    }

    setTimeout(() => {
      if (self.status === PENDING) {
        self.status = FULFILLED
        self.value = value
        self.onFulfilledCallbacks.forEach(cb => cb(value))
      }
    })
  }

  function reject(reason) {
    setTimeout(() => {
      if (self.status = PENDING) {
        self.status = REJECTED
        self.reason = reason
        self.onRejectedCallbacks.forEach(cb => cb(reason))
      }
    }, 0);
  }

  try {
    executor(resolve, reject);
  } catch (e) {
    reject(e)
  }
}

function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    return reject(new TypeError('Chaining cycle detected for promise!'))
  }

  let called = false
  if (x instanceof Promise) {
    if (x.status === PENDING) {
      x.then(y => {
        resolvePromise(promise2, y, resolve, reject)
      }, reason => reject(reason))
    } else {
      x.then(resolve, reject)
    }
  } else if (x != null && ((typeof x === 'object') || (typeof x === 'function'))) {
    try {
      let then = x.then
      if (typeof then === 'function') {
        then.call(x, y => {
          if (called) return
          called = true
          resolvePromise(promise2, y, resolve, reject)
        }, reason => {
          if (called) return
          called = true
          reject(reason)
        })
      } else {
        resolve(x)
      }
    } catch (e) {
      if (called) return
      called = true
      reject(e)
    }
  } else {
    resolve(x)
  }
}

Promise.prototype.then = function(onFulfilled, onRejected) {
  const self = this
  let newPromise

  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
  onRejected = typeof onRejected === 'function' ? onRejected : reason => {
    throw reason
  }

  if (self.status === FULFILLED) {
    return newPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          let x = onFulfilled(self.value)
          resolvePromise(newPromise, x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      }, 0);
    })
  }

  if (self.status === REJECTED) {
    return newPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          let x = onRejected(self.reason)
          resolvePromise(newPromise)
        } catch (e) {
          reject(e)
        }
      }, 0);
    })
  }

  if (self.status === PENDING) {
    return newPromise = new Promise((resolve, reject) => {
      self.onFulfilledCallbacks.push(value => {
        try {
          let x = onFulfilled(value)
          resolvePromise(newPromise, x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      })

      self.onRejectedCallbacks.push(reason => {
        try {
          let x = onRejected(reason)
          resolvePromise(newPromise, x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      })
    })
  }
}

Promise.all = function(promises) {
  return new Promise((resolve, reject) => {
    let done = gen(promises.length, resolve)
    promise.forEach((promise, index) => {
      promise.then(value => {
        done(idnex, value)
      }, reject)
    })
  })
}

function gen(length, resolve) {
  let count = 0
  let values = []
  return function(i, value) {
    values[i] = value
    if (++count === length) {
      resolve(values)
    }
  }
}

Promise.race = function(promises) {
  return new Promise((resolve, reject) => {
    promises.forEach((promise, index) => {
      promise.then(resolve, reject)
    })
  })
}

Promise.prototype.catch = function(value) {
  return new Promise(resolve => {
    resolve(value)
  })
}

Promise.reject = function(reason) {
  return new Promise((resolve, reject) => {
    reject(reason)
  })
}

Promise.deferred = function() {
  let defer = {}
  defer.promise = new Promise((resolve, reject) => {
    defer.resolve = resolve
    defer.reject = reject
  })
  return defer
}

try {
  module.exports = Promise
} catch (e) {
}
