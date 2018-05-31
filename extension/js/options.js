(function () {
  'use strict'

  if (window.chrome) {
    window.browser = window.chrome
  } else {
    window.browser = browser
  }

  var saveOptions = function () {
    window.browser.storage.local.set({
      'tweet': document.getElementById('tweet').checked,
      'retweet': document.getElementById('retweet').checked,
      'reply': document.getElementById('reply').checked,
      'breathCount': document.getElementById('breath-count').value,
      'breathLength': document.getElementById('breath-length').value,
      'breathPause': document.getElementById('breath-pause').value
    })
  }

  var restoreOptions = function () {
    window.browser.storage.local.get({
      'tweet': true,
      'retweet': true,
      'reply': true,
      'breathCount': 4,
      'breathLength': 3.5,
      'breathPause': 2
    }, function (settings) {
      document.getElementById('tweet').checked = settings.tweet
      document.getElementById('retweet').checked = settings.retweet
      document.getElementById('reply').checked = settings.reply
      document.getElementById('breath-count').value = settings.breathCount
      document.getElementById('breath-length').value = settings.breathLength
      document.getElementById('breath-pause').value = settings.breathPause
    })
  }

  document.addEventListener('DOMContentLoaded', function () {
    console.log('calm twitter: loading options')
    restoreOptions()
  })

  let inputs = document.querySelectorAll('input')

  for (let i = 0; i < inputs.length; i++) {
    inputs[i].addEventListener('change', function () {
      console.log('calm twitter: inputs saved')
      saveOptions()
    })
  }
})()
