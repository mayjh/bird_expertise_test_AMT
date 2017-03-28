/**
 * jspsych-survey
 * a jspsych plugin for creating survey items in the format of text, radio, radio-table, and likert
 *
 * Jianhong Shen
 *
 * documentation: docs.jspsych.org
 *
 */

(function($) {
  jsPsych['survey'] = (function() {

    var plugin = {};

    plugin.create = function(params) {

      //params = jsPsych.pluginAPI.enforceArray(params, ['data']);

      var trials = [];
      for (var i = 0; i < params.questions.length; i++) {
        trials.push({
          //type: params.type[i],
          preamble: params.preamble[i],
          qtypes: params.qtypes[i],
          questions: params.questions[i],
          labels: params.labels[i],
          intervals: params.intervals[i],
          required: (params.required[i] == 'undefined')? "":params.required[i],
          show_ticks: (typeof params.show_ticks === 'undefined') ? true : params.show_ticks[i],
          tablehead: params.tablehead[i],
          rowname: params.rowname[i],
          hide: params.hide[i],
          events: params.events[i],
          idi: params.idi[i],
        });
      }
      return trials;
    };

    plugin.trial = function(display_element, trial) {

      // if any trial variables are functions
      // this evaluates the function and replaces
      // it with the output of the function
      trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);
      trial.id = [];

      // add questions one by one, based on questiontypes
      for (var i = 0; i < trial.questions.length; i++) {

        trial.required[i] = (trial.required[i]=="required")? "required":"";
        trial.hide[i] = (trial.hide[i] == "hide")? "hide":"";
        trial.events[i] = (trial.events[i] == undefined)? "":trial.events[i];
        var asteriski = (trial.required[i]=="required")? "<em>*</em>":"";
        // show preamble text
        if ( trial.preamble[i] != undefined && trial.preamble[i] != "") {
            display_element.append('<p class = "jspsych-survey-preamble ' + trial.hide[i] + '">'+trial.preamble[i]+'</p>');
        }

        switch (trial.qtypes[i]) {
          case "radio":
              var idi = (trial.idi[i]==undefined)? ('jspsych-survey-radio-' + i):trial.idi[i];
              // create div
              display_element.append($('<div>', {
                "id": idi,
                "class": 'jspsych-survey-radio-question ' + trial.hide[i]
              }));

              // add question text
              $("#" + idi).append('<p class="jspsych-survey-radio-text survey-radio ' + trial.required[i] + '">' + trial.questions[i] + '&nbsp;' + asteriski + '</p>');

              for (var j = 0; j < trial.labels[i].length; j++) {
              // add radio buttons
              $('#' + idi).append('&nbsp;&nbsp;&nbsp;<input type = "radio" name = "' + idi + '" id="jspsych-survey-radio-' + i + j + '" value="' + trial.labels[i][j] + '" ' + trial.events[i] + trial.required[i]+'>' );
              $('#' + idi).append('<label for="jspsych-survey-radio-' + i + j + '">' + trial.labels[i][j] + '</label>' );
              }
              trial.id[i] = idi;
              break;

          case "text":
          case "number":
          case "email":
              // create div
              display_element.append($('<div>', {
                "id": 'jspsych-survey-text-' + i,
                "class": 'jspsych-survey-text-question ' + trial.hide[i]
              }));

              // add question text
              $("#jspsych-survey-text-" + i).append('<span class="jspsych-survey-text survey-text ' + trial.required[i] + '">' + trial.questions[i] + '</span>&nbsp;&nbsp;&nbsp;');

              // add text box
              $("#jspsych-survey-text-" + i).append('<input type="'+trial.qtypes[i]+'" name="#jspsych-survey-text-response-' + i + '" ' + trial.events[i] + trial.required[i] + '>&nbsp;' + asteriski );
              trial.id[i] = 'jspsych-survey-text-' + i;
              break;


          case "radio-table":
            // create div
            display_element.append($('<table>', {
              "id": 'jspsych-survey-radio-' + i,
              "class": 'jspsych-survey-radio-table ' + trial.hide[i],
              "css": {"text-align": "left","vertical-align": "bottom"}
            }));

            // add table heads if there is one
            if (trial.tablehead[i]!=undefined && trial.tablehead[i]!=""){
              $("#jspsych-survey-radio-" + i).append($('<tr>',{"id": 'jspsych-survey-radio-tablehead' + i}));
              for (var j = 0; j < trial.tablehead[i].length; j++) {
                if (j==0) {
                  $('#jspsych-survey-radio-tablehead' + i).append('<td class="jspsych-survey-radio-table-qtext">' + trial.tablehead[i][j] + '</td>' );
                } else {
                  $('#jspsych-survey-radio-tablehead' + i).append('<td class="jspsych-survey-radio-table-text">' + trial.tablehead[i][j] + '</td>' );
                }
              }
            }
            // add radio buttons
            $("#jspsych-survey-radio-" + i).append($('<tr>',{"id": 'jspsych-survey-radio-table' + i}));
            $('#jspsych-survey-radio-table' + i).append('<td class="jspsych-survey-radio-table-qtext ' + trial.required[i] + '" '+trial.required[i]+'>'+trial.rowname[i] + '&nbsp;' + asteriski + '</td>');
            for (var j = 0; j < trial.intervals[i]; j++) {
              $('#jspsych-survey-radio-table' + i).append('<td class="jspsych-survey-radio-table-text"><input type = "radio" name = "jspsych-survey-radio-' + i + '" id="jspsych-survey-radio-' + i + j + '" value="' + j + '"></td>' );
            }
            trial.id[i] = 'jspsych-survey-radio-' + i;
          break;

          case "likert":
              // create div
              display_element.append($('<div>', {
                "id": 'jspsych-survey-likert-' + i,
                "class": 'jspsych-survey-likert-question ' + trial.hide[i]
              }));

              // add question text
              $("#jspsych-survey-likert-" + i).append('<p class="jspsych-survey-likert-text survey-likert ' + trial.required[i] + '" '+trial.required[i]+'>' + trial.questions[i] + '&nbsp;' + asteriski +'</p>');

              // create slider
              $("#jspsych-survey-likert-" + i).append($('<div>', {
                "id": 'jspsych-survey-likert-slider-' + i,
                "class": 'jspsych-survey-likert-slider jspsych-survey-likert'
              }));
              $("#jspsych-survey-likert-slider-" + i).slider({
                value: Math.ceil(trial.intervals[i] / 2),
                min: 1,
                max: trial.intervals[i],
                step: 1
              });

              // show tick marks
              if (trial.show_ticks) {
                $("#jspsych-survey-likert-" + i).append($('<div>', {
                  "id": 'jspsych-survey-likert-sliderticks' + i,
                  "class": 'jspsych-survey-likert-sliderticks jspsych-survey-likert',
                  "css": {
                    "position": 'relative'
                  }
                }));
                for (var j = 1; j < trial.intervals[i] - 1; j++) {
                  $('#jspsych-survey-likert-slider-' + i).append('<div class="jspsych-survey-likert-slidertickmark"></div>');
                }

                $('#jspsych-survey-likert-slider-' + i + ' .jspsych-survey-likert-slidertickmark').each(function(index) {
                  var left = (index + 1) * (100 / (trial.intervals[i] - 1));
                  $(this).css({
                    'position': 'absolute',
                    'left': left + '%',
                    'width': '1px',
                    'height': '100%',
                    'background-color': '#222222'
                  });
                });
              }

              // create labels for slider
              $("#jspsych-survey-likert-" + i).append($('<ul>', {
                "id": "jspsych-survey-likert-sliderlabels-" + i,
                "class": 'jspsych-survey-likert-sliderlabels survey-likert',
                "css": {
                  "width": "100%",
                  "margin": "10px 0px 0px 0px",
                  "padding": "0px",
                  "display": "inline-block",
                  "position": "relative",
                  "height": "2em"
                }
              }));

              for (var j = 0; j < trial.labels[i].length; j++) {
                $("#jspsych-survey-likert-sliderlabels-" + i).append('<li>' + trial.labels[i][j] + '</li>');
              }

              // position labels to match slider intervals
              var slider_width = $("#jspsych-survey-likert-slider-" + i).width();
              var num_items = trial.labels[i].length;
              var item_width = slider_width / num_items;
              var spacing_interval = slider_width / (num_items - 1);

              $("#jspsych-survey-likert-sliderlabels-" + i + " li").each(function(index) {
                $(this).css({
                  'display': 'inline-block',
                  'width': item_width + 'px',
                  'margin': '0px',
                  'padding': '0px',
                  'text-align': 'center',
                  'position': 'absolute',
                  'left': (spacing_interval * index) - (item_width / 2)
                });
              });
              trial.id[i] = 'jspsych-survey-likert-slider-' + i;
              break;
          }

        }

      // add submit button
      display_element.append('<button type="button" id="jspsych-survey-likert-next" > </button>');
      $("#jspsych-survey-likert-next").append('<span id="jspsych-survey-likert-next-text"> Submit Answers </span>');
      $("#jspsych-survey-likert-next-text").css({'color': '#A4A4A4',"pointer-events": "none"});

      // when enter the submit element, alert until all required fields are answered
      $("#jspsych-survey-likert-next").mouseenter(function() {
        var nempty = 0;
        $('.required').each(function() {
            var qid = $(this).parent().attr('id');
            if (qid.indexOf("radio") >= 0 ) {
              var vali = $("input[name="+qid+"]:checked").val();
            } else if (qid.indexOf("text") >= 0 ) {
              var vali = $("#"+qid).children('input').val();
            } else {
              var vali = 1;
            }

            if ( ( vali == '') || ( vali == undefined)) {
              $(this).css({"background-color": "yellow"});
              nempty++;
            }
            else { $(this).css({"background-color": "white"}); }
          });
          if (nempty == 0) {
            $('#jspsych-survey-likert-next-text').css({'color': 'black',"pointer-events": "auto"});
          }
          else {
            alert("Oops, seems some of the required fields slipped your attention. Please fill them before continuing.");
          }

      });
      $("#jspsych-survey-likert-next").click(function() {

          // measure response time
          var endTime = (new Date()).getTime();
          var response_time = endTime - startTime;
          // create object to hold responses
          var question_data = {};

          for (var i = 0; i < trial.questions.length; i++)  {
            var id = trial.id[i];
            switch (trial.qtypes[i]) {
              case "radio":
              case "radio-table":
                var val = $('input[name="'+id+'"]:checked').val();
                break;
              case "text":
              case "number":
              case "email":
                var val = $("#"+id).children('input').val();
                break;
              case "likert":
                var val = $("#"+id).slider("value");
                break;
            }
            var obje = {};
            obje[id] = val;
            $.extend(question_data, obje);
          }

        // after all values received, save data
        jsPsych.data.write({
          "rt": response_time,
          "responses": JSON.stringify(question_data)
        });

        display_element.html('');

        // next trial
        jsPsych.finishTrial();
      });

      var startTime = (new Date()).getTime();
    };

    return plugin;
  })();
})(jQuery);
