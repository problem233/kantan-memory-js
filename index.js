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
          wordList = {
            name: file.name ? file.name : file,
            data: res.data.map(elem => ({
              word: elem[0],
              kana: elem[1],
              meaning: elem[2],
              accent: Number.parseInt(elem[3])
            }))
          }
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

  const impossibleAct = () => alert("impossible action")
  const toggleButtons = () =>
    $('buttons').children.forEach(elem => elem.disabled = !elem.disabled)
  const makeAccent = word => ((word.accent.toString == 'NaN') 
    ? "" : "（" + word.accent + "）")

  let yes = impossibleAct,
      no = impossibleAct,
      next = impossibleAct

  function start () {
    let process = Number.parseInt(
      localStorage['process_' + wordList.name]
      ? localStorage['process_' + wordList.name]
      : "0")
    const incProcess = () => {
      process++
      localStorage['process_' + wordList.name] = process.toString()
    }
    const userData = JSON.parse(
      localStorage.userData ? localStorage.userData : "{}")
    function askKana (wordList) {
      function showKana (word) {
        $('kana').innerText = word.kana
        $('word').innerText = ""
        $('meaning').innerText = ""
      }
      if (!wordList.reviewList.length) {
        showKana(wordList.reviewList[0].word)
      } else {
        showKana(wordList.newWordList[0])
      }
      toggleButtons()
      yes = () => showAnswer(wordList)
      no = () => askWord(wordList)
      next = impossibleAct
    }
    function askWord (wordList) {
      function showWord (word) {
        $('kana').innerText = ""
        $('word').innerText = word.word + makeAccent(word)
        $('meaning').innerText = ""
      }
      if (!wordList.reviewList.length) {
        showWord(wordList.reviewList[0].word)
      } else {
        showWord(wordList.newWordList[0])
      }
      yes = no = () => showAnswer(wordList)
      next = impossibleAct
    }
    function showAnswer (wordList) {
      function showAnswer_ (word) {
        $('kana').innerText = word.kana + makeAccent(word)
        $('word').innerText = word.word
        $('meaning').innerText = word.meaning
      }
      if (!wordList.reviewList.length) {
        showAnswer_(wordList.reviewList[0].word)
        if (wordList.reviewList[0].familarity < 2)
          wordList.reviewList[0].familarity++ // TODO familarity up&downgrade
      } else {
        showAnswer_(wordList.newWordList[0])
      }
      toggleButtons()
      yes = no = impossibleAct
      if (!wordList.reviewList.length)
        next = () => askKana({
          reviewList: wordList.reviewList.slice(1),
          newWordList: wordList.newWordList
        })
      else if (!wordList.newWordList.length)
        next = () => askKana({
          reviewList: [],
          newWordList: wordList.newWordList.slice(1)
        })
      else next = () => {
        $('kana').innerText = ""
        $("word").innerText = "All words are finished!"
        $("meaning").innerText = ""
        $('buttons').children[2].disabled = true
      }
    }
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
    start, yes: () => yes(), no: () => no(), continue: () => next() }
})()
