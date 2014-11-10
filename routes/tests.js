/**
 * Created by tinhonng on 11/1/14.
 */

var express = require('express');
var router = express.Router();
this.mongoose = require('mongoose');
this.mongoose.connect('mongodb://localhost/test');
console.log('Connection to MongoDB');
var TestModel = this.mongoose.model('Test', {
    description: String,
    questionSet: []
});


router.post('/', function(req, res){
    console.log(req.body);
    (new TestModel(req.body)).save(function(err, results){
       if(err){
           console.log(err);
           res.status(500).json({details: results});
       }
       else{
           console.log(results);
           res.status(200).json(results);
       }
    });
    //res.status(200).json({detail: "ok"});
});

router.get('/', function (req, res){
   TestModel.find(function (err, results){
       if(err){
           console.log(err);
           res.status(500).json({details:results});
       }
       else{
           console.log(results);
           res.status(200).json(results);
       }
   });
});


//I need another get for calculation
router.get('/:id', function(req, res){
    //console.log(req.params.id);
    TestModel.find({_id: req.params.id}, function(err, results){
            if(err){
                console.log(err);
                res.status(500).json({details:results});
            }
            else{
                console.log(results);
                res.status(200).json(results);
    }});
});

//I need another get for calculation
router.post('/test_submit', function(req, res){
    var total = 0;
    var correct = 0;
    var userAnsSet = req.body.ansSet;
    for(var ans in userAnsSet){
        total++;
    }

    TestModel.find({_id: req.body._id}, function(err, results){
        if(err){
            console.log(err);
            res.status(500).json({details:results});
        }
        else{
            results[0].questionSet.forEach(function(ele){
                if(ele.answer === userAnsSet[ele.questionId])
                    correct++;
            });
            console.log("Score is " + correct + "/" + total);
            res.status(200).json({scoretext: "Your score is " + correct + "/" + total});
        }});
});




module.exports = router;

