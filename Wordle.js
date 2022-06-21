var keyboardButtons = [
    ['e', 'r', 't', 'y', 'u', 'ı', 'o', 'p', 'ğ', 'ü',],
    ['spacerHalf', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ş', 'i', 'spacerHalf'],
    ['enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'ö', 'ç', 'del'],
];

var answer;
var rowNum = 0;
var colNum = 0;
var squareNum = 0;

function alreadyPlayed()
{
    if(readFromCookie() == answer.kelimeler[0].kelime)
    {
        keyBoardContainer.style.display = "none";
        playedEarlier.style.display = "block";
    }
}

function findTimeLeft()
{
    var nowHour = new Date().getHours()%4;
    var nowMinute = new Date().getMinutes();
    var hourLeft = 3 - nowHour;
    var minuteLeft = 60 - nowMinute;
    if(minuteLeft == 60 || minuteLeft == 0)
        minuteLeft = 00;
    
    alert("Time left for the other word is\nHours: " +hourLeft+ " - Minutes: " +minuteLeft)
}

function readFromCookie()
{
    return localStorage.getItem("kelime");
}

function write2Cookie()
{
    localStorage.setItem("kelime", answer.kelimeler[0].kelime);
}

function winGame()
{
    write2Cookie();
    alert("You Won");
    findTimeLeft();
    alreadyPlayed();
}

function finishGame()
{
    write2Cookie();
    alert("You Lost");
    findTimeLeft();
    alreadyPlayed();
}

function validWordEntered()
{
    if(colorLetters(getWord(rowNum), rowNum))
        winGame();
    else if(rowNum == 6)
        finishGame();
    else
    {
        rowNum++;
        colNum = 0;
    }
}

function generateAnswer()
{
    $.ajax({url: "http://okumahizi.stratek.com.tr/Kelimeler?tur=5"}).done(function( data )
    {
        answer = data;
        alreadyPlayed();
        document.cookie = answer.kelimeler[0].kelime;
    });
}

function invalidWordEntered()
{
    alert("Hatalı Kelime Girildi");
}

function getWord(row)
{
    var foundWord = "";
    var col = 0;
    for(var i = 0; i < 5; i++)
    {
        var letterId = col + (5 * row);
        foundWord += document.getElementById(letterId).innerText;
        col++;
    }
    foundWord = foundWord.toLocaleLowerCase();
    return foundWord;
}

function validWord(foundWord)
{
    $.ajax({url: "https://sozluk.gov.tr/gts?ara="+foundWord}).done(function( data )
    {
        var obj = jQuery.parseJSON(data);
        console.log(obj.error);
        if(obj.error == undefined)
            validWordEntered();
        else
            invalidWordEntered();       
    });
}

function colorLetters(foundWord, row)
{
    var seachedWord = answer.kelimeler[0].kelime;
    var sLetter = "";
    var squareId = 0;
    var counter = 0;

    for(var i = 0; i < foundWord.length; i++)
    { 
        sLetter = foundWord.charAt(i);
        if(seachedWord.charAt(i) == foundWord.charAt(i))
        {
            squareId = i + (5 * row);
            document.getElementById(squareId).classList.add('found');
            document.getElementById(sLetter).classList.add('found');
            document.getElementById(sLetter).classList.remove('wrongSpace');
            foundWord = foundWord.substring(0,i)+','+foundWord.substring(i+1);
            seachedWord = seachedWord.substring(0,i)+'.'+seachedWord.substring(i+1);
            counter++;
            if(counter == 5)
                return true;
        }
    }

    for(var i = 0; i < foundWord.length; i++)
    {
        sLetter = foundWord.charAt(i);
        if(seachedWord.search(sLetter) != -1 && foundWord.search(sLetter) != -1 && sLetter != ",")
        {
            squareId = i + (5 * row);
            document.getElementById(squareId).classList.add('wrongSpace');
            document.getElementById(sLetter).classList.add('wrongSpace');
            seachedWord = seachedWord.replace(foundWord.charAt(i),'.');
            console.log(seachedWord);
        }
    }

    for(var i = 0; i < foundWord.length; i++)
    {
        sLetter = foundWord.charAt(i);
        if(seachedWord.search(sLetter) == -1 && foundWord.search(sLetter) != -1 && sLetter != ",")
        {
            squareId = i + (5 * row);
            document.getElementById(squareId).classList.add('notFound');
            document.getElementById(sLetter).classList.add('notFound');
        }
    }
    return false;
}

function createKeyboard()
{
    generateAnswer();
    var s = "";
    for(var i = 0; i < keyboardButtons.length; i++)
    {
        s += '<div class="keyboardRow" id="keyBoard">';
        for(var j = 0; j < keyboardButtons[i].length; j++)
        {
            if(keyboardButtons[i][j] == 'enter' || keyboardButtons[i][j] == 'del')
            {
                s += '<button onclick="buttonPress(\''+keyboardButtons[i][j]+'\')" id="'+ keyboardButtons[i][j] +'" class="wideButton">'+ keyboardButtons[i][j] +'</button>';
            }
            else if(keyboardButtons[i][j] == 'spacerHalf')
            {
                s += '<div class="'+ keyboardButtons[i][j] +'"></div>';
            }
            else
            {
                s += '<button onclick="buttonPress(\''+keyboardButtons[i][j]+'\')" id="'+ keyboardButtons[i][j] +'">'+ keyboardButtons[i][j] +'</button>';
            }
        }
        s += '</div>';
    }
    document.getElementById("keyBoardContainer").innerHTML = s;
}

function createSquares()
{
    var s = "";
    for(var i = 0; i < 30; i++)
    {
        s += '<div class="square" id="'+ i +'"></div>';
    }
    document.getElementById("board").innerHTML = s;
}

function buttonPress(letter)
{
    var square;
    if(letter == 'enter')
    {
        squareNum = colNum + (5 * rowNum);
        
        if(colNum == 5)
        {
            validWord(getWord(rowNum))
        }
    }
    else if(letter == 'del')
    {
        squareNum = colNum + (5 * rowNum);
        if(colNum != 0)
        {
            var square = document.getElementById(squareNum - 1);
            square.innerText = "";
            colNum--;
        }
    }
    else
    {
        squareNum = colNum + (5 * rowNum);
        if(colNum != 5)
        {
            var square = document.getElementById(squareNum);
            square.innerText = letter;
            colNum++;
        }
    }
}