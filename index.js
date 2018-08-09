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
    toggleHidden('word-list', 'word-number')
    match($('mode').children[1].value, {
      'new words': () => {
        if (($('word-list').children[1].value === '') || (!wordList))
          $('start').disabled = true
        else $('start').disabled = false
      },
      'review': () => {
        $('start').disabled = false
      }
    })
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
            list: res.data.map(elem => ({
              text: elem[0],
              kana: elem[1],
              meaning: elem[2],
              accent: Number.parseInt(elem[3])
            }))
          }
          $('start').disabled = false
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

  const impossible = () => alert("impossible action")
  const makeAccent = word => ((word.accent.toString == 'NaN') 
    ? "" : "（" + word.accent + "）")

  let yes = impossible,
      no = impossible,
      next = impossible

  function start () {
    let process = Number.parseInt(
      localStorage['process_' + wordList.name]
      ? localStorage['process_' + wordList.name]
      : "0")
    const incProcess = () => {
      process++
      localStorage['process_' + wordList.name] = process.toString()
    }

    if (process >= wordList.list.length) {
      alert("Here's no more word to learn in the word list!")
      return
    }

    let userData = JSON.parse(
      localStorage.userData ? localStorage.userData : "{}")
    Object.keys(userData).forEach(k =>
      userData[k].lastSeen = new Date(userData[k].lastSeen))
    const downgrade = word => {
      userData[word.text] = {
        word: word,
        familarity: userData[word.text] 
          ? (userData[word.text].familarity > 0 
            ? userData[word.text].familarity - 1
            : 0)
          : 0,
        lastSeen: new Date()
      }
      localStorage.userData = JSON.stringify(userData)
    }
    const upgrade = word => {
      userData[word.text] = {
        word: word,
        familarity: userData[word.text] 
          ? userData[word.text].familarity + 1 
          : 0,
        lastSeen: new Date()
      }
      localStorage.userData = JSON.stringify(userData)
    }

    let queue

    function nextWord () {
      if (!queue.length) {
        $('kana').innerText = ""
        $('word').innerText = "All words are finished!"
        $('meaning').innerText = ""
        $('yes').disabled = true
        $('no').disabled = true
        $('continue').disabled = true
        yes = no = next = impossible
        return
      }
      const { word, stage } = queue.pop()
      if (userData[word.text]) incProcess()
      match(stage, {
        1: () => askWord(word, stage, false),
        2: () => askKana(word, stage),
        3: impossible
      })
    }
    function askKana (word, stage) {
      const isNew = userData[word.text]
      $('kana').innerText = word.kana
      $('word').innerText = ""
      $('meaning').innerText = ""
      $('yes').disabled = false
      $('no').disabled = false
      $('continue').disabled = true
      yes = () => { // FIXME logic
        upgrade(word)
        showAnswer(word, match(stage, {
          1: impossible, 2: () => 3, 3: impossible
        }))
      }
      no = () => {
        downgrade(word)
        askWord(word, match(stage, {
          1: impossible, 2: () => 1, 3: impossible
        }), isNew)
      }
      next = impossible
    }
    function askWord (word, stage, isNew) {
      $('kana').innerText = ""
      $('word').innerText = word.text + makeAccent(word)
      $('meaning').innerText = ""
      $('yes').disabled = false
      $('no').disabled = false
      $('continue').disabled = true
      yes = () => showAnswer(word, match(stage, {
        1: () => isNew ? 1 : 2, 2: impossible, 3: impossible
      }))
      no = () => showAnswer(word, match(stage, {
        1: () => 1, 2: impossible, 3: impossible
      }))
      next = impossible
    }
    function showAnswer (word, stage) {
      $('kana').innerText = word.kana + makeAccent(word)
      $('word').innerText = word.text
      $('meaning').innerText = word.meaning
      $('yes').disabled = true
      $('no').disabled = true
      $('continue').disabled = false
      yes = no = impossible
      next = () => {
        match(stage, {
          1: () => queue = [{ word, stage }].concat(queue),
          2: () => queue = [{ word, stage }].concat(queue),
          3: () => {}
        })
        nextWord()
      }
    }

    queue = Object.values(userData)
      .sort((a, b) => a.familarity === b.familarity 
        ? b.familarity - a.familarity 
        : a.lastSeen - b.lastSeen)
      .slice(0, $('review-number').children[1].valueAsNumber)
      .map(data => data.word)
    match($('mode').children[1].value, {
      'new words': () => {
        queue = wordList.list.slice(
            process,
            process + $('word-number').children[1].valueAsNumber)
          .reverse()
          .concat(queue)
      }, 
      'review': () => {}
    })
    queue = queue.map(word => ({ word: word, stage: 2 }))
    nextWord()

    toggleHidden('settings', 'flex', 'buttons')
  }

  return {
    changeMode, getWordList, importWordList, importWordListFile,
    start, yes: () => yes(), no: () => no(), continue: () => next() }
})()
