'use strict'
const app = (() => {
  const $ = elementId => document.getElementById(elementId),
        match = (value, mapping) => mapping[value](),
        toggleHidden = (...elementId) =>
    elementId.map($).forEach(elem => {
      if (elem.classList.contains('hidden'))
        elem.classList.remove('hidden')
      else elem.classList.add('hidden')
    })

  let wordList

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

  function getWordList (download, file) {
    Papa.parse(file, {
      download,
      complete: (res, file) => {
        if (res.errors.length) {
          alert("Illegal format!")
          $('word-list').children[1].selectedIndex = 0
          $('start').disabled = true
        } else {
          wordList = res.data.map(elem => ({
            word: elem[0],
            kana: elem[1],
            meaning: elem[2],
            accent: Number.parseInt(elem[3])
          }))
        }
      }
    })
  }

  function importWordList () {
    $('get-file').click()
  }

  function importWordListFile () {
    const files = $('get-file').files
    if (files.length) {
      getWordList(false, files[0])
    } else {
      $('word-list').children[1].selectedIndex = 0
      $('start').disabled = true
    }
  }

  let yes = () => alert("impossible action"),
      no = yes,
      next = yes

  function start () {
    alert("Warning! The app is still WIP!")
    match($('mode').children[1].value, {
      'new words': () => {
        // TODO: build word list
      },
      'review': () => {

      }
    })
    toggleHidden('settings', 'flex', 'buttons')
  }

  return {
    changeMode,
    changeWordList, getWordList, importWordList, importWordListFile,
    start, yes, no, continue: next }
})()
