var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var common = require('./common');
var DailyAnswer = require('../modules/Answer').DailyAnswer;
var PeriodicAnswer = require('../modules/Answer').PeriodicAnswer;


var getDate = function (timestamp) {
    date = new Date(timestamp).toISOString();
    date_string = date.slice(0, 10) + ' ' + date.slice(-13, -8)
    return date_string;
};

var getScore = function (QuestionnaireID, Answers) {
    var score=0;
    switch(QuestionnaireID){
        case "1":
            Answers.forEach(function(answer){
                if(answer.AnswerID.length==1) {
                    score = score + answer.AnswerID[0];
                }
                else{
                    /*TODO */
                }
            });
            score = score*2;
    }
    return score;
};

router.get('/getLastDaily', function(req, res, next){
    /*TODO: change userid to token*/
    let userid = "111111111";
    DailyAnswer.findOne({UserID:  userid}).sort({ ValidDate: -1 }).exec(function (err, docs) {
            common(res, err, err, docs.ValidDate);
    });
});

router.get('/getDailyAnswers/:userID', function (req, res, next) {
    if (typeof (req.query.start_time) == 'undefined') {
        req.query.start_time = 0;
        req.query.end_time = (new Date).getTime();
    }
    DailyAnswer.find({
            UserID: req.params.userID,
            QuestionnaireID: 0,
            ValidDate: {$gte: req.query.start_time, $lte: req.query.end_time}
        }
        , (function (err, docs) {
            common(res, err, err, docs);
        }));
});

router.get('/getPeriodicAnswers/:userID/:QuestionnaireID', function (req, res, next) {
    if (typeof (req.query.start_time) == 'undefined') {
        req.query.start_time = 0;
        req.query.end_time = (new Date).getTime();
    }
    var ansArr=[];
    PeriodicAnswer.find({
            UserID: req.params.userID,
            QuestionnaireID: req.params.QuestionnaireID,
            ValidDate: {$gte: req.query.start_time, $lte: req.query.end_time}
        }
        , (function (err, docs) {
            docs.forEach(function(answer){
                ansArr.push(docs.Score,docs.ValidDate)
            })
        }));
    common(res, null, null, ansArr);
});

/* POST answers to daily */
router.post('/sendAnswers/:QuestionnaireID', function (req, res, next) {
    if(req.params.QuestionnaireID==0) {
        var newAnswer = new DailyAnswer({
            /*TODO: change UserID to token*/
            UserID: "111111111",
            Timestamp: (new Date).getTime(),
            ValidDate: req.body.ValidDate,
            QuestionnaireID: req.params.QuestionnaireID,
            Answers: req.body.Answers
        });
    }
    else{
        var newAnswer = new PeriodicAnswer({
            /*TODO: change UserID to token*/
            UserID: "111111111",
            Timestamp: (new Date).getTime(),
            ValidDate: req.body.ValidDate,
            QuestionnaireID: req.params.QuestionnaireID,
            Answers: req.body.Answers,
            Score: getScore(req.params.QuestionnaireID, req.body.Answers)
        });
    }
    newAnswer.save(function (error) {
        common(res, error, error, newAnswer);
    });
});


module.exports = router;