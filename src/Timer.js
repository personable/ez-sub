import React from 'react'
import PropTypes from 'prop-types'
import { handleZero } from './handleZero'

export default class Timer extends React.Component {
  static propTypes = {
    onUpdate: PropTypes.func,
    onEndHalf: PropTypes.func,
    onEndGame: PropTypes.func,
    disabled: PropTypes.bool
  }

  static defaultProps = {
    disabled: false
  }

  constructor(props) {
    super(props)
    this.state = {
      time: 0,
      isOn: false,
      start: 0,
      firstHalfOver: false
    }
  }

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer)
    }
  }

  startTimer = () => {
    this.setState({
      isOn: true,
      time: this.state.time,
      start: Date.now() - this.state.time
    })
    this.timer = setInterval(() => {
      const time = Date.now() - this.state.start
      this.props.onUpdate(Math.round(time / 1000))
      this.setState({ time })
    }, 1000)
  }
  stopTimer = () => {
    this.setState({ isOn: false })
    clearInterval(this.timer)
  }
  resetTimer = () => {
    this.stopTimer()
    this.setState({ time: 0, isOn: false })
  }
  endHalf = () => {
    if (window.confirm('End the half?')) {
      this.resetTimer()
      this.setState({ firstHalfOver: true })
      this.props.onEndHalf()
    }
  }
  endGame = () => {
    if (window.confirm('End the game?')) {
      this.resetTimer()
      this.props.onEndGame()
    }
  }

  renderGameControls() {
    if (this.state.firstHalfOver) {
      return (
        <button
          className="Button"
          disabled={this.props.disabled}
          onClick={this.endGame}
        >
          End game
        </button>
      )
    } else {
      return (
        <button
          className="Button"
          disabled={this.props.disabled}
          onClick={this.endHalf}
        >
          End half
        </button>
      )
    }
  }

  render() {
    const mins = Math.floor(Math.round(this.state.time / 1000) / 60)
    const secs = ((this.state.time % 60000) / 1000).toFixed(0)
    const { disabled } = this.props
    return (
      <div className="Timer">
        <span className="TimerDigits">
          {handleZero(mins)}:{handleZero(secs)}
        </span>
        {!disabled && (
          <span className="TimerActions">
            {this.state.isOn ? (
              <button
                className="Button"
                disabled={disabled}
                onClick={this.stopTimer}
              >
                Stop
              </button>
            ) : (
              <button
                className="Button"
                disabled={disabled}
                onClick={this.startTimer}
              >
                Start
              </button>
            )}
            &nbsp;
            {this.state.time > 0 && this.renderGameControls()}
          </span>
        )}
      </div>
    )
  }
}
