
const lrcRoot = document.getElementById('lrcRoot')
const playBtn = document.getElementById('playBtn')
const audioInfo = document.getElementById('audioInfo')
const pickLineWithTimeBtn = document.getElementById('pickLineWithTimeBtn')
const progressBar = document.getElementById('progressBar')
const currentTime = document.getElementById('currentTime')
const nextBtn = document.getElementById('nextBtn')
const prevBtn = document.getElementById('prevBtn')
const playList = document.getElementById('playList')
const copyLrcBtn = document.getElementById('copyLrcBtn')
const downLrcBtn = document.getElementById('downLrcBtn')
const startMakerBtn = document.getElementById('startMakerBtn')
const syncCurrentLineBtn = document.getElementById('syncCurrentLineBtn')
const speedBar = document.getElementById('speedBar')
const resetSpeedBtn = document.getElementById('resetSpeedBtn')
const resetTimeBtn = document.getElementById('resetTimeBtn')


const dropZone = document.getElementById('dropZone')
function _lrc_read_time(s) {
  // return total second
  const myRe = /^([\-0-9]{1,3}):([0-9]{2})\.([0-9]+)$/
  const x = myRe.exec(s)
  if (x) {
    return parseInt(x[1]) * 60 + parseInt(x[2]) + parseFloat('.' + x[3])
  }
}

// console.log(_lrc_read_time('01:53.035'));

function _lrc_read_line(s) {
  const myRe = /^\[([\-0-9]{1,3}:[0-9]{2}\.[0-9]+)\](.*)/
  const x = myRe.exec(s)
  if (x) {
    // console.log('found', x[1], x[2]);
    y = _lrc_read_line(x[2])
    return [[x[1], ...y[0]], y[1]]
  }
  else {
    // console.log('not found', x);
    return [[], s]
  }
}

// a = _lrc_read_line('[-00:42.03][00:49.03]谁在大雪之前')
// console.log('return', a);

function read_lrc_text(lrcStr) {
  let arr = []
  for (let a of lrcStr.split('\n')) {
    [tis, text] = _lrc_read_line(a)
    if (tis.length > 0) {
      for (i of tis)
        arr.push([_lrc_read_time(i), text])
    }
  }
  arr.sort((a, b) => a[0] - b[0])
  return arr
}


function read_lrc_text_split(lrcStr) {
  const arr = read_lrc_text(lrcStr)
  return [timeData = arr.map(v => v[0]),
  textData = arr.map(v => v[1])]
}

function read_lrc_blank(lrcStr) {
  let arr = []
  for (let a of lrcStr.split('\n')) {
    arr.push(a.trim())
  }
  //keep timeData if same lenth
  if (timeData.length == arr.length) {
    return [timeData, arr]
  }
  return [arr.map(v => 0), arr]
}


const audio = document.getElementById('audio')
var currentSongIndex = 0
var textData = []
var textDataF = null
var timeData = []
var songTitle = null
var songPath = null
var textDataX = null

function dropHandler(ev) {
  console.log('File(s) dropped');
  ev.preventDefault();

  if (ev.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    [...ev.dataTransfer.items].forEach((item, i) => {
      // If dropped items aren't files, reject them
      if (item.kind === 'file') {
        const file = item.getAsFile();
        const reader = new FileReader();
        console.log(`… file[${i}].name = ${file.name}`);
        let ext = file.name.split('.').pop()
        if (ext == 'txt' || ext == 'lrc') {
          reader.addEventListener("load", () => {
            let a = null, b = null
            if (ext == 'txt')
              [a, b] = read_lrc_blank(reader.result)
            else
              [a, b] = read_lrc_text_split(reader.result)
            textData = b
            timeData = a
            displayText()

            if (ext == 'txt') {
              // start making mode if txt
              if (syncCurrentLine < 0) startMakerBtn.click()
            } else {
              // exit making mode if lrc
              if (syncCurrentLine >= 0) startMakerBtn.click()
            }
          }, false);
          if (file) {
            reader.readAsText(file);
          }
        } else if (ext == 'mp3') {
          let x = file.name.split('.')
          x.pop()
          console.log('mp3');
          songTitle = x.join('.')
          reader.addEventListener("load", () => {
            audio.src = reader.result;
            audio.play();
            audioInfo.innerText = `${file.name}`
          }, false);
          if (file) {
            reader.readAsDataURL(file);
          }
        }
      }
    });
  } else {
    [...ev.dataTransfer.files].forEach((file, i) => {
      console.log(`… file[${i}].name = ${file.name}`);
    });
  }
}


function displayText() {
  if (textDataF) {
    const htm = textDataF.map((v, i) => {

      const x = v.map((v1) => '<div class="phrase">' + v1.map((v2, i1) => `<div class="s${i1}">${v2}</div>`).join('\n') + '</div>').join('\n')
      const ti = secToLrcTime(timeData[i])
      return `<div class="line"><div class="ti">${ti}</div><a href="javascript:void(0)" onClick="lineClickHandle(${i})">${x}</a></div>`
    }).join('\n')
    lrcRoot.innerHTML = htm
  }
  else {
    const htm = textData.map((v, i) => {

      const ti = secToLrcTime(timeData[i])
      return `<div class="line"><div class="ti">${ti}</div><a href="javascript:void(0)" onClick="lineClickHandle(${i})">${v}</a></div>`
    }).join('\n')
    lrcRoot.innerHTML = htm
  }
}

function dragOverHandler(ev) {
  console.log('File(s) in drop zone');
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
}
let isPlaying = false

audio.addEventListener('play', (a, e) => {
  console.log('audio event play');
  isPlaying = true;
  // progressBar.max = audio.duration
  // progressBar.value = 0
  // startTimer();
  playBtn.innerText = "pause"
})
audio.addEventListener('pause', (a, e) => {
  console.log('audio event pause');
  isPlaying = false
  // stopTimer();
  playBtn.innerText = "play"
})
audio.addEventListener('ended', (a, e) => {
  console.log('audio event ened');
  isPlaying = false
  // stopTimer();
})

playBtn.addEventListener('click', () => {
  // playBtn.innerText = 'pause'
  if (isPlaying) {
    audio.pause();
    isPlaying = false
    playBtn.innerText = 'play'
  }
  else {
    audio.play();
    isPlaying = true
    playBtn.innerText = 'pause'
  }
})

// let myVar = null

// function stopTimer() {
//   clearInterval(myVar)
//   console.log('stopTimer')
// }

// function startTimer() {
//   stopTimer() //alway stop before start new
//   console.log('startTimer')
//   myVar = setInterval(syncTime, 100);
// }
audio.addEventListener('timeupdate', (event) => {
  syncTime()
});

function syncTime() {
  try {
    onStep(audio.currentTime)
  } catch (error) {
    console.error(error);
  }
}


var currentLine = 0
function onStep(seek) {
  if (!isPlaying) return;

  if (audio.duration)
    progressBar.value = seek * 100 / audio.duration
  currentTime.innerText = secToLrcTime(seek)

  if (syncCurrentLine >= 0) {
    onView(getLineIndexByTime(seek), scroll = false)
    return
  }
  onView(getLineIndexByTime(seek, currentLine + 1))
}

function getLineIndexByTime(sec, startIndex = 0) {
  let targetIndex = -1
  // go forward
  startIndex = 0
  for (let index = startIndex; index < timeData.length; index++) {
    if (timeData[index] > sec) {
      // return index - 1
      targetIndex = index - 1
      break
    }
  }
  // check targetIndex not change when go forward
  // go back
  // if (targetIndex == startIndex - 1) {
  //   for (let index = startIndex - 1; index >= 0; index--) {
  //     if (timeData[index] <= sec) {
  //       targetIndex = index
  //       break
  //     }
  //   }
  // }
  return targetIndex


}


function onView(lineIndex, scroll = true) {
  if (lineIndex == -1) return;
  if (lineIndex != currentLine) { //update if position change
    unfocusElemPos(currentLine)
    focusElemPos(lineIndex, scroll)
    currentLine = lineIndex
  }
}

function onView2(lineIndex, scroll = true) {
  if (lineIndex == -1) return;
  if (lineIndex != syncCurrentLine) { //update if position change
    unfocusElemPos(syncCurrentLine)
    unfocusElemPos(syncCurrentLine - 1)
    focusElemPos(lineIndex - 1, scroll, bgColor = '#eeddff')
    focusElemPos(lineIndex, false, bgColor = '#ddeeff')
    syncCurrentLine = lineIndex
  }
}

function unfocusElemPos(pos, bgColor = '#ffffff') {
  elem = lrcRoot.children[pos]
  if (!elem) return;
  elem.style.background = bgColor
  // elem.style.opacity = .5
}

function focusElemPos(pos, scroll = true, bgColor = '#eeeeee') {
  elem = lrcRoot.children[pos]
  if (!elem) return;
  elem.style.background = bgColor
  // elem.style.opacity = 1
  if (scroll)
    elem.scrollIntoView({
      behavior: "smooth",
      block: "center"
    })
}

function lineClickHandle(lineIndex) {
  if (resyncPickLineMode == 1) {
    resyncPickLineIndex = lineIndex
    pickLineAndTime()
    return
  }

  if (syncCurrentLine >= 0) {
    onView2(lineIndex)
    return
  }

  onView(lineIndex)
  console.log('lineClick', lineIndex, audio.currentTime);
  audio.currentTime = timeData[lineIndex]
}



progressBar.addEventListener('click', (e) => {
  const percentValue = e.offsetX / speedBar.offsetWidth;
  audio.currentTime = (percentValue * audio.duration)
})

speedBar.addEventListener('click', (e) => {
  const percentValue = e.offsetX / speedBar.offsetWidth;
  audio.playbackRate = percentValue * 4
  speedBar.value = percentValue * 100
})

nextBtn.addEventListener('click', (e) => {
  currentSongIndex += 1
  currentSongIndex = currentSongIndex > titleDatas.length - 1 ? 0 : currentSongIndex
  currentSongIndex = currentSongIndex < 0 ? titleDatas.length - 1 : currentSongIndex
  setSong(currentSongIndex)

});

prevBtn.addEventListener('click', (e) => {
  currentSongIndex += -1
  currentSongIndex = currentSongIndex > titleDatas.length - 1 ? 0 : currentSongIndex
  currentSongIndex = currentSongIndex < 0 ? titleDatas.length - 1 : currentSongIndex
  setSong(currentSongIndex)
});

downLrcBtn.addEventListener('click', (e) => {
  downLrc()
});
copyLrcBtn.addEventListener('click', (e) => {
  copyLrc()
});

resetSpeedBtn.addEventListener('click', (e) => {
  speedBar.value = 50
  audio.playbackRate = 1
});

startMakerBtn.addEventListener('click', (e) => {
  if (syncCurrentLine < 0) {
    // syncCurrentLine = currentLine
    onView2(0)
    syncCurrentLineBtn.style.display = 'block'
    startMakerBtn.innerText = 'exit'
  }
  else {
    syncCurrentLine = -1
    syncCurrentLineBtn.style.display = 'none'
    startMakerBtn.innerText = 'start'
  }
});
resetTimeBtn.addEventListener('click', (e) => {
  timeData = textData.map((v) => 0)
  displayText()
});


var syncCurrentLine = -1

syncCurrentLineBtn.addEventListener('click', (e) => {
  console.log('z', syncCurrentLine);
  syncCurrentLineWithCurrentTime()
});

function syncCurrentLineWithCurrentTime() {
  const ti = audio.currentTime
  timeData[syncCurrentLine] = ti
  lrcRoot.children[syncCurrentLine].children[0].innerText = secToLrcTime(ti)
  onView2(syncCurrentLine + 1, scroll = true)
}

function resyncu(t) {
  timeData = timeData.map(x => x - t)
  lineClickHandle(currentLine)
}


function createLrc() {
  const lrcText = timeData.map((v, i) => {
    const te = textDataX ? textDataX[i] : textData[i]
    const ti = secToLrcTime(v > 0 ? v : 0)
    return `[${ti}]${te}`
  }).join('\n')
  // console.log(lrcText);
  return lrcText
}


function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function downLrc() { const text = createLrc(); download(songTitle + '.lrc', text) }
function copyLrc() { const text = createLrc(); executeCopy(text); copyLrcBtn.innerText += 'ed' }

function resyncd(t) {
  timeData = timeData.map(x => x + t)
  lineClickHandle(currentLine)
}

let resyncPickLineMode = 0
let resyncPickLineIndex = 0
pickLineWithTimeBtn.addEventListener('click', function () {
  pickLineAndTime()
});

function secToLrcTime(ti) {
  m = Math.floor(ti / 60)
  s = ti - m * 60
  s = Math.round(s * 100) / 100
  s = ('' + s.toFixed(2)).padStart(5, '0')
  m = ('' + m).padStart(2, '0')
  return `${m}:${s}`
}

function pickLineAndTime() {
  if (resyncPickLineMode == 0) {
    pickLineWithTimeBtn.innerText = 'pick a line'
    resyncPickLineMode = 1
  } else
    if (resyncPickLineMode == 1) {
      pickLineWithTimeBtn.innerText = 'click here to assign line with current time'
      resyncPickLineMode = 2
    } else
      if (resyncPickLineMode == 2) {
        pickLineWithTimeBtn.innerText = 'start pick line/time'
        resyncPickLineMode = 0
        resyncu(timeData[resyncPickLineIndex] - audio.currentTime)
        console.log('resync', resyncPickLineIndex, audio.currentTime);
      }
}

function executeCopy(a) {
  var b = document.createElement("textarea");
  document.body.appendChild(b), b.value = a, b.focus(), b.select();
  try {
    var c = document.execCommand("copy"), d = c ? "successful" : "unsuccessful"; console.log("Copy " + a + " : " + d); document.body.removeChild(b);
  }
  catch (e) {
    console.log("Oops, unable to copy")
  }
  b.remove()
}

function setSong(songIndex) {
  currentSongIndex = songIndex
  // currentLine = 0
  timeData = timeDatas[songIndex]
  textData = textDatas[songIndex]
  if (textDataXs) {
    textDataX = textDataXs[songIndex]
  }
  if (textDataFs) {
    textDataF = textDataFs[songIndex]
  }
  songTitle = titleDatas[songIndex]
  songPath = pathDatas[songIndex]
  audio.src = songPath
  audioInfo.innerText = songTitle
  displayText()
  onView(0)
  if (document.readyState === 'complete')
    audio.play()
}
var singleMode = false

function initialSetup() {
  if (uploadMode) {
    nextBtn.style.display = 'none'
    prevBtn.style.display = 'none'
    playList.style.display = 'none'
    return
  }
  setSong(0)
  singleMode = titleDatas.length < 2
  if (singleMode) {
    nextBtn.style.display = 'none'
    prevBtn.style.display = 'none'
    playList.style.display = 'none'
  }
  else {
    const playlistHtm = titleDatas.map((v, i) => `<div><a href="javascript:void(0)" onClick="setSong(${i})">${v}</a></div>`).join('\n')
    playList.innerHTML = playlistHtm
  }

}

document.addEventListener('keydown', function (e) {
  if (e.key == ' ' && syncCurrentLine >= 0) {
    e.preventDefault()
    // console.log(e);
    syncCurrentLineWithCurrentTime()
  }
})
initialSetup()