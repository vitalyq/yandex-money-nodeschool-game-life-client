'use strict';

const nyan = `
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄░░░░░░░░░░░
░░░░░░░░▄▀░░░░░░░░░░░░▄░░░░░░░▀▄░░░░░░░░
░░░░░░░░█░░▄░░░░▄░░░░░░░░░░░░░░█░░░░░░░░
░░░░░░░░█░░░░░░░░░░░░▄█▄▄░░▄░░░█░▄▄▄░░░░
░▄▄▄▄▄░░█░░░░░░▀░░░░▀█░░▀▄░░░░░█▀▀░██░░░
░██▄▀██▄█░░░▄░░░░░░░██░░░░▀▀▀▀▀░░░░██░░░
░░▀██▄▀██░░░░░░░░▀░██▀░░░░░░░░░░░░░▀██░░
░░░░▀████░▀░░░░▄░░░██░░░▄█░░░░▄░▄█░░██░░
░░░░░░░▀█░░░░▄░░░░░██░░░░▄░░░▄░░▄░░░██░░
░░░░░░░▄█▄░░░░░░░░░░░▀▄░░▀▀▀▀▀▀▀▀░░▄▀░░░
░░░░░░█▀▀█████████▀▀▀▀████████████▀░░░░░░
░░░░░░████▀░░███▀░░░░░░▀███░░▀██▀░░░░░░░
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
`;
const URL = 'ws://localhost:3000/';
const ADD_INTERVAL = 1000;
let socket;
let lifeGame;
let token;
let color;
let lastTimeout;
const points = [];

// Batch points and send in bulk
const onSend = (state) => {
  points.push(...state.affectedPoints);

  const timeout = window.setTimeout(() => {
    if (timeout !== lastTimeout) { return; }
    state.affectedPoints = points.concat();
    points.length = 0;
    socket.send(JSON.stringify({
      type: 'ADD_POINT',
      data: state,
    }));
  }, ADD_INTERVAL);

  lastTimeout = timeout;
};

const initialize = (data) => {
  lifeGame = new LifeGame(data.user, data.settings);
  lifeGame.init();
  lifeGame.setState(data.state);
  lifeGame.send = onSend;
  color = data.user.color;
};

const updateState = (data) => {
  // Add batched points
  points.forEach((p) => {
    data[p.x][p.y] = { user: { token, color } };
  });
  lifeGame.setState(data);
};

const onMessage = (event) => {
  const { type, data } = JSON.parse(event.data);
  switch (type) {
    case 'INITIALIZE':
      initialize(data);
      break;
    case 'UPDATE_STATE':
      updateState(data);
      break;
    default:
      console.error(`Messages of type ${type} are not supported`);
  }
};

App.onToken = (newToken) => {
  if (!newToken) { return; }
  token = newToken;
  socket = new WebSocket(`${URL}?token=${token}`);

  socket.addEventListener('message', onMessage);
  socket.addEventListener('open', () => console.log('Connected'));
  socket.addEventListener('close', () => console.log('Disconnected'));
  socket.addEventListener('error', console.error);
};

// Send Nyan Cat
document.addEventListener('keydown', (event) => {
  if (event.keyCode !== 13 || !socket || socket.readyState !== 1) { return; }
  const dots = [];

  const lines = nyan.split('\n');
  lines.forEach((line, y) => {
    [...line].forEach((char, x) => {
      switch (char) {
        case '█':
          dots.push({ x, y: y * 2 });
          dots.push({ x, y: (y * 2) + 1 });
          break;
        case '▀':
          dots.push({ x, y: y * 2 });
          break;
        case '▄':
          dots.push({ x, y: (y * 2) + 1 });
          break;
        default:
      }
    });
  });

  socket.send(JSON.stringify({
    type: 'ADD_POINT',
    data: {
      affectedPoints: dots,
      user: { token, color },
    },
  }));
});
