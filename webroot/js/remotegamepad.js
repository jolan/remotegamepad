var debug = false;
var sessions = {};

$(function () {
  $('[data-toggle="tooltip"]').tooltip()
});

window.addEventListener("gamepadconnected", gamepadConnectHandler);
window.addEventListener("gamepaddisconnected", gamepadDisconnectHandler);

sessionCreateList();

function dec2hex(dec) {
  if (dec < 10) {
    return '0' + String(dec);
  } else {
    return dec.toString(16);
  }
}

function gamepadConnectHandler(e) {
  var defaultProfileInUse = (e.gamepad["id"] == gamepadShortName(e.gamepad["id"]) ? true : false);
  var alert = `
<div class="alert alert-success alert-dismissible fade show gamepadConnectHandler" role="alert">
    <strong>Controller Connected</strong>`.trim() +
    " " + gamepadShortName(e.gamepad["id"]) + ` 
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
    </button>
</div>
`.trim();
  $("#status").append(alert);
  $(".gamepadConnectHandler").fadeOut(5000);
  if (defaultProfileInUse) {
    gamepadDefaultProfileAlert(e.gamepad);
  }
  sessionCreateList();
}

function gamepadDefaultProfileAlert(gamepadData) {
  var alert = `
<div class="alert alert-warning alert-dismissible fade show" role="alert">
    <strong>Controller Is Using Default Profile</strong><div>`.trim() +
    " " + gamepadData["id"] + " " + `doesn't have a specialized profile for it yet.
    Button mappings may be incorrect or some buttons may not function at all.
    You can help us by following the <strong>Adding A Profile For A Controller</strong> instructions at
    <a href="https://github.com/jolan/remotegamepad">https://github.com/jolan/remotegamepad</a>.</div>
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
    </button>
</div>
`.trim();
  $("#status").append(alert);
}

function gamepadDisconnectHandler(e) {
  var alert = `
<div class="alert alert-warning alert-dismissible fade show gamepadDisconnectHandler" role="alert">
    <strong>Controller Disconnected</strong>`.trim() +
    " " + gamepadShortName(e.gamepad["id"]) + ` 
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
    </button>
</div>
`.trim();
  $("#status").append(alert);
  $(".gamepadDisconnectHandler").fadeOut(5000);
  sessionCreateList();
}

function gamepadStateSend(sessionId, ws, gamepadData, gamepadSwap) {
  switch (gamepadData["id"]) {
    case "Nintendo Co., Ltd. Pro Controller (STANDARD GAMEPAD Vendor: 057e Product: 2009)":
      // B0 = B
      // B1 = A
      // B2 = Y
      // B3 = X
      // B4 = L
      // B5 = R
      // B6 = ZL
      // B7 = ZR
      // B8 = Minus
      // B9 = Plus
      // B10 = Left-Stick Click
      // B11 = Right-Stick Click
      // B12 = D-Pad Up
      // B13 = D-Pad Down
      // B14 = D-Pad Left
      // B15 = D-Pad Right
      // B16 = Home
      // B17 = Capture
      // Axis 0 = Left Stick X (Left/Right)
      // Axis 1 = Left Stick Y (Up/Down)
      // Axis 2 = Right Stick X (Left/Right)
      // Axis 3 = Right Stick Y (Up/Down)
      inputs = {
        dpad: {
          up: gamepadData["buttons"][12]["value"],
          down: gamepadData["buttons"][13]["value"],
          left: gamepadData["buttons"][14]["value"],
          right: gamepadData["buttons"][15]["value"],
        },
        button: {
          b: (gamepadSwap == 0 ?
            gamepadData["buttons"][0]["value"] :
            gamepadData["buttons"][1]["value"]),
          a: (gamepadSwap == 0 ?
            gamepadData["buttons"][1]["value"] :
            gamepadData["buttons"][0]["value"]),
          y: (gamepadSwap == 0 ?
            gamepadData["buttons"][2]["value"] :
            gamepadData["buttons"][3]["value"]),
          x: (gamepadSwap == 0 ?
            gamepadData["buttons"][3]["value"] :
            gamepadData["buttons"][2]["value"]),
          l: gamepadData["buttons"][4]["value"],
          zl: gamepadData["buttons"][6]["value"],
          r: gamepadData["buttons"][5]["value"],
          zr: gamepadData["buttons"][7]["value"],
          minus: gamepadData["buttons"][8]["value"],
          plus: gamepadData["buttons"][9]["value"],
          home: gamepadData["buttons"][16]["value"],
          capture: gamepadData["buttons"][17]["value"]
        },
        stick: {
          left: {
            x: gamepadData["axes"][0],
            y: gamepadData["axes"][1] * -1, // need to send inverse
            press: gamepadData["buttons"][10]["value"]
          },
          right: {
            x: gamepadData["axes"][2],
            y: gamepadData["axes"][3] * -1, // need to send inverse
            press: gamepadData["buttons"][11]["value"]
          }
        }
      };
      ws.send(JSON.stringify(inputs))
      break;
    case "Microsoft Controller (STANDARD GAMEPAD Vendor: 045e Product: 02dd)":
    case "Microsoft Controller (STANDARD GAMEPAD Vendor: 045e Product: 02ea)":
      // B0 = A
      // B1 = B
      // B2 = X
      // B3 = Y
      // B4 = L (LB)
      // B5 = R (RB)
      // B6 = ZL (LT: Analog)
      // B7 = ZR (RT: Analog)
      // B8 = Minus (Back/View)
      // B9 = Plus (Start/Menu)
      // B10 = Left-Stick Click
      // B11 = Right-Stick Click
      // B12 = D-Pad Up
      // B13 = D-Pad Down
      // B14 = D-Pad Left
      // B15 = D-Pad Right
      // B16 = Home
      // Axis 0 = Left Stick X (Left/Right)
      // Axis 1 = Left Stick Y (Up/Down)
      // Axis 2 = Right Stick X (Left/Right)
      // Axis 3 = Right Stick Y (Up/Down)
      inputs = {
        dpad: {
          up: gamepadData["buttons"][12]["value"],
          down: gamepadData["buttons"][13]["value"],
          left: gamepadData["buttons"][14]["value"],
          right: gamepadData["buttons"][15]["value"],
        },
        button: {
          a: (gamepadSwap == 0 ?
            gamepadData["buttons"][0]["value"] :
            gamepadData["buttons"][1]["value"]),
          b: (gamepadSwap == 0 ?
            gamepadData["buttons"][1]["value"] :
            gamepadData["buttons"][0]["value"]),
          x: (gamepadSwap == 0 ?
            gamepadData["buttons"][2]["value"] :
            gamepadData["buttons"][3]["value"]),
          y: (gamepadSwap == 0 ?
            gamepadData["buttons"][3]["value"] :
            gamepadData["buttons"][2]["value"]),
          l: gamepadData["buttons"][4]["value"],
          zl: gamepadData["buttons"][6]["value"],
          r: gamepadData["buttons"][5]["value"],
          zr: gamepadData["buttons"][7]["value"],
          minus: gamepadData["buttons"][8]["value"],
          plus: gamepadData["buttons"][9]["value"],
          home: gamepadData["buttons"][16]["value"],
          capture: 0
        },
        stick: {
          left: {
            x: gamepadData["axes"][0],
            y: gamepadData["axes"][1] * -1, // need to send inverse
            press: gamepadData["buttons"][10]["value"]
          },
          right: {
            x: gamepadData["axes"][2],
            y: gamepadData["axes"][3] * -1, // need to send inverse
            press: gamepadData["buttons"][11]["value"]
          }
        }
      };
      ws.send(JSON.stringify(inputs))
      break;
    default:
      // TODO ensure mapping == standard before applying this
      // The mappings are pretty standard usually so just hope for the best
      // B0 = A
      // B1 = B
      // B2 = X
      // B3 = Y
      // B4 = Left Shoulder Button
      // B5 = Right Shoulder Button
      // B6 = Left Trigger
      // B7 = Right Trigger
      // B8 = ?
      // B9 = ?
      // B10 = Left-Stick Click
      // B11 = Right-Stick Click
      // B12 = D-Pad Up
      // B13 = D-Pad Down
      // B14 = D-Pad Left
      // B15 = D-Pad Right
      // B16 = Home
      // Axis 0 = Left Stick X (Left/Right)
      // Axis 1 = Left Stick Y (Up/Down)
      // Axis 2 = Right Stick X (Left/Right)
      // Axis 3 = Right Stick Y (Up/Down)
      inputs = {
        dpad: {
          up: gamepadData["buttons"][12]["value"],
          down: gamepadData["buttons"][13]["value"],
          left: gamepadData["buttons"][14]["value"],
          right: gamepadData["buttons"][15]["value"],
        },
        button: {
          a: (gamepadSwap == 0 ?
            gamepadData["buttons"][0]["value"] :
            gamepadData["buttons"][1]["value"]),
          b: (gamepadSwap == 0 ?
            gamepadData["buttons"][1]["value"] :
            gamepadData["buttons"][0]["value"]),
          x: (gamepadSwap == 0 ?
            gamepadData["buttons"][2]["value"] :
            gamepadData["buttons"][3]["value"]),
          y: (gamepadSwap == 0 ?
            gamepadData["buttons"][3]["value"] :
            gamepadData["buttons"][2]["value"]),
          l: gamepadData["buttons"][4]["value"],
          zl: gamepadData["buttons"][6]["value"],
          r: gamepadData["buttons"][5]["value"],
          zr: gamepadData["buttons"][7]["value"],
          minus: gamepadData["buttons"][8]["value"],
          plus: gamepadData["buttons"][9]["value"],
          home: gamepadData["buttons"][16]["value"],
          capture: 0
        },
        stick: {
          left: {
            x: gamepadData["axes"][0],
            y: gamepadData["axes"][1] * -1, // need to send inverse
            press: gamepadData["buttons"][10]["value"]
          },
          right: {
            x: gamepadData["axes"][2],
            y: gamepadData["axes"][3] * -1, // need to send inverse
            press: gamepadData["buttons"][11]["value"]
          }
        }
      };
      ws.send(JSON.stringify(inputs))
      break;
  }

  $("#buffer-" + sessionId).html(sessions[sessionId]["ws"].bufferedAmount + " bytes");
  if (sessions[sessionId]["lastsent"] == 0) {
    sessions[sessionId]["lastsent"] = Date.now();
    return;
  }

  var now = Date.now();
  // TODO would be nice to smooth this out and display a decaying average or
  // something
  $("#status-" + sessionId).html("Last sent " + (now - sessions[sessionId]["lastsent"] + " ms ago"));
  sessions[sessionId]["lastsent"] = Date.now();
}

function gamepadStateSendAll() {
  var continuePolling = false;
  var gamepads = navigator.getGamepads();

  $.each(sessions, function (sessionId, d) {
    if (d["poll"]) {
      continuePolling = true;
      gamepadStateSend(sessionId, d["ws"], gamepads[d["gamepadId"]], d["gamepadSwap"]);
    }
  });

  if (continuePolling) {
    window.requestAnimationFrame(gamepadStateSendAll);
  }
}

function gamepadShortName(name) {
  switch (name) {
    case "Microsoft Controller (STANDARD GAMEPAD Vendor: 045e Product: 02dd)":
      // Microsoft Corp. Xbox One Controller (Firmware 2015)
      return "Xbox One Controller (Firmware 2015)";
    case "Microsoft Controller (STANDARD GAMEPAD Vendor: 045e Product: 02ea)":
      // Microsoft Corp. Xbox One S Controller
      return "Xbox One S Controller";
    case "Nintendo Co., Ltd. Pro Controller (STANDARD GAMEPAD Vendor: 057e Product: 2009)":
      // Nintendo Co., Ltd Switch Pro Controller
      return "Switch Pro Controller";
      break;
    default:
      return name;
      break;
  }
}

function generateId(len) {
  var arr = new Uint8Array((len || 40) / 2)
  window.crypto.getRandomValues(arr)
  return Array.from(arr, dec2hex).join('')
}

function sessionActiveList() {
  $("#sessionsActiveHeader").show();
  $("#sessionsActive").show();

  var gamepads = navigator.getGamepads();
  var sessionActiveRows = "";

  $.each(sessions, function (sessionId, d) {
    // check if session still active
    // TODO should really do this on creation of the socket
    if (d["ws"].onclose == null) {
      d["ws"].onclose = function (event) {
        sessions[sessionId]["status"] = "Closed";
        $("#status-" + sessionId).html(sessions[sessionId]["status"]);
        websocketCloseAlert(sessionId);
      };
    }
    if (d["ws"].onerror == null) {
      d["ws"].onerror = function () {
        sessions[sessionId]["status"] = "Error";
        $("#status-" + sessionId).html(sessions[sessionId]["status"]);
        websocketErrorAlert(sessionId);
      };
    }
    if (d["ws"].onopen == null) {
      d["ws"].onopen = function () {
        sessions[sessionId]["poll"] = true;
        sessions[sessionId]["status"] = "Connected";
        $("#status-" + sessionId).html(sessions[sessionId]["status"]);
        window.requestAnimationFrame(gamepadStateSendAll);
      };
    }
    sessionActiveRows = "<tr>" +
      '<td style="vertical-align: middle; word-wrap: break-word;">' + gamepadShortName(gamepads[d["gamepadId"]]["id"]) + "</td>" +
      '<td style="vertical-align: middle;">' + relayservers[d["relayserverId"]]["name"] + "</td>" +
      '<td style="vertical-align: middle;"><span id="status-' + sessionId + '">' + d["status"] + "</span></td>" +
      '<td style="vertical-align: middle;"><span id="buffer-' + sessionId + '">' + d["ws"].bufferedAmount + " bytes</td > " +
      '<td><button type="button" class="btn btn-danger" onClick=sessionEnd("' + sessionId + '");><i class="fas fa-unlink"></i> Unlink</button></td>' +
      "</tr>";
  });

  $("#sessionsActive").find('tbody').html(sessionActiveRows);
}

function sessionCreateList() {
  var gamepads = navigator.getGamepads();
  var gamepadsAvailable = {};
  var relayserversAvailable = {};

  $.each(gamepads, function (gamepadIndex, gamepadData) {
    if (gamepadData == null) {
      return;
    }
    gamepadsAvailable[gamepadIndex] = gamepadData;
  });

  $.each(relayservers, function (relayserverIndex, relayserverData) {
    if (relayserverData == null) {
      return;
    }
    relayserversAvailable[relayserverIndex] = relayserverData;
  });

  $.each(sessions, function (sessionIndex, sessionData) {
    delete gamepadsAvailable[sessionData["gamepadId"]];
    delete relayserversAvailable[sessionData["relayserverId"]];
  });

  numGamepads = Object.keys(gamepadsAvailable).length;
  switch (numGamepads) {
    case 0:
      gamepadDropdownBody = "<option value=-1>-- No Gamepads available --</option>";
      break;
    default:
      var didSelect = false;
      gamepadDropdownBody = "<option value=-1>-- Select A Gamepad --</option>";
      $.each(gamepadsAvailable, function (i, d) {
        gamepadDropdownBody += "<option value=" + i +
          (didSelect == false ? " selected" : "") + ">"
          + gamepadShortName(d["id"]) + "</option>";
        if (didSelect == false) {
          didSelect = true;
        }
      });
      break;
  }

  var gamepadSwapDropdownBody = `
    <option value=0>No</option>
    <option value=1>Yes</option>
`.trim();

  numRelayservers = Object.keys(relayserversAvailable).length;
  switch (numRelayservers) {
    case 0:
      relayserversDropdownBody = "<option value=-1>-- No Relay Servers available --</option>";
      break;
    default:
      relayserversDropdownBody = "<option value=-1>-- Select A Relay Server --</option>";
      var didSelect = false;
      $.each(relayserversAvailable, function (i, d) {
        relayserversDropdownBody += "<option value=" + i +
          (didSelect == false ? " selected" : "") + ">"
          + d["name"] + "</option>";
        if (didSelect == false) {
          didSelect = true;
        }
      });
      break;
  }

  gamepadDropdownFooter = `
    </select>
</div>
`.trim();
  gamepadSwapDropdownFooter = `
    </select>
</div>
`.trim();
  relayserversDropdownFooter = `
    </select>
</div>
`.trim();

  var sessionStartRows = "";
  if (numGamepads == 0) {
    sessionStartRows = '<tr><td colspan=4><div class="alert alert-warning" role="alert">' +
      'No gamepads detected.  Press a button or wiggle the joysticks to trigger detection.</td></tr> ';
  } else if (numRelayservers == 0) {
    sessionStartRows = "<tr><td colspan=4>No relay servers available.</td></tr>";
  } else {
    sessionStartRows = "";
  }

  var maxRows = Math.min(numGamepads, numRelayservers);
  // TODO need to improve UI for starting multiple sessions
  if (maxRows > 1) {
    maxRows = 1;
  }
  for (row = 0; row < maxRows; row++) {
    gamepadDropdownHeader = `
        <div class="form-group">
            <select class="form-control" id="gamepadAvail`.trim() + row + `">
`.trim();
    gamepadSwapDropdownHeader = `
<div class="form-group">
    <select class="form-control" id="gamepadSwap`.trim() + row + `">
`.trim();
    relayserversDropdownHeader = `
    <div class="form-group" >
        <select class="form-control" id="relayserverAvail`.trim() + row + `">
`.trim();

    sessionStartRows += "<tr>" +
      "<td>" + gamepadDropdownHeader + gamepadDropdownBody + gamepadDropdownFooter + "</td>" +
      "<td>" + gamepadSwapDropdownHeader + gamepadSwapDropdownBody + gamepadSwapDropdownFooter + "</td>" +
      "<td>" + relayserversDropdownHeader + relayserversDropdownBody + relayserversDropdownFooter + "</td>" +
      '<td><button type="button" class="btn btn-success" onClick=sessionStart(' + row + ');><i class="fas fa-link"></i> Link</button></td>' +
      "</tr>";
  }

  $("#sessionsAvailable").find('tbody').html($(sessionStartRows));
}

function sessionDelete(sessionId) {
  delete (sessions[sessionId]);
  sessionCreateList();
  sessionActiveList();
}

function sessionEnd(sessionId) {
  sessionEndAlert(sessionId);
  sessions[sessionId]["ws"].onclose = null;
  sessions[sessionId]["ws"].close();
  sessionDelete(sessionId);
}

function sessionEndAlert(sessionId) {
  var gamepads = navigator.getGamepads();
  var gamepadId = sessions[sessionId]["gamepadId"];
  var relayserverId = sessions[sessionId]["relayserverId"]
  var ntfnStr = "Link from " + gamepadShortName(sessions[sessionId]["gamepadName"]) + " to " + relayservers[relayserverId]["name"] + " (" +
    relayservers[relayserverId]["dsn"] + ") closed.";
  var alert = `
<div class="alert alert-success alert-dismissible fade show sessionEnd" role="alert">
    <strong>Session Ended</strong>`.trim() +
    " " + ntfnStr + ` 
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
    </button>
</div>
`.trim();
  $("#status").append(alert);
  $(".sessionEnd").fadeOut(5000);
}

function sessionStart(rowNum) {
  var gamepads = navigator.getGamepads();
  var gamepadId = $("#gamepadAvail" + rowNum).val();
  var gamepadSwap = $("#gamepadSwap" + rowNum).val();
  var gamepadData = gamepads[gamepadId];
  var relayserverId = $("#relayserverAvail" + rowNum).val();
  var randomId = generateId(12);

  if (gamepadId == -1) {
    sesssionStartError("No gamepad selected");
    return;
  }

  if (relayserverId == -1) {
    sesssionStartError("No relay server selected");
    return;
  }

  sessions[randomId] = {
    gamepadId: gamepadId,
    gamepadName: gamepadData["id"],
    gamepadSwap: gamepadSwap,
    lastsent: 0,
    poll: false,
    relayserverId: relayserverId,
    status: "Starting",
    ws: new WebSocket("ws://" + relayservers[relayserverId]["dsn"] + "/controller", ["remotegamepad-0.1"]),
  };

  sessionCreateList();
  sessionActiveList();
}

function sesssionStartError(err) {
  var alert = `
<div class="alert alert-danger alert-dismissible fade show sessionStartError" role="alert">
    <strong>Session Start Error</strong>`.trim() + " " + err + ` 
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
    </button>
</div>
`.trim();
  $("#status").append(alert);
  $(".sessionStartError").fadeOut(5000);
}

function websocketCloseAlert(sessionId) {
  var relayserverId = sessions[sessionId]["relayserverId"]
  var errStr = "Connection to " + relayservers[relayserverId]["name"] + " (" +
    relayservers[relayserverId]["dsn"] + ") closed.";
  var alert = `
<div class="alert alert-warning alert-dismissible fade show websocketClose" role="alert">
    <strong>WebSocket Closed</strong>`.trim() + " " + errStr + ` 
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
    </button>
</div>
`.trim();
  $("#status").append(alert);
  $(".websocketClose").fadeOut(10000);

  sessionDelete(sessionId);
}

function websocketErrorAlert(sessionId) {
  var relayserverId = sessions[sessionId]["relayserverId"]
  var errStr = "Connection to " + relayservers[relayserverId]["name"] + " (" +
    relayservers[relayserverId]["dsn"] + ") errored.";
  var alert = `
<div class="alert alert-danger alert-dismissible fade show websocketError" role="alert">
    <strong>WebSocket Error</strong>`.trim() + " " + errStr + ` 
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
    </button>
</div>
`.trim();
  $("#status").append(alert);
  $(".websocketError").fadeOut(8000);
}
