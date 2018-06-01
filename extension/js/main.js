(function () {
  'use strict'

  if (window.chrome) {
    console.log('calm twitter:', 'chrome browser')
    window.browser = window.chrome
  } else {
    console.log('calm twitter:', 'firefox browser')
    window.browser = browser
  }

  let draftButton
  let tweetButton
  let tweetBoxToolbar

  let pauseTweet = true
  let pauseRetweet = true
  let pauseReply = true

  let breathCount = 4
  let breathLength = 3500
  let breathPause = 2000

  // Set up overlay

  let overlay = document.createElement('div')
  overlay.id = 'twitter-zen-overlay'

  let innerCircle = document.createElement('div')
  innerCircle.id = 'twitter-zen-circle-inner'

  let outerCircle = document.createElement('div')
  outerCircle.id = 'twitter-zen-circle-outer'

  let circleContainer = document.createElement('div')
  circleContainer.id = 'twitter-zen-circle-container'

  outerCircle.appendChild(innerCircle)
  circleContainer.appendChild(outerCircle)
  overlay.appendChild(circleContainer)
  document.body.appendChild(overlay)

  window.browser.storage.local.get({
    'tweet': true,
    'retweet': true,
    'reply': true,
    'breathCount': 4,
    'breathLength': 3.5,
    'breathPause': 2
  }, function (res) {
      pauseTweet = res.tweet
      pauseRetweet = res.retweet
      pauseReply = res.reply

      breathCount = parseInt(res.breathCount)
      breathLength = parseFloat(res.breathLength) * 1000
      breathPause = parseFloat(res.breathPause) * 1000

      console.log('calm twitter:', 'tweet', pauseTweet, 'retweet', pauseRetweet, 'reply', pauseReply, 'count', breathCount, 'speed', breathLength, 'pause', breathPause)
    })

  let tweetButtonObserver = new MutationObserver(function () {
    draftButton.disabled = tweetButton.disabled
  })

  // Monitor attribute change in the home tweet box to register click

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
            setUpDraftButton()
          }
        })
        homeTweetBoxObserver.observe(homeTweetBox, {
          attributes: true
        })
      }
    }).observe(document.body, {
      childList: true
    })
  }

  function setUpDraftButton () {
    try {
      draftButton.parentElement.removeChild(draftButton)
      draftButton = null
      console.log('calm twitter:', 'removed old draft button from dom')
    } catch (e) {
      // pass
    } finally {
      draftButton = tweetButton.cloneNode(true)
      draftButton.className = 'EdgeButton EdgeButton--primary'
      draftButton.id = 'tweet-zen-draft-button'
      draftButton.querySelectorAll('span').forEach(function (element) {
        element.textContent = 'Breathe'
        element.className = element.className + ' tweet-zen-draft-span'
      })

      tweetBoxToolbar.appendChild(draftButton)
      tweetButtonObserver.observe(tweetButton, {
        attributes: true
      })
      console.log('calm twitter:', 'added new draft button to dom')
      showDraftButton()
    }
  }

  function hideDraftButton () {
    console.log('calm twitter:', 'hiding draft button')
    tweetButton.style.display = 'block'
    draftButton.style.display = 'none'
  }

  function showDraftButton () {
    console.log('calm twitter:', 'showing draft button')
    tweetButton.style.display = 'none'
    draftButton.style.display = 'block'
  }

  // Click Events

  function clickedDraft (elem) {
    if (draftButton.disabled) return false

    if (elem.id === 'tweet-zen-draft-button' || elem.closest('#tweet-zen-draft-button')) {
      console.log('calm twitter:', 'draft')
      return true
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
      console.log('calm twitter:', 'reply')
      return true
    }
  }

  function clickedRetweet () {
    if (!pauseRetweet) return false

    let retweetDialogDisplay = document.getElementById('retweet-tweet-dialog').style.display
    if (retweetDialogDisplay === 'block') {
      tweetBoxToolbar = document.getElementById('retweet-tweet-dialog').querySelector('.RetweetDialog-footer')
      tweetButton = tweetBoxToolbar.querySelector('.retweet-action')
      console.log('calm twitter:', 'retweet')
      return true
    }
  }

  function clickedTweet () {
    if (!pauseTweet) return false

    let otherTimelineDisplay = document.getElementById('Tweetstorm-dialog').style.display
    if (otherTimelineDisplay === 'block') {
      tweetBoxToolbar = document.getElementById('Tweetstorm-dialog').querySelector('.TweetBoxToolbar')
      tweetButton = tweetBoxToolbar.querySelector('.js-send-tweets')
      console.log('calm twitter:', 'tweet')
      return true
    }
  }

  function animateBreath () {
    console.log('calm twitter:', 'animation starting')
    // Offset start/stop of inhalation/exhalation
    let keyFrameOffset = breathPause / (2 * (breathPause + breathLength))
    overlay.style.display = 'block'

    let breatheIn = innerCircle.animate([{
      opacity: 0.2,
      transform: 'scale(0.2)',
      offset: 0.0
    },
    {
      opacity: 0.2,
      transform: 'scale(0.2)',
      offset: keyFrameOffset
    },
    {
      opacity: 0.8,
      transform: 'scale(0.9)',
      offset: 1.0 - keyFrameOffset
    },
    {
      opacity: 0.8,
      transform: 'scale(0.9)',
      offset: 1.0
    }
    ], {
      duration: breathPause + breathLength,
      easing: 'linear',
      direction: 'alternate',
      iterations: breathCount * 2
    })

    breatheIn.onfinish = function () {
      console.log('calm twitter:', 'animation done')
      overlay.style.display = 'none'
      hideDraftButton()
    }
  }

  // Register keydown until see first tweet/RT/reply click

  let _listener = function () {
    if (clickedRetweet() || clickedTweet() || clickedReply()) {
      setUpDraftButton()
    }
  }

  document.addEventListener('keydown', _listener)

  document.addEventListener('click', function (event) {
    console.log('calm twitter:', event.target)
    if (clickedDraft(event.target)) {
      animateBreath()
    } else if (clickedRetweet() || clickedTweet() || clickedReply()) {
      document.removeEventListener('keydown', _listener)
      setUpDraftButton()
    }
  })
})()
