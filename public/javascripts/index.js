/**
 * Created by tinhonng on 10/31/14.
 */
var testObj = {description: "", questionSet: []};
var answers = {_id: "", ansSet: {}};
var num = 0;
document.getElementById('add_btn').addEventListener('click', function(){
    var aDiv = document.createElement('div');
    aDiv.className = "a_question";
    aDiv.setAttribute('data-id', num.toString());
    var aTestArea = document.createElement('textarea');
    aTestArea.setAttribute('placeholder', 'question');
    aTestArea.setAttribute('rows', '5');
    aTestArea.setAttribute('cols', '30');
    var anAnsInput = document.createElement('input');
    anAnsInput.setAttribute('placeholder', 'answer');
    anAnsInput.setAttribute('type', 'text');
    var anOption1 = document.createElement('input');
    anOption1.setAttribute('placeholder', 'option1');
    anOption1.setAttribute('type', 'text');
    var anOption2 = document.createElement('input');
    anOption2.setAttribute('placeholder', 'option2');
    anOption2.setAttribute('type', 'text');
    var anOption3 = document.createElement('input');
    anOption3.setAttribute('placeholder', 'option3');
    anOption3.setAttribute('type', 'text');
    aDiv.appendChild(aTestArea);
    aDiv.appendChild(anAnsInput);
    aDiv.appendChild(anOption1);
    aDiv.appendChild(anOption2);
    aDiv.appendChild(anOption3);
    document.getElementsByName('form_test')[0].appendChild(aDiv);
    num++;
});
document.getElementsByClassName('submit_btn')[0].addEventListener('click', function(){
    parseInput();
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/tests');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.addEventListener('readystatechange', function(){
       if(xhr.status === 200 && xhr.readyState === 4){
           var data = JSON.parse(xhr.responseText);
       }
    });
    xhr.send(JSON.stringify(testObj));
    reset();
});

function reset(){
    testObj['questionSet'] = [];
    num = 0;
}

function parseInput(){
   // document.getElementsByClassName('a_question').forEach(function(element){ why not working
   var aQuestionArr = document.getElementsByClassName('a_question');
   for(var i = 0; i < aQuestionArr.length; i++) {
       var questionNum = aQuestionArr[i].dataset.id;
       var children = aQuestionArr[i].childNodes;
       var questionText = children[0].value; // why it goes 1,3,5,7,9
       var answerText = children[1].value;
       var option1Text = children[2].value;
       var option2Text = children[3].value;
       var option3text = children[4].value;
       var anNewQuestionObj = {
           questionId: questionNum,
           question: questionText,
           answer: answerText,
           option1: option1Text,
           option2: option2Text,
           option3: option3text
       };
   testObj['description'] = document.getElementById('description').value;
   testObj['questionSet'].push(anNewQuestionObj);
   }
}

document.getElementById('show_test').addEventListener('click', function(){
   document.getElementById('create_test_container').style.display = 'none';
   document.getElementById('show_test_container').style.display = 'block';
   document.getElementById('take_test_container').style.display = 'none';
   var xhr = new XMLHttpRequest();
   xhr.open('GET', '/tests');
   xhr.setRequestHeader('Content-Type', 'application/json');
   xhr.addEventListener('readystatechange', function(){
       if(xhr.status === 200 && xhr.readyState === 4){
           var data = JSON.parse(xhr.responseText);
           var show_test_div = document.getElementById('show_test_container');
           show_test_div.innerHTML = '';

           for(var j = 0; j < data.length; j++){
               var testDiv = document.createElement('div');
               testDiv.setAttribute('data-object_id', data[j]._id);
               testDiv.className = 'test_item';
               testDiv.innerHTML = "<a>" + data[j].description + "</a>";
               if(data[j].questionSet.length !== 0)
                   show_test_div.appendChild(testDiv);
               testDiv.addEventListener('click', function(){
                   document.getElementById('show_test_container').style.display = 'none';
                   var take_test_div = document.getElementById('take_test_container');
                   take_test_div.style.display = 'block';
                   take_test_div.innerHTML = '';
                   var xhrr = new XMLHttpRequest();
                   xhrr.open('GET', '/tests/' + this.dataset.object_id);//trying to go parent by it doesn't work
                   xhrr.addEventListener('readystatechange', function(){
                        if(xhrr.status === 200 && xhrr.readyState === 4) {
                            var data = JSON.parse(xhrr.responseText);
                            drawTest(data[0]._id, data[0].description, data[0].questionSet);
                        }
                   });
                   xhrr.send();
               });
           }
       }
   });
   xhr.send();
});


function drawTest(_id, description, questionSet){
    var container = document.createElement('div');
    var title = document.createElement('div');
    title.innerHTML = "<h1>" + description + "</h1>";
    container.appendChild(title);
    for(var i = 0; i < questionSet.length; i++){
        var questionId = questionSet[i].questionId;
        var aQuestionDiv = document.createElement('div');
        aQuestionDiv.className = "aQuestion";
        var question = document.createElement('div');
        question.className = 'question';
        question.innerHTML = questionSet[i].questionId + ". " + questionSet[i].question;
        var optionSet = [];
        optionSet.push(questionSet[i].answer);
        optionSet.push(questionSet[i].option1);
        optionSet.push(questionSet[i].option2);
        optionSet.push(questionSet[i].option3);

        aQuestionDiv.appendChild(question);
        container.appendChild(aQuestionDiv);
        optionSet = shuffle(optionSet);
        optionSet.forEach(function(ele){
            var optionRad = createRadio(ele, questionId);
            var optionLabel = createLabel(ele);
            aQuestionDiv.appendChild(optionRad);
            aQuestionDiv.appendChild(optionLabel);
        })

    }
    var finishButton = document.createElement('button');
    finishButton.className = 'finish_btn';
    finishButton.addEventListener('click', function(event){
       var xhr1 = new XMLHttpRequest();
       xhr1.open('POST', '/tests/test_submit');
       xhr1.setRequestHeader('Content-Type', 'application/json');
       xhr1.addEventListener('readystatechange', function(){
           if(xhr1.status === 200 && xhr1.readyState === 4){
               var data = JSON.parse(xhr1.responseText);
               document.getElementById('take_test_container').innerHTML = '';
               var scoreDiv = document.createElement('div');
               scoreDiv.setAttribute('id', 'score');
               scoreDiv.innerHTML = data.scoretext;
               document.getElementById('take_test_container').appendChild(scoreDiv);
           }
       });
        answers['_id'] = _id;
        xhr1.send(JSON.stringify(answers));

    });
    finishButton.innerHTML = "finish";
    container.appendChild(finishButton);
    document.getElementById('take_test_container').appendChild(container);
    answers = {_id: "", ansSet: {}};


}

function shuffle(cards){
    for(var j = 0; j < cards.length; j++)
    {
        var num = Math.round(Math.random() * (cards.length - 1));
        var temp = cards[j];
        cards[j] = cards[num];
        cards[num] = temp;
    }
    return cards;
}

function createRadio(optionVal, questionId){
    var optionRad = document.createElement('input');
    optionRad.setAttribute('name', questionId);
    optionRad.setAttribute('type', 'radio');
    optionRad.setAttribute('value', optionVal);
    optionRad.className = 'questionRad';
    optionRad.addEventListener('click', function(event){
        var key = event.target.name;
        var val = event.target.value;
        answers.ansSet[key] = val;
    });
    return optionRad;
}
function createLabel(optionVal){
    var optionLabel = document.createElement('label');
    optionLabel.innerHTML = optionVal + "<br>";
    return optionLabel;
}

/*var radClassArr = document.getElementsByClassName('questionRad');
 console.log(radClassArr.length);
 for(var k = 0; k < radClassArr.length; k++){
 console.log('hello first');
 radClassArr[k].addEventListener('click', function(event){
 console.log(event.target);
 console.log(this);
 console.log('hello');
 })
 }*/
// doesn't work


document.getElementById('create_test').addEventListener('click', function(){
    document.getElementById('create_test_container').style.display = 'block';
    document.getElementById('show_test_container').style.display = 'none';
    document.getElementById('take_test_container').style.display = 'none';
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/tests');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.addEventListener('readystatechange', function(){
        if(xhr.status === 200 && xhr.readyState === 4){
            var data = JSON.parse(xhr.responseText);
        }
    });
    xhr.send();
});





