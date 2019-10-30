import React from 'react'
import classnames from 'classnames'

import '@instructure/canvas-theme'
import { Progress } from '@instructure/ui-elements'

import Timer from './Timer'
import { handleZero } from './handleZero'

export default class Game extends React.Component {
  constructor(props) {
    super(props)
    this._timer = null
    this._colorPrimary = null
    this.state = {
      time: 0,
      playaz: props.playaz,
      positions: props.positions,
      fullTeam: false,
      noMorePlayaz: false,
      choosingSub: false,
      lastPositionsSubbed: [],
      canSub: false,
      chooseView: false,
      activePosition: undefined
    }
  }

  componentDidMount() {
    this._colorPrimary = window
      .getComputedStyle(document.body)
      .getPropertyValue('--colorPrimary')
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.positions !== this.state.positions) {
      this.setState({
        fullTeam: this.teamInfo[0],
        canSub: this.teamInfo[1]
      })
    }
    if (prevState.playaz !== this.state.playaz) {
      const playaz = Object.entries(this.state.playaz)
      const available = []
      playaz.forEach(function(playa) {
        if (!playa[1].isPlaying && !playa[1].isSub) {
          available.push(playa[0])
        }
      })
      this.setState({
        noMorePlayaz: !available.length
      })
    }
    if (prevState.lastPositionsSubbed !== this.state.lastPositionsSubbed) {
      if (this.state.lastPositionsSubbed.length) {
        this._timer = setTimeout(() => {
          this.setState({
            lastPositionsSubbed: []
          })
        }, 1500)
      } else {
        clearTimeout(this._timer)
      }
    }
  }

  componentWillUnmount() {
    if (this._timer) {
      clearTimeout(this._timer)
    }
  }

  get teamInfo() {
    const positions = Object.entries(this.state.positions)
    const currentTeam = []
    const currentSubs = []

    positions.forEach(function(item) {
      const currentPlaya = item[1].current
      currentPlaya !== undefined && currentTeam.push(currentPlaya)
      const currentSub = item[1].sub
      currentSub !== undefined && currentSubs.push(currentSub)
    })

    // return 1) are all positions filled? 2) do we have at least one sub?
    return [currentTeam.length === positions.length, currentSubs.length > 0]
  }

  secsToMins(seconds) {
    return handleZero(Math.floor(seconds / 60))
  }

  handleChoose(position, choosingSub) {
    this.setState({
      chooseView: true,
      activePosition: position,
      choosingSub
    })
  }

  handleChooseClose = () => {
    this.setState({
      chooseView: false,
      activePosition: undefined,
      choosingSub: false
    })
  }

  handlePickCurrent(playa) {
    const position = this.state.activePosition
    const currentPlaya = this.state.positions[position].current
    const currentSub = this.state.positions[position].sub
    const newPlaya = playa[0]

    // TODO: make this function less redundant/stupid
    if (this.state.choosingSub) {
      this.handlePickSub(position, newPlaya, currentSub)
    } else if (currentPlaya) {
      this.setState(prevState => ({
        positions: {
          ...prevState.positions,
          [position]: {
            ...prevState.positions[position],
            current: newPlaya
          }
        },
        playaz: {
          ...prevState.playaz,
          [currentPlaya]: {
            ...prevState.playaz[currentPlaya],
            isPlaying: false
          },
          [newPlaya]: {
            ...prevState.playaz[playa[0]],
            isPlaying: true
          }
        },
        chooseView: false
      }))
    } else {
      this.setState(prevState => ({
        positions: {
          ...prevState.positions,
          [position]: {
            ...prevState.positions[position],
            current: newPlaya
          }
        },
        playaz: {
          ...prevState.playaz,
          [newPlaya]: {
            ...prevState.playaz[newPlaya],
            isPlaying: true
          }
        },
        chooseView: false
      }))
    }
  }

  handlePickSub(position, sub, currentSub) {
    if (currentSub) {
      if (!sub) {
        this.setState(prevState => ({
          positions: {
            ...prevState.positions,
            [position]: {
              ...prevState.positions[position],
              sub: undefined
            }
          },
          playaz: {
            ...prevState.playaz,
            [currentSub]: {
              ...prevState.playaz[currentSub],
              isSub: false
            }
          },
          chooseView: false,
          choosingSub: false
        }))
      } else {
        this.setState(prevState => ({
          positions: {
            ...prevState.positions,
            [position]: {
              ...prevState.positions[position],
              sub
            }
          },
          playaz: {
            ...prevState.playaz,
            [sub]: {
              ...prevState.playaz[sub],
              isSub: true
            },
            [currentSub]: {
              ...prevState.playaz[currentSub],
              isSub: false
            }
          },
          chooseView: false,
          choosingSub: false
        }))
      }
    } else {
      this.setState(prevState => ({
        positions: {
          ...prevState.positions,
          [position]: {
            ...prevState.positions[position],
            sub
          }
        },
        playaz: {
          ...prevState.playaz,
          [sub]: {
            ...prevState.playaz[sub],
            isSub: true
          }
        },
        chooseView: false,
        choosingSub: false
      }))
    }
  }

  handleSub() {
    const positions = this.state.positions
    for (const key of Object.keys(positions)) {
      if (positions[key].sub) {
        const sub = positions[key].sub
        const current = positions[key].current
        this.setState(prevState => {
          let newPositions = Object.assign({}, prevState.positions)
          newPositions[key].current = sub
          newPositions[key].sub = undefined
          let newPlayaz = Object.assign({}, prevState.playaz)
          newPlayaz[sub].isPlaying = true
          newPlayaz[sub].isSub = false
          newPlayaz[current].isPlaying = false
          return {
            positions: newPositions,
            playaz: newPlayaz,
            lastPositionsSubbed: [...prevState.lastPositionsSubbed, key]
          }
        })
      }
    }
  }

  handleTime(time) {
    for (const key of Object.keys(this.state.playaz)) {
      if (this.state.playaz[key].isPlaying) {
        const seconds = this.state.playaz[key].seconds
        this.setState(prevState => {
          let playaz = Object.assign({}, prevState.playaz)
          playaz[key].seconds = seconds + 1
          return { playaz, time }
        })
      }
    }
  }

  handleEndHalf() {
    // clear all subs from player and position state
    for (const key of Object.keys(this.state.playaz)) {
      this.setState(prevState => {
        let playaz = Object.assign({}, prevState.playaz)
        playaz[key].isSub = false
        return { playaz }
      })
    }
    for (const key of Object.keys(this.state.positions)) {
      this.setState(prevState => {
        let positions = Object.assign({}, prevState.positions)
        positions[key].sub = undefined
        return { positions }
      })
    }
    this.setState({
      time: 0
    })
  }

  handleEndGame() {
    this.setState({
      playaz: this.props.playaz,
      positions: this.props.positions,
      time: 0,
      activePosition: undefined
    })
  }

  renderLiszt() {
    const playaz = Object.entries(this.state.playaz)
    return playaz.map((playa, index) => {
      return (
        <tr key={index}>
          <td>{playa[1].name}</td>
          <td>
            {handleZero(Math.floor(playa[1].seconds / 60))}:
            {handleZero(playa[1].seconds)}
          </td>
        </tr>
      )
    })
  }

  renderPositions() {
    const positions = Object.entries(this.state.positions)
    return positions.map((position, index) => {
      const current = position[1].current
      const sub = position[1].sub

      const wasSubbed = this.state.lastPositionsSubbed.indexOf(position[0]) > -1

      const playaButtonClasses = classnames({
        Button: true,
        'Button--Playa': true,
        'Button--StackTop': current,
        'Button--AnimateUp': wasSubbed
      })

      const subButtonClasses = classnames({
        Button: true,
        'Button--Sub': true,
        'Button--StackBottom': true,
        'Button--AnimateDown': wasSubbed
      })

      return (
        <li key={index} className={`GamePosition GamePosition--${position[0]}`}>
          <button
            className={playaButtonClasses}
            onClick={e => this.handleChoose(position[0], false)}
          >
            <span className="ButtonContent ButtonContent--Primary">
              {current ? this.state.playaz[current].name : 'Choose'}
            </span>
            {current && (
              <span className="ButtonContent ButtonContent--Secondary">
                {this.secsToMins(this.state.playaz[current].seconds)}
              </span>
            )}
          </button>
          {current && (
            <button
              disabled={!sub && this.state.noMorePlayaz}
              className={subButtonClasses}
              onClick={e => this.handleChoose(position[0], true)}
            >
              <span className="ButtonContent ButtonContent--Primary">
                {sub ? this.state.playaz[sub].name : 'Choose sub'}
              </span>
              {sub && (
                <span className="ButtonContent ButtonContent--Secondary">
                  {this.secsToMins(this.state.playaz[sub].seconds)}
                </span>
              )}
            </button>
          )}
        </li>
      )
    })
  }

  renderChoose() {
    const playaz = Object.entries(this.state.playaz)
    const availablePlayaz = playaz.map((playa, index) => {
      if (!playa[1].isPlaying && !playa[1].isSub) {
        return (
          <button
            key={index}
            className={
              this.state.choosingSub
                ? 'Button Button--Sub'
                : 'Button Button--Playa'
            }
            onClick={e => this.handlePickCurrent(playa)}
          >
            <span className="ButtonContent ButtonContent--Primary">
              {playa[1].name}
            </span>
            <span className="ButtonContent ButtonContent--Secondary">
              {this.secsToMins(playa[1].seconds)}
            </span>
          </button>
        )
      } else {
        return null
      }
    })
    const position = this.state.activePosition
    const currentSub = this.state.positions[position].sub
    return (
      <div className="GameChoose">
        <header className="GameChooseHeader">
          <h2 className="GameChooseHeading">
            {!this.state.noMorePlayaz ? (
              <span>
                <span className="GameChooseHeading__Secondary">
                  {this.state.choosingSub ? 'Choose sub' : 'Choose player'}
                </span>
                {this.state.positions[this.state.activePosition].name}
              </span>
            ) : (
              <span>
                No more {this.state.choosingSub ? 'subs' : 'players'}
                <span className="GameChooseHeading__Secondary">
                  Remove subs to free some up
                </span>
              </span>
            )}
          </h2>
          <span className="GameChooseHeaderActions">
            <button
              className="Button Button--Primary"
              type="button"
              onClick={e => this.handleChooseClose()}
            >
              Close
            </button>
          </span>
        </header>
        <div className="GameChoosePlayaz">
          {availablePlayaz}
          {this.state.choosingSub && currentSub && (
            <span className="GameChooseRemove">
              {!this.state.noMorePlayaz && <span>or just&nbsp;</span>}
              <button
                className="Button Button--Primary"
                type="button"
                onClick={e =>
                  this.handlePickSub(position, undefined, currentSub)
                }
              >
                Remove {this.state.playaz[currentSub].name}
              </button>
            </span>
          )}
        </div>
      </div>
    )
  }

  render() {
    const enableSubButton =
      this.state.fullTeam && this.state.canSub && this.state.time > 0

    const gameTimeInSeconds = this.props.halfDuration * 60

    return (
      <div className="Game">
        <header className="GameHeader">
          <div className="GameHeader__Timer">
            <Timer
              disabled={!this.state.fullTeam}
              onEndHalf={() => this.handleEndHalf()}
              onEndGame={() => this.handleEndGame()}
              onUpdate={time => this.handleTime(time)}
            />
          </div>
          {enableSubButton && (
            <div className="GameHeader__Actions">
              <button
                className="Button Button--Primary"
                disabled={!enableSubButton}
                type="button"
                onClick={e => this.handleSub()}
              >
                Sub
              </button>
            </div>
          )}
          <div className="GameHeader__Progress">
            <Progress
              label="Game completion status in seconds"
              size="x-small"
              valueNow={this.state.time}
              valueMax={gameTimeInSeconds}
              theme={{
                xSmallHeight: '0.25rem',
                meterColorStart: this._colorPrimary,
                meterColorEnd: this._colorPrimary,
                doneMeterColorStart: this._colorPrimary,
                doneMeterColorEnd: this._colorPrimary
              }}
            />
          </div>
        </header>
        <main className="GameMain">
          <span className="GameLine GameLine--Box" />
          <span className="GameLine GameLine--CenterCircle" />
          <ul className="GamePositions">{this.renderPositions()}</ul>
        </main>
        {this.state.chooseView && this.renderChoose()}
      </div>
    )
  }
}
