import React from "react";
import ReactDOM from "react-dom";
import Game from "./Game";
import "normalize.css";

import "./styles.css";

class App extends React.Component {
  render() {
    return (
      <Game
        subEvery={5}
        halfDuration={20}
        playaz={{
          paulaH: {
            name: "Paula H.",
            seconds: 0,
            isPlaying: false,
            isSub: false
          },
          celesteP: {
            name: "Celeste P.",
            seconds: 0,
            isPlaying: false,
            isSub: false
          },
          adrienneH: {
            name: "Adrienne H.",
            seconds: 0,
            isPlaying: false,
            isSub: false
          },
          prudenceC: {
            name: "Prudence C.",
            seconds: 0,
            isPlaying: false,
            isSub: false
          },
          natashaR: {
            name: "Natasha R.",
            seconds: 0,
            isPlaying: false,
            isSub: false
          },
          annaM: {
            name: "Anna M.",
            seconds: 0,
            isPlaying: false,
            isSub: false
          },
          emilyS: {
            name: "Emily S.",
            seconds: 0,
            isPlaying: false,
            isSub: false
          },
          sarahG: {
            name: "Sarah G.",
            seconds: 0,
            isPlaying: false,
            isSub: false
          },
          berniceA: {
            name: "Bernice A.",
            seconds: 0,
            isPlaying: false,
            isSub: false
          },
          kimberlyF: {
            name: "Kimberly F.",
            seconds: 0,
            isPlaying: false,
            isSub: false
          }
        }}
        positions={{
          goalie: {
            name: "Goalkeeper",
            current: undefined,
            sub: undefined
          },
          leftD: {
            name: "Left defence",
            current: undefined,
            sub: undefined
          },
          rightD: {
            name: "Right defence",
            current: undefined,
            sub: undefined
          },
          mid: {
            name: "Midfield",
            current: undefined,
            sub: undefined
          },
          leftO: {
            name: "Left offence",
            current: undefined,
            sub: undefined
          },
          rightO: {
            name: "Right offence",
            current: undefined,
            sub: undefined
          }
        }}
      />
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
