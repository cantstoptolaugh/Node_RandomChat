// @ts-check
const socket = new WebSocket(`ws://${window.location.host}/ws`)
const formEl = document.getElementById('form')
const chatsEL = document.getElementById('chats')
/**  @type {HTMLInputElement | null} */
// @ts-ignore
const inputEl = document.getElementById('input')
if (!formEl || !inputEl) {
  throw new Error('error')
}

/**
 * @typedef Chat
 * @property {string} nickname
 * @property {string} message
 */

/**
 *  @type {Chat[]}
 */
const chats = []

const adjectives = ['동의대', '서울대', '고려대', '연세대', '중앙대']
const names = ['이건영존잘', '이주혁', '랄로', '앤드류테이트', '조던피터슨']

/**
 *   @param {string[]} array
 *   @returns {string}
 */

function pickRandom(array) {
  const randomIdx = Math.floor(Math.random() * array.length)
  const result = array[randomIdx]
  if (!result) {
    throw new Error('array length is 0')
  }
  return result
}

const myNickname = `${pickRandom(adjectives)} ${pickRandom(names)}`

formEl.addEventListener('submit', (event) => {
  event.preventDefault()
  socket.send(
    JSON.stringify({
      nickname: myNickname,
      message: inputEl.value,
    })
  )
  inputEl.value = ''
})

const drawChats = () => {
  chats.forEach(({ message, nickname }) => {
    const div = document.createElement('div')
    div.innerHTML = `${nickname} : ${message}`
    // @ts-ignore
    chatsEL.appendChild(div)
  })
}

socket.addEventListener('message', (event) => {
  const { type, payload } = JSON.parse(event.data)

  if (type == 'sync') {
    const { chats: syncedChats } = payload
    chats.push(...syncedChats)
  } else if (type == 'chat') {
    const chat = payload
    chats.push(chat)
  }

  drawChats()

  chats.push()

  // @ts-ignore
  chatsEL.innerHTML = ''

  chats.forEach(({ message, nickname }) => {
    const div = document.createElement('div')
    div.innerText = `${nickname}: ${message}`

    // @ts-ignore
    chatsEL.appendChild(div)
  })
})
