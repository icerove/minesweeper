import React from "react";
import ReactDOM from "react-dom";
import _ from "underscore";
import "./styles.css";

class Board extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      gameStatus: 'play',
      board: new Array(100).fill(-1),
      bomb: _.sample(_.range(100), 10),
      remain: 100
    }

    this.handleChange = this.handleChange.bind(this)
    this.isBomb = this.isBomb.bind(this)
    this.index = this.index.bind(this)
    this.restart = this.restart.bind(this)
    this.handleFlag = this.handleFlag.bind(this)
    this.gameOver = this.gameOver.bind(this)
  }

  restart() {
    this.setState({
      gameStatus: 'play',
      board: new Array(100).fill(-1),
      bomb: _.sample(_.range(100), 10),
      remain: 100
    })
  }

  gameOver() {
    let board = [...this.state.board]
    for(let i in this.state.bomb) {
      board[this.state.bomb[i]] = 10;
    }
    this.setState({gameStatus: 'gameover'})
    return board
  }

  index(i, j) {
    return i*10+j
  }

  isBomb(i, j) {
    if (i < 0 || i >= 10 || j < 0 || j >= 10) {
      return 0
    }
    return this.state.bomb.indexOf(i*10+j) >= 0 ? 1 : 0
  }

  open(i, j, board, remain) {
    if (i < 0 || i >= 10 || j < 0 || j >= 10) {
      return board
    }
    if (board[this.index(i, j)] >= 0) {
      return board
    }
    if (this.isBomb(i, j)) {
      return this.gameOver()
    } else {
      let count = 0
      let directions = [[i+1,j+1],[i+1,j],[i+1,j-1],[i,j+1],[i,j-1],[i-1,j+1],[i-1,j],[i-1,j-1]]
      for(let e of directions){
        count += this.isBomb(e[0],e[1])
      }
      let ind = this.index(i, j)
      board[ind] = count
      remain[0] = remain[0]-1
      if (remain[0] === 10) {
        this.setState({gameStatus: 'win'})
      }

      if (count===0) {
        for (let e of directions){
          this.open(e[0],e[1],board,remain)
        }
      }
      return board
    }
  }

  handleChange(i){
    return ()=>{
      if (this.state.gameStatus != 'play') {
        return
      }
      let remain=[this.state.remain]
      let board = this.open(Math.floor(i/10), i%10, [...this.state.board], remain)
      this.setState({board: board, remain: remain[0]})
    }
  }

  handleFlag(i) {
    return (event)=>{
      event.preventDefault();
      if (this.state.gameStatus != 'play') {
        return
      }
      if (this.state.board[i] === -1) {
        let newBoard = [...this.state.board]
        newBoard[i] = 9
        this.setState({board: newBoard})
      } else if (this.state.board[i] === 9) {
        let newBoard = [...this.state.board]
        newBoard[i] = -1
        this.setState({board: newBoard})
      }
    }
  }

  render() {
    let cells = this.state.board.map((s, i) => (
      <button className={s>=0?"cell open":"cell close"} key={i}
       onClick={this.handleChange(i)}
       onContextMenu={this.handleFlag(i)}>
        {s>0?
         (s===9?'🇬🇪':
           (s===10?'💣':s))
          :""}
      </button>
    ))
    let showDialog = this.state.gameStatus!='play'
    let message = this.state.gameStatus=='gameover' ? 'Game Over' : 'You win'
    return (
      <div className="board-wrapper">
        <div className="board">
          {cells}
        </div>

        {showDialog &&
          <div className="dialog">
            <p>{message}</p>
            <button className="restart" onClick={this.restart}>Restart</button>
          </div>}
      </div>
    )
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<Board />, rootElement);
