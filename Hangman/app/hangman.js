var HangmanViewModel = function () {
    var that = this;
    this.word = ko.observable("");
    this.letterGuess = ko.observable("");
    this.showNewGame = ko.observable(false);
    this.createNewGame = ko.observable(false);
    this.gameChars = ko.observableArray();
    this.gamwWord = ko.observable("");
    this.gameover = ko.observable(10);
    this.ongoingGameChars = ko.observableArray();
    this.wrongGuesses = ko.observableArray();
    this.wordCount = ko.computed(function () {
        return that.word().length;
    });
    this.wrongGuessCount = ko.computed(function () {
        return that.wrongGuesses().length;
    });

    //TODO: Hitta alfabets-ikoner och "dash"-ikon (problem....åäö! Deal with it)
    //TODO: skelett när man misslyckas!

    var resetGame = function () {
        that.wrongGuesses([]);
        that.gameChars([]);
        that.word("");
        that.gamwWord("");
        that.ongoingGameChars([]);
    }

    var newGame = function(word) {
        that.gameChars(word.toUpperCase().split(""));
        _.forEach(that.gameChars(), function (c, i) {
            that.ongoingGameChars.push({ masked: "_", index: i, realchar: c, showreal: false });
        });
        that.showNewGame(true);
        that.createNewGame(false);
        that.gamwWord(word);
        that.word("");
        $("#guessWord").focus();
    }

    this.action_slumper = function () {
        $.getJSON("app/ord.json", function (data) {
            var randomWord = data[Math.floor(Math.random() * data.length)];
            newGame(randomWord);
        });
    }

    this.action_newGame = function () {
        resetGame();
        that.showNewGame(false);
        that.createNewGame(true);
        $("#newWord").focus();
    }

    this.action_createNewGame = function () {
        if (that.wordCount() < 1)
            return;

        newGame(that.word());
    }

    this.action_guessLetter = function() {
        if (that.letterGuess().length === 1) {
            var correctGuess = [];
            _.forEach(that.gameChars(), function (c, i) {
                if (that.letterGuess().toUpperCase() === c) {
                    correctGuess.push(that.letterGuess().toUpperCase());
                }
            });
            _.forEach(correctGuess, function (i) {
                var match = _.filter(that.ongoingGameChars(), function (c) { return c.realchar === i });
                if (match.length > 0) {
                    _.forEach(match, function (m) {
                        m.showreal = true;
                    });

                    //REFRESH ARRAY
                    var data = that.ongoingGameChars();
                    that.ongoingGameChars(null);
                    that.ongoingGameChars(data);
                }
            });
            if (correctGuess.length < 1) {
                if (_.includes(that.wrongGuesses(), that.letterGuess().toUpperCase())) { } else {
                    that.wrongGuesses.push(that.letterGuess().toUpperCase());
                }
            }
            that.letterGuess("");

            $("#guessWord").focus();

            var correctGuesses = _.size(_.filter(that.ongoingGameChars(), function (c) { return c.showreal }));
            if (that.gameChars().length === correctGuesses) {
                $.sweetModal({
                    content: "Tjohooo!! Grattis!",
                    //icon: $.sweetModal.ICON_SUCCESS,
                    icon: $.sweetModal.ICON_BALLOON,
                    buttons: {
                        button1: {
                            label: "Spela igen?",
                            classes: "",
                            action: function () {
                                that.action_newGame();
                            }
                        }
                    }
                });
            }
            
            if (that.wrongGuessCount() === that.gameover()) {
                $.sweetModal({
                    content: "Åh neeeeeeeej!<br>Korrekt ord var: " + that.gamwWord().toUpperCase(),
                    icon: $.sweetModal.ICON_ERROR,
                    buttons: {
                        button1: {
                            label: "Spela igen?",
                            classes: "",
                            action: function () {
                                that.action_newGame();
                            }
                        }
                    }
                });
            }
        }
    }

    this.onGuess = function (d, e) {
        e.keyCode === 13 && that.action_guessLetter();
        return true;
    };
    this.onNewGame = function (d, e) {
        e.keyCode === 13 && that.action_createNewGame();
        return true;
    };
};