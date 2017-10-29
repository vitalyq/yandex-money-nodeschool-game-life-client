'use strict';

//
// YOUR CODE GOES HERE...
//
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
//
// Nyan cat lies here...
//
const URL = 'ws://localhost:3000/';
const ADD_INTERVAL = 1000;

App.onToken = (token) => {
  if (token.length === 0) { return; }
  const socket = new WebSocket(`${URL}?token=${token}`);
  const points = [];
  let lifeGame;
  let lastTimeout;
  let color;

  const handleSend = (data) => {
    // Batch some points and send in bulk
    points.push(...data.affectedPoints);

    const timeout = window.setTimeout(() => {
      if (timeout !== lastTimeout) { return; }
      data.affectedPoints = points.concat();
      points.length = 0;
      socket.send(JSON.stringify({
        type: 'ADD_POINT',
        data,
      }));
    }, ADD_INTERVAL);
    lastTimeout = timeout;
  };

  const handleMessage = (event) => {
    const { type, data } = JSON.parse(event.data);

    if (type === 'INITIALIZE') {
      color = data.user.color;
      lifeGame = new LifeGame(data.user, data.settings);
      lifeGame.init();
      lifeGame.setState(data.state);
      lifeGame.send = handleSend;
    } else if (type === 'UPDATE_STATE') {
      // Apply batched points
      points.forEach((p) => {
        data[p.x][p.y] = { user: { color, token }};
      });
      lifeGame.setState(data);
    }
  };

  // Set up listeners
  socket.addEventListener('message', handleMessage);
  socket.addEventListener('open', () => console.log('Connected'));
  socket.addEventListener('close', () => console.log('Disconnected'));
  socket.addEventListener('error', console.error);

  // And now let's do something weird
  document.addEventListener('keydown', function (event) {
    if (event.keyCode !== 13 || socket.readyState !== 1) { return; }
    const points = [];
    const lines = nyan.split('\n');
    lines.forEach((line, y) => {
      [...line].forEach((char, x) => {
        switch (char) {
          case '█':
            points.push({ x, y: y * 2 });
            points.push({ x, y: y * 2 + 1 });
            break;
          case '▀':
            points.push({ x, y: y * 2 });
            break;
          case '▄':
            points.push({ x, y: y * 2 + 1 });
            break;
        };
      });
    });
    socket.send(JSON.stringify({
      type: 'ADD_POINT',
      data: {
        affectedPoints: points,
        user: { color, token },
      },
    }));
  });
};
