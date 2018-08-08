'use strict'
const app = (() => {
  const $ = elementId => document.getElementById(elementId)
  const match = (value, mapping) => mapping[value]()
  const toggleHidden = (...elementId) =>
    elementId.map($).forEach(elem => {
      if (elem.classList.contains('hidden'))
        elem.classList.remove('hidden')
      else elem.classList.add('hidden')
    })

  function changeMode () {
    toggleHidden('word-list', 'word-number', 'review-number')
    match($('mode').children[1].value, {
      'new words': () => {
        if ($('word-list').children[1].value === '')
          $('start').disabled = true
        else $('start').disabled = false
      },
      'review': () => {
        $('start').disabled = false
      }
    })
  }

  function changeWordList () {
    $('start').disabled = false
  }

  function start () {
    alert("Warning! The app is still WIP!")
    toggleHidden('settings', 'flex', 'buttons')
  }

  function yes () {
    alert("yes")
  }

  function no () {
    alert("no")
  }

  function next () {
    alert("next")
  }

  return { changeMode, changeWordList, start, yes, no, continue: next }
})()
