class MineSweeper{
  constructor(size, minesCount, interval){
    this.field = []
    this.size = size
    this.minesCount = minesCount
    this.flagsLeft = this.minesCount
    this.findMines = 0
    this.counter = document.getElementsByClassName('mines-count')[0]
    this.counter.innerHTML = this.flagsLeft
    this.interval = interval

    const board = document.getElementsByClassName('board')[0]
    // устанавливаем логику с кликами по клеткам
    this.cellsLogic = (e) => {
      if (e.target.classList.contains('cell')) {
        this.clickOnCell(e, true);
      }
    }
    board.removeEventListener('click', this.cellsLogic)
    board.addEventListener('click',this.cellsLogic);
    // устанавливаем логику с флагами
    this.flagsLogic = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const cell = e.target;
      if (cell.classList.contains('flagged')) {
        if (cell.id.includes('mine')) {
          this.findMines -= 1;
        }
        cell.classList.remove('flagged');
        this.flagsLeft += 1;
        this.counter.innerHTML = this.flagsLeft;
      } else {
        if (!cell.classList.contains('checked')) {
          if (this.flagsLeft !== 0) {
            if (cell.id.includes('mine')) {
              this.findMines += 1;
            }
            cell.classList.add('flagged');
            this.flagsLeft -= 1;
            this.counter.innerHTML = this.flagsLeft;
            if (this.findMines === this.minesCount) {
              this.endGame(true);
            }
          }
        }
      }
    }
    board.removeEventListener('contextmenu', this.flagsLogic)
    board.addEventListener('contextmenu', this.flagsLogic);
  }

  startGame(){
    this.initializeField()
  }
   // инициализация поля
  initializeField(){
    const boardElement = document.getElementsByClassName('board')[0]
    for(let i = 0; i < this.size; i++){
      const row = []
      let rowHTML = document.createElement('div')
      rowHTML.className = 'row'
      for(let j = 0;j < this.size; j++){
        let cell = document.createElement('span')
        cell.className = 'cell'
        cell.id = `${i} ${j}`
        cell.innerHTML = '⠀'
        row.push(cell)
        rowHTML.append(cell)  
      }
      boardElement.append(rowHTML)
      this.field.push(row)
    }
    const indexes = new Set()
    while(indexes.size !== this.minesCount){
      let randI = Math.floor(Math.random() * (this.size))
      let randJ = Math.floor(Math.random() * (this.size))
      indexes.add(`${randI} ${randJ}`)
    }
    for(let index of indexes.values()){
      let[ i, j ] = index.split(' ') 
      let cell = this.field[+i][+j]
      cell.id += ' mine'
    }
  }

  clickOnCell(e){
    if(e.button === 0){
      if(e.target.id.includes('mine')){
        e.target.className += ' mine'
        this.endGame(false)
      }else{
        let cell = e.target
        let [i, j] = cell.id.split(' ')
        i = +i
        j = +j
        // логика подсчета мин вокруг клетки
        let num = 0
        for(let m of [-1, 0, 1]){
          if(i - m < 0 || i - m >= this.size){
            continue
          }
          for(let k of [-1, 0, 1]){
            if(j - k < 0 || j - k >= this.size ){
              continue
            }
            if(this.field[i - m][j - k].id.includes('mine')){
              num += 1
            }
          }
        }
        if(num !== 0){
          cell.className += ' checked'
          cell.className += ' showNum'
          cell.innerHTML = `${num}`
        }else{
          cell.className += ' checked'
        
          const cells = [[-1, 0], [0, -1], [0, 1], [1, 0]]
          // рекурсивно открываем ближайшие клетки
          for(let [m, k] of cells){
            if(i - m < 0 || i - m >= this.size){
              continue
            }
            if(j - k < 0 || j - k >= this.size || (k === 0 && m === 0)){
              continue
            }
            if(this.field[i - m][j - k].id.includes('mine') || this.field[i - m][j - k].className.includes('showNum') || this.field[i - m][j - k].className.includes('checked')){
              continue
            }
            this.clickOnCell({target: this.field[i - m][j - k], button: 0})
          
          }
        }
      }
    }
    
  }
  // логика выйгрыша и показа модалки, обнуление таймера
  endGame(win){
    let modal = document.getElementsByClassName('modal')[0]
    let box = document.getElementsByClassName('modal__box')[0]
    clearInterval(interval)
    if(!win){
      box.classList.add('lose')
      let existingTitle = box.getElementsByTagName('h1')[0];
      if(existingTitle){
        existingTitle.innerHTML = 'К сожалению вы проиграли!'
      }else{
        let title = document.createElement('h1')
        title.innerHTML = 'К сожалению вы проиграли!'
        box.prepend(title)
      }
    }else {
      box.classList.add('win')
      let existingTitle = box.getElementsByTagName('h1')[0];
      if (existingTitle) {
        existingTitle.innerHTML = `Поздравляю вы выиграли! За время: ${minutesBlock.innerHTML}:${secondsBlock.innerHTML}:${hundredthsBlock.innerHTML}`;
      } else {
        let newTitle = document.createElement('h1');
        newTitle.innerHTML = `Поздравляю вы выиграли! За время: ${minutesBlock.innerHTML}:${secondsBlock.innerHTML}:${hundredthsBlock.innerHTML}`;
        box.prepend(newTitle);
      }
    }
    modal.classList.add('open')

    milliseconds = 0
    minutes = 0
    seconds = 0
    hundredthsBlock.innerHTML = '00'
    secondsBlock.innerHTML = '00'
    minutesBlock.innerHTML = '00'
    
    const closeModalLogic = (e) => {
      e.preventDefault()
      let startBtn = document.getElementsByClassName('start-btn')[0]
      startBtn.disabled = false
      modal.classList.remove('open')
      box.classList.remove('lose')
      box.classList.remove('win')
      let title = box.getElementsByTagName('h1')[0]
      title.remove()
      let board = document.getElementsByClassName('board')[0]
      board.removeEventListener('contextmenu', this.flagsLogic)
      board.removeEventListener('click', this.cellsLogic)
      board.remove()
      let newBoard = document.createElement('div')
      newBoard.classList.add('board')
      document.body.append(newBoard)
      onClick({preventDefault(){}})
      modal.removeEventListener('click', closeModalLogic)
    }
    modal.addEventListener('click', closeModalLogic)
  }
}

let game;




let interval;
let minutes = 0
let seconds = 0
let milliseconds = 0

const hundredthsBlock = document.getElementsByClassName('hundredths-sec')[0]
const secondsBlock = document.getElementsByClassName('seconds')[0]
const minutesBlock = document.getElementsByClassName('minutes')[0]



// логика таймера
const startTimer = () => {
  milliseconds++
  if(milliseconds <= 99){
    hundredthsBlock.innerHTML = milliseconds.toString().padStart(2,'0')
  }
  if(milliseconds === 100){
    hundredthsBlock.innerHTML = '00'
  }

  if(milliseconds > 99){
    seconds++

    secondsBlock.innerHTML = '0' + seconds

    milliseconds = 0
  }

  if(seconds > 9){
    secondsBlock.innerHTML = seconds
  }
  
  if(seconds > 59){
    minutes++
    minutesBlock.innerHTML = '0' + minutes
    seconds = 0

    secondsBlock.innerHTML = '0' + seconds
  }

  if(minutes > 9){
    minutesBlock.innerHTML = minutes
  }


}


let settings = document.getElementsByClassName('settings-btn')[0]
// установка настроек для игры
let onClick =  (e) => {
  clearInterval(interval)
  e.preventDefault()
  if(document.getElementsByClassName('cell')[0]){
    let board = document.getElementsByClassName('board')[0]
    board.remove()
    let newBoard = document.createElement('div')
    
    newBoard.classList.add('board')
    document.body.append(newBoard)
  }
  
    let selectorMines = document.getElementById('count mines')
    let selectorField = document.getElementById('size')
    let countMines = +selectorMines.value
    let size = +selectorField.value
    // убираем алерт если он уже есть потому тчо потом он может появиться еще раз
    if(document.getElementsByClassName('alert')[0]){
      let alert = document.getElementsByClassName('alert')[0]
      alert.remove()
    }
    // обработка неправильных данных
    if(countMines > size*size){
      let alert = document.createElement('div')
      alert.classList.add('alert')
      alert.innerHTML = 'Количество мин не может быть больше размера самого поля'
      document.body.append(alert)
    }else{
      if(game && countMines === game.countMines && size === game.size ){
        return
      }    
      game = new MineSweeper(size, countMines, interval)
    }
}
settings.addEventListener('click', onClick)

let startGame = document.getElementsByClassName('start-btn')[0]
// запуск игры
let startGameOnClick = (e) => {
  e.preventDefault()
  clearInterval(interval)
  interval = setInterval(startTimer, 10)
  e.target.disabled = true
  if(!(game instanceof MineSweeper)){
    // устанавливаем настройки так как игра первый раз была запущена
    onClick(e)
  }
  // запуск игры
  game.startGame()
}
startGame.addEventListener('click', startGameOnClick)