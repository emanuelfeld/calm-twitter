(function () {
  'use strict'

  var optionsHandler = function (fn) {
      let browserStorage
      
      if (!!window.chrome) {
        window.browser = window.chrome
      } else {
        window.browser = browser
      }

      window.browser.storage.sync.get(['testSync'], function (res) { 
        try {
          let syncEnabled = res.testSync
          browserStorage = window.browser.storage.sync
          console.log(`OPTIONS: using storage sync`)
        } catch (e) {
          browserStorage = window.browser.storage.local
          console.log(`OPTIONS: using storage local`)
        }
        fn(browserStorage)
      })
  }

  var saveOptions = function (browserStorage) {
    browserStorage.set({
      'tweet': document.getElementById('tweet').checked,
      'retweet': document.getElementById('retweet').checked,
      'reply': document.getElementById('reply').checked,
    }, function () {
      let status = document.getElementById('status')
      status.textContent = 'options saved!'
      setTimeout(function () {
        status.textContent = ''
      }, 750)
    })
  }

  var restoreOptions = function (browserStorage) {
    browserStorage.get({
      'tweet': true,
      'retweet': true,
      'reply': true,
    }, function (settings) {
      document.getElementById('tweet').checked = settings.tweet
      document.getElementById('retweet').checked = settings.retweet
      document.getElementById('reply').checked = settings.reply
    })
  }

  document.addEventListener('DOMContentLoaded', function () {
    optionsHandler(restoreOptions)
  })

  document.getElementById('save').addEventListener('click', function () {
    optionsHandler(saveOptions)
  })
})()
