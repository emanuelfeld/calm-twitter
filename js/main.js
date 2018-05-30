(function () {
  'use strict'
  
  let tweetBoxToolbar = null
  let tweetButton = null
  let draftButton = null

  let pauseTweet = false
  let pauseRetweet = false
  let pauseReply = false

  if (!!window.chrome) {
    window.browser = window.chrome
  } else {
    window.browser = browser
  }

  window.browser.storage.sync.get(['testSync'], function (res) {
    let browserStorage
    try {
      let syncEnabled = res.testSync
      browserStorage = window.browser.storage.sync
    } catch (e) {
      browserStorage = window.browser.storage.local
    }

    browserStorage.get(['tweet', 'retweet', 'reply'], function (settings) {
      pauseTweet = settings.tweet
      pauseRetweet = settings.retweet
      pauseReply = settings.reply
    })
  })

  let tweetButtonObserver = new MutationObserver(function () {
    draftButton.disabled = tweetButton.disabled
  })

  // Display

  let Animation = function () {
    this.overlay = document.createElement('div')
    this.overlay.id = 'twitter-zen-overlay'

    this.innerCircle = document.createElement('div')
    this.innerCircle.id = 'twitter-zen-circle-inner'

    let outerCircle = document.createElement('div')
    outerCircle.id = 'twitter-zen-circle-outer'

    let circleContainer = document.createElement('div')
    circleContainer.id = 'twitter-zen-circle-container'

    outerCircle.appendChild(this.innerCircle)
    circleContainer.appendChild(outerCircle)
    this.overlay.appendChild(circleContainer)
    document.body.appendChild(this.overlay)
  }

  Animation.prototype = {
    show: function () {
      this.overlay.style.display = 'block'
    },
    start: function () {
      this.overlay.style.display = 'block'
      this.innerCircle.setAttribute('breathe', 'true')
    },

    stop: function () {
      this.innerCircle.setAttribute('breathe', 'false')
      this.overlay.style.display = 'none'
    }
  }

  function addDraftButton () {
    try {
      draftButton.parentElement.removeChild(draftButton)
      draftButton = null
    } catch (e) {
      // pass
    } finally {
      draftButton = tweetButton.cloneNode(true)
      draftButton.className = 'EdgeButton EdgeButton--primary'
      draftButton.id = 'tweet-zen-draft-button'
      draftButton.querySelectorAll('span').forEach(function (element) {
        element.textContent = 'Contemplate'
        element.className = element.className + ' tweet-zen-draft-span'
      })

      tweetBoxToolbar.appendChild(draftButton)
      tweetButtonObserver.observe(tweetButton, { attributes: true })
      showDraftButton()
    }
  }

  function hideDraftButton () {
    tweetButton.style.display = 'block'
    draftButton.style.display = 'none'
  }

  function showDraftButton () {
    tweetButton.style.display = 'none'
    draftButton.style.display = 'block'
  }

  // Click events

  function clickedDraft (elem) {
    if (elem.id === 'tweet-zen-draft-button' || elem.closest('#tweet-zen-draft-button')) {
      console.log('draft')
      let animation = new Animation()
      animation.start()
      setTimeout(function () {
        animation.stop()
        hideDraftButton()
      }, 14000)
    }
  }

  function clickedReply () {
    if (!pauseReply) return false

    let globalTweetDialogDisplay = document.getElementById('global-tweet-dialog').style.display
    if (globalTweetDialogDisplay === 'block') {
      tweetBoxToolbar = document.getElementById('global-tweet-dialog').querySelector('.TweetBoxToolbar')
    } else if (document.querySelector('[id^=tweet-box-reply-to')) {
      tweetBoxToolbar = document.getElementById('permalink-overlay').querySelector('.TweetBoxToolbar')
    } else {
      tweetBoxToolbar = null
    }

    if (tweetBoxToolbar) {
      tweetButton = tweetBoxToolbar.querySelector('.TweetBoxToolbar-tweetButton > button')
      return true
    }
  }

  function clickedRetweet () {
    if (!pauseRetweet) return false

    let retweetDialogDisplay = document.getElementById('retweet-tweet-dialog').style.display
    if (retweetDialogDisplay === 'block') {
      tweetBoxToolbar = document.getElementById('retweet-tweet-dialog').querySelector('.RetweetDialog-footer')
      tweetButton = tweetBoxToolbar.querySelector('.retweet-action')
      return true
    }
  }

  function clickedTweet () {
    if (!pauseTweet) return false

    let otherTimelineDisplay = document.getElementById('Tweetstorm-dialog').style.display
    if (otherTimelineDisplay === 'block') {
      tweetBoxToolbar = document.getElementById('Tweetstorm-dialog').querySelector('.TweetBoxToolbar')
      tweetButton = tweetBoxToolbar.querySelector('.js-send-tweets')
      return true
    }
  }

  // Monitor homepage loading and main homepage tweet box attributes

  let href = document.location.href

  if (pauseTweet && (href === 'https://twitter.com/' || href.startsWith('https://twitter.com/?'))) {
    new MutationObserver(function () {
      let homeTweetBox = document.getElementById('tweet-box-home-timeline')
      if (homeTweetBox) {
        this.disconnect()
        let homeTweetBoxObserver = new MutationObserver(function () {
          if (homeTweetBox.classList.contains('is-showPlaceholder')) {
            homeTweetBox.click()
            tweetBoxToolbar = homeTweetBox.closest('div.timeline-tweet-box').querySelector('.TweetBoxToolbar')
            tweetButton = tweetBoxToolbar.querySelector('button.tweet-action')
            addDraftButton()
          }
        })
        homeTweetBoxObserver.observe(homeTweetBox, {attributes: true})
      }
    }).observe(document.body, {childList: true})
  }

  // Register on keydown until see first tweet/RT/reply click

  let _listener = function () {
    if (clickedRetweet() || clickedTweet() || clickedReply()) {
      addDraftButton()
    }
  }

  document.addEventListener('keydown', _listener, true)

  document.addEventListener('click', function (event) {
    if (clickedDraft(event.srcElement)) {
      // pass
    } else if (clickedRetweet() || clickedTweet() || clickedReply()) {
      document.removeEventListener('keydown', _listener, true)
      addDraftButton()
    }
  })
})()
