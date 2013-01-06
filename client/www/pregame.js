require(["Theme", "Map", "jquery-1.6.2.min.js","gamenode", "base"], function(Theme, Map) {
  var client = new GameNodeClient(Skeleton);
  var session = null;

  var gameId = /[?&]gameId=([0-9a-f]+)/.exec(window.location.search);
  if(gameId !== null)
    gameId = gameId[1];
  else
    document.location = "/";

  var theme = null;
  var mapPainter = null;

  $(document).ready(function() {
    var loginUrl = "login.html?next=" + document.location.pathname + document.location.search;
    session = resumeSessionOrRedirect(client, WARS_CLIENT_SETTINGS.gameServer, loginUrl, function() {
      client.stub.subscribeGame(gameId);

      populateNavigation(session);
      client.stub.profile(function(response) {
        theme = new Theme(response.profile.settings.gameTheme);
        if(gameId !== null) {
          theme.load(function() {
            mapPainter = new Map(undefined, 1.0, theme);
            mapPainter.canvas = $("#mapCanvas")[0];
            client.stub.gameData(gameId, function(response) {
              if(response.success) {
                if(response.game.state != "pregame") {
                  document.location = "game.html?gameId=" + gameId;
                }
                initializeChat(client, gameId);
                showGame(response.game, response.author);
              } else {
                alert("Error loading game!" + response.reason);
              }
            });
          });
        }
      });
    });
  });


  function showGame(game, author) {
    $("#gameName").text(game.name);
    if(author) {
      initalizeAuthorTools();
    } else {
      $("#authorTools").hide();
    }

    mapPainter.doPreload(function() {
      showPlayers(game.players, author);

      mapPainter.tiles = game.tiles;
      var mapSize = mapPainter.getMapDimensions();
      var width = mapSize.e(1);
      var height = mapSize.e(2);
      mapPainter.canvas.width = width;
      mapPainter.canvas.height = height;
      mapPainter.refresh();
    });

  }

  function showPlayers(players, authorMode) {
    players.sort(function(a, b) { return a.playerNumber - b.playerNumber; });
    var playerList = $("#players");

    for(var i = 0; i < players.length; ++i) {
      var player = players[i];
      var item = $("<li></li>");
      var number = $("<span></span>");
      var name = $("<span></span>");

      item.addClass("playerItem");
      item.attr("playerNumber", player.playerNumber);

      number.text(player.playerNumber);
      number.css("background-color", theme.getPlayerColorString(player.playerNumber));
      number.addClass("playerNumber");

      name.text(player.playerName !== null ? player.playerName : "");
      name.addClass("playerName");

      item.append(number);
      item.append(name);

      var joinButton = $("<span></span>");
      joinButton.addClass("joinButton");
      item.append(joinButton);

      var hack = function(playerNumber) {
        joinButton.click(function() {
          if($(this).hasClass("notJoined")) {
            client.stub.joinGame(gameId, playerNumber, function(response) {
              if(!response.success) {
                alert("Error joining game!" + response.reason);
              }
            });
          } else {
            client.stub.leaveGame(gameId, playerNumber, function(response) {
              if(!response.success) {
                alert("Error leaving game!" + response.reason);
              }
            });
          }
        });
      }(player.playerNumber);

      if(player.userId === null) {
        joinButton.addClass("notJoined");
        joinButton.text("Click to join!");
      } else {
        if(player.isMe || authorMode) {
          joinButton.addClass("joined");
          joinButton.text("X");
        } else {
          joinButton.hide();
        }
      }

      playerList.append(item);
    }


    client.skeleton.playerJoined = function(gameId, playerNumber, playerName, isMe) {
      var nameLabel = $('.playerItem[playerNumber="' + playerNumber + '"] .playerName');
      var joinButton = $('.playerItem[playerNumber="' + playerNumber + '"] .joinButton');
      nameLabel.text(playerName)
      joinButton.removeClass("notJoined");
      if(isMe || authorMode) {
          joinButton.addClass("joined");
          joinButton.text("X");
      } else {
        joinButton.hide();
      }
    }

    client.skeleton.playerLeft = function(gameId, playerNumber) {
      var nameLabel = $('.playerItem[playerNumber="' + playerNumber + '"] .playerName');
      var joinButton = $('.playerItem[playerNumber="' + playerNumber + '"] .joinButton');
      joinButton.removeClass("joined");
      nameLabel.text("");
      joinButton.addClass("notJoined");
      joinButton.text("Click to join!");
      joinButton.show();
    }

    client.skeleton.gameStarted = function(gameId) {
      document.location = "game.html?gameId=" + gameId;
    }
  }

  function initalizeAuthorTools() {
    $("#startGame").click(function(e) {
      e.preventDefault();
      client.stub.startGame(gameId, function(response) {
        if(response.success) {

        } else {
          alert("Error starting game! " + response.reason);
        }
      });
    });
    $("#deleteGame").click(function(e) {
      e.preventDefault();
      client.stub.deleteGame(gameId, function(response) {
        if(response.success) {
          document.location = "/home.html";
        } else {
          alert("Error deleting game! " + response.reason);
        }
      });
    });

    $("#inviteForm").submit(function(e) {
      e.preventDefault();
      var username = $("#username").val();
      if(username.length > 0) {
        client.stub.addInvite(gameId, username, function(response) {
          if(!response.success) {
            alert("Error inviting user! " + response.reason);
          }
        });
      }
    });

    client.stub.botNames(function(names) {
      if(names === null || names === undefined || names.length === 0)  {
        $("#inviteForm").hide();
      } else {
        for(var i = 0; i < names.length; ++i) {
          var name = names[i];
          var item = $("<option></option>");
          item.attr("value", name);
          item.text(name);
          $("#username").append(item);
        }
      }
    });
  }
});