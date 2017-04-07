//index.js
//获取应用实例
var app = getApp()

Page({

    data: {
        mineMap: {},
        timesGo: 0,
        minesLeft: 0
    },

    mineMap: {},
    mineMapMapping: {},
    rowCount: 8,
    colCount: 8,
    mineCount: 8,
    minMineCount: 8,
    maxMineCount: 20,
    minesLeft: 0,
    timesGo: 0,
    timeInterval: null,
    flagOn: false,
    flags: 0,
    endOfTheGame: false,
    safeMinesGo: 0,

    onLoad: function() {

        this.setData({
            minesLeft: 0,
            timesGo: 0
        });
        this.drawMineField();
        this.setData({
            buttionText: 'START'
        })

    },

    setGame: function() {

        this.drawMineField();
        this.createMinesMap();
        this.setMinesLeft();
        this.timeGoReset();
        this.timeGoClock();
        this.endOfTheGame = false;
        this.safeMinesGo = 0;
        this.setData({
            buttionText: 'RESTART'
        })

    },

    setMinesLeft: function() {
        this.minesLeft = this.mineCount;
        this.setData({minesLeft: this.minesLeft});
    },

    timeGoClock: function() {
        var self = this;
        this.timeInterval = setInterval(function () {
            // console.log(self.data.timesGo);
            self.timesGo = self.timesGo + 1;
            self.setData({timesGo: self.timesGo});
            
        }, 1000);
    },

    timeGoStop: function() {
    
        clearInterval(this.timeInterval);
    },

    timeGoReset: function() {
        clearInterval(this.timeInterval);
        this.timesGo = 0;
        this.setData({timesGo: this.timesGo});
    },

    createMinesMap: function() {

        var tmpMineMap = {};
        // initalize mine map with 0.
        for (var row = 0; row < this.rowCount; row++) {

            tmpMineMap[row] = [];
            for (var col = 0; col < this.colCount; col++) {

                tmpMineMap[row][col] = 0;
            }
        }
         //console.log(tmpMineMap);
        
        // laying mines with 9
        this.mineCount = this.rangeRandom(this.minMineCount, this.maxMineCount);

        var tmpCount = this.mineCount;
        //console.log("Mine count: ", tmpCount);
        while (tmpCount > 0) {

            var row = this.rangeRandom(0, this.rowCount - 1);
            var col = this.rangeRandom(0, this.colCount - 1);

            if (tmpMineMap[row][col] != 9) {

                tmpMineMap[row][col] = 9;
                tmpCount--;
            }
        }

        // calculate numbers around mines.
        for (var row = 0; row < this.rowCount; row++) {
            for (var col = 0; col < this.colCount; col++) {
                var startRow = row - 1;
                var startCol = col - 1;
                //console.log("check====== r" +startRow +"c"+startCol );
                for (var r = row-1; r < row+2; r++) {
                    for (var c = col-1; c < col+2; c++) {
                        //console.log("go: r"+r+":c"+c);
                        if (c >= 0 && c < this.colCount
                            && r >= 0 && r < this.rowCount
                        && !(r === row && c === col) 
                        && tmpMineMap[r][c] == 9 
                        && tmpMineMap[row][col] != 9) {
                            tmpMineMap[row][col]++;
                        }
                    }
                }
            }
        }
        this.mineMapMapping = tmpMineMap;
    },

    drawMineField: function() {

        var tmpMineMap = {};
        for (var row = 0; row < this.rowCount; row++) {

            tmpMineMap[row] = [];
            for (var col = 0; col < this.colCount; col++) {

                tmpMineMap[row][col] = -1;
            }
        }
        this.mineMap = tmpMineMap;
        //console.log(this.mineMap);

        this.setData({
            mineMap: this.mineMap 
        })

    },

    demining: function(event) {

        if (JSON.stringify(this.mineMapMapping) == "{}") return;


        var x = parseInt(event.target.dataset.x);
        var y = parseInt(event.target.dataset.y);
        var value = parseInt(event.target.dataset.value);
        //console.log("value:" + value +" x:"+x +" y:"+y);

        //flag this field as mine.
        if (this.flagOn) {

            this.flag(x, y, value);
            return;
        }

        // if field has been opened, return.
        if (value > 0) return;
        
        var valueMapping = this.mineMapMapping[x][y];
        //console.log(this.mineMapMapping);
        //console.log(valueMapping);

        if (valueMapping < 9) {
            this.mineMap[x][y] = valueMapping;
            this.setData({mineMap: this.mineMap});
            this.safeMinesGo++;
            console.log("Safe mine go: " + this.safeMinesGo);
            if ((this.safeMinesGo + this.mineCount) == (this.rowCount * this.colCount)) {
                this.success();
            }
        }

        // When digg the mine.
        if (valueMapping == 9) {
            this.failed();
        }

        // Open the fields with 0 mines arround.
        if (valueMapping == 0) {

            this.openZeroArround(x, y);
            this.setData({mineMap:this.mineMap});
        }
    },

    success: function() {

        wx.showToast({
            title: 'Good Job !',
            image: '../images/icon/emoticon_happy.png',
            duration: 3000
        })
        this.timeGoStop();
        this.endOfTheGame = true;
    },

    failed: function() {
        wx.showToast({
            title: 'Bomb !!!',
            image: '../images/icon/emoticon_sad.png',
            mask: true,
            duration: 3000
        })

        this.showAll();
        this.timeGoStop();
        this.endOfTheGame = true;
    },

    // Open the fields arround 0 field recursively.
    openZeroArround: function(row, col) {
        //console.log("click" + row + " " + col)
        for (var r = (row-1); r < (row+2); r++) {
            for (var c = (col-1); c < (col+2); c++) {
                //console.log("go: r"+r+":c"+c);
                if (r >= 0 && r < this.rowCount
                    && c >= 0 && c < this.colCount
                && !(r === row && c === col) 
                && this.mineMap[r][c] < 0) {

                    this.mineMap[r][c] = this.mineMapMapping[r][c];
                    this.safeMinesGo++;

                    if (this.mineMapMapping[r][c] == 0) {
                        this.openZeroArround(r, c);
                    }

                }
            }
        }
        console.log("Safe mine go: " + this.safeMinesGo);
        if ((this.safeMinesGo + this.mineCount) == (this.rowCount * this.colCount)) {
            this.success();
        }

    },

    flagSwitch: function(e) {

        if (e.detail.value) {

            this.flagOn = true;
        } else {

            this.flagOn = false;
        }
    },

    flag: function(x, y, value) {

        if (value > 0 && value < 10) return;

        // if flaged already, set the original state.
        if (value == 10) {

            this.pullUpFlag(x, y);
            return;
        }

        if (this.minesLeft <= 0) return;

        this.minesLeft = this.minesLeft - 1;
        this.mineMap[x][y] = 10;

        this.setData({mineMap: this.mineMap, minesLeft: this.minesLeft});
    },

    pullUpFlag: function(x, y) {

        if (this.minesLeft < this.mineCount) {
            this.minesLeft = this.minesLeft + 1;
        }
        this.mineMap[x][y] = -1;
        this.setData({mineMap: this.mineMap, minesLeft: this.minesLeft});
    },

    rangeRandom: function(x, y) {
        var z = y - x + 1;
        return Math.floor(Math.random() * z + x);
    }, 

    showAll: function() {
        this.mineMap = this.mineMapMapping;
        this.setData({mineMap: this.mineMap});
    }

});



