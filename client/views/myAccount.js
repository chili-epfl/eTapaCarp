Template.myAccount.lang = function(e){
  return Session.get('lang');
}

Template.myAccount.resized = function(e){
	return Session.get('resized');
}

Template.myAccount.scores1 = function(){
	var scores1 = Score.find({activity:"activity1", userId: Meteor.userId()},{sort:{date:1}});
	var values = [];
	scores1.forEach( function(score){
		values.push(score);
	});
	Session.set('scores1',values);
	return scores1.count();
}

Template.myAccount.scores2 = function(){
	var scores2 = Score.find({activity:"activity2", userId: Meteor.userId()},{sort:{date:1}});
	var values = [];
	scores2.forEach( function(score){
		values.push(score);
	});
	Session.set('scores2',values);
	return scores2.count();
}

Date.prototype.sameDateAs = function(pDate){
return ((this.getFullYear()==pDate.getFullYear())&&(this.getMonth()==pDate.getMonth())&&(this.getDate()==pDate.getDate()));
}

var rendered = false;
Template.myAccount.rendered = function(){
	var scores1 = Session.get('scores1');
	var scores2 = Session.get('scores2');
	var activity11Scores = [[],0];
	var activity12Scores = [[],0];
	var activity13Scores = [[],0];
	var activity11Shape6 = [[],0];
	var activity12Shape6 = [[],0];
	var activity13Shape6 = [[],0];
	var activity11Shape20 = [[],0];
	var activity12Shape20 = [[],0];
	var activity13Shape20 = [[],0];
	var activity11Shape64 = [[],0];
	var activity12Shape64 = [[],0];
	var activity13Shape64 = [[],0];
	var activity1activity = [];
	var activity21Scores = [[],0];
	var activity22Scores = [[],0];
	var activity23Scores = [[],0];
	var activity21Shape6 = [[],0];
	var activity22Shape6 = [[],0];
	var activity23Shape6 = [[],0];
	var activity21Shape20 = [[],0];
	var activity22Shape20 = [[],0];
	var activity23Shape20 = [[],0];
	var activity21Shape64 = [[],0];
	var activity22Shape64 = [[],0];
	var activity23Shape64 = [[],0];
	var activity2activity = [];
	var lastDate = [null,0];
	for (var i in scores1){
		var score = scores1[i];
		if(lastDate[0] == null){
			lastDate[0] = score.date;
		}
		if (!score.date.sameDateAs(lastDate[0])){
			var oldDate = new Date(lastDate[0].getFullYear(),lastDate[0].getMonth(),lastDate[0].getDate());
			var newDate = new Date(score.date.getFullYear(), score.date.getMonth(), score.date.getDate());
			var daysBetween = (newDate-oldDate)/1000/60/60/24;
			console.log(newDate, oldDate);
			console.log(daysBetween);
			activity1activity.push({x:oldDate.getTime(), y:lastDate[1]});
			if (daysBetween > 1){
				for (var i=1; i<daysBetween;i++){
					activity1activity.push({x:new Date(lastDate[0].getFullYear(),lastDate[0].getMonth(),lastDate[0].getDate()+i).getTime(), y:0});
				}
			}
			lastDate[0] = score.date;
			lastDate[1] = 1;
		}
		else{
			lastDate[1]++;
		}
		if (score.difficulty == 1){
			if(score.time){
				activity11Scores[0].push({x:activity11Scores[0].length, y:score.time});
				if (score.shape == 6){
					activity11Shape6[0].push({x:activity11Shape6[0].length, y:score.time});
				}
				if (score.shape == 20){
					activity11Shape20[0].push({x:activity11Shape20[0].length, y:score.time});
				}
				if (score.shape == 64){
					activity11Shape64[0].push({x:activity11Shape64[0].length, y:score.time});
				}
			}
			else{
				activity11Scores[1]++;
				if (score.shape == 6){
					activity11Shape6[1]++;
				}
				if (score.shape == 20){
					activity11Shape20[1]++;
				}
				if (score.shape == 64){
					activity11Shape64[1]++;
				}
			}
		}
		else if (score.difficulty == 2){
			if(score.time){
				activity12Scores[0].push({x:activity12Scores[0].length, y:score.time});
				if (score.shape == 6){
					activity12Shape6[0].push({x:activity12Shape6[0].length, y:score.time});
				}
				if (score.shape == 20){
					activity12Shape20[0].push({x:activity12Shape20[0].length, y:score.time});
				}
				if (score.shape == 64){
					activity12Shape64[0].push({x:activity12Shape64[0].length, y:score.time});
				}
			}
			else{
				activity12Scores[1]++;
				if (score.shape == 6){
					activity12Shape6[1]++;
				}
				if (score.shape == 20){
					activity12Shape20[1]++;
				}
				if (score.shape == 64){
					activity12Shape64[1]++;
				}
			}
		}
		else{
			if(score.time){
				activity13Scores[0].push({x:activity13Scores[0].length, y:score.time});
				if (score.shape == 6){
					activity13Shape6[0].push({x:activity13Shape6[0].length, y:score.time});
				}
				if (score.shape == 20){
					activity13Shape20[0].push({x:activity13Shape20[0].length, y:score.time});
				}
				if (score.shape == 64){
					activity13Shape64[0].push({x:activity13Shape64[0].length, y:score.time});
				}
			}
			else{
				activity13Scores[1]++;
				if (score.shape == 6){
					activity13Shape6[1]++;
				}
				if (score.shape == 20){
					activity13Shape20[1]++;
				}
				if (score.shape == 64){
					activity13Shape64[1]++;
				}
			}
		}
	}

	var oldDate = new Date(lastDate[0].getFullYear(),lastDate[0].getMonth(),lastDate[0].getDate());
	var now = new Date();
	var newDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	var daysBetween = (newDate-oldDate)/1000/60/60/24;
	activity1activity.push({x:oldDate.getTime(), y:lastDate[1]});
	if (daysBetween > 1){
		for (var i=1; i<daysBetween;i++){
			activity1activity.push({x:new Date(lastDate[0].getFullYear(),lastDate[0].getMonth(),lastDate[0].getDate()+i).getTime(), y:0});
		}
	}

	var lastDate = [null,0];
	for (var i in scores2){
		var score = scores2[i];
		if(lastDate[0] == null){
			lastDate[0] = score.date;
		}
		if (!score.date.sameDateAs(lastDate[0])){
			var oldDate = new Date(lastDate[0].getFullYear(),lastDate[0].getMonth(),lastDate[0].getDate());
			var newDate = new Date(score.date.getFullYear(), score.date.getMonth(), score.date.getDate());
			var daysBetween = (newDate-oldDate)/1000/60/60/24;
			console.log(newDate, oldDate);
			console.log(daysBetween);
			activity2activity.push({x:oldDate.getTime(), y:lastDate[1]});
			if (daysBetween > 1){
				for (var i=1; i<daysBetween;i++){
					activity2activity.push({x:new Date(lastDate[0].getFullYear(),lastDate[0].getMonth(),lastDate[0].getDate()+i).getTime(), y:0});
				}
			}
			lastDate[0] = score.date;
			lastDate[1] = 1;
		}
		else{
			lastDate[1]++;
		}
		if (score.difficulty == 1){
			if(score.time){
				activity21Scores[0].push({x:activity21Scores[0].length, y:score.time});
				if (score.shapes.indexOf(6) != -1){
					activity21Shape6[0].push({x:activity21Shape6[0].length, y:score.time});
				}
				if (score.shapes.indexOf(20) != -1){
					activity21Shape20[0].push({x:activity21Shape20[0].length, y:score.time});
				}
				if (score.shapes.indexOf(64) != -1){
					activity21Shape64[0].push({x:activity21Shape64[0].length, y:score.time});
				}
			}
			else{
				activity21Scores[1]++;
				if (score.shapes.indexOf(6) != -1){
					activity21Shape6[1]++;
				}
				if (score.shapes.indexOf(20) != -1){
					activity21Shape20[1]++;
				}
				if (score.shapes.indexOf(64) != -1){
					activity21Shape64[1]++;
				}
			}
		}
		else if (score.difficulty == 2){
			if(score.time){
				activity22Scores[0].push({x:activity22Scores[0].length, y:score.time});
				if (score.shapes.indexOf(6) != -1){
					activity22Shape6[0].push({x:activity22Shape6[0].length, y:score.time});
				}
				if (score.shapes.indexOf(20) != -1){
					activity22Shape20[0].push({x:activity22Shape20[0].length, y:score.time});
				}
				if (score.shapes.indexOf(64) != -1){
					activity22Shape64[0].push({x:activity22Shape64[0].length, y:score.time});
				}
			}
			else{
				activity22Scores[1]++;
				if (score.shapes.indexOf(6) != -1){
					activity22Shape6[1]++;
				}
				if (score.shapes.indexOf(20) != -1){
					activity22Shape20[1]++;
				}
				if (score.shapes.indexOf(64) != -1){
					activity22Shape64[1]++;
				}
			}
		}
		else{
			if(score.time){
				activity23Scores[0].push({x:activity23Scores[0].length, y:score.time});
				if (score.shapes.indexOf(6) != -1){
					activity23Shape6[0].push({x:activity23Shape6[0].length, y:score.time});
				}
				if (score.shapes.indexOf(20) != -1){
					activity23Shape20[0].push({x:activity23Shape20[0].length, y:score.time});
				}
				if (score.shapes.indexOf(64) != -1){
					activity23Shape64[0].push({x:activity23Shape64[0].length, y:score.time});
				}
			}
			else{
				activity23Scores[1]++;
				if (score.shapes.indexOf(6) != -1){
					activity23Shape6[1]++;
				}
				if (score.shapes.indexOf(20) != -1){
					activity23Shape20[1]++;
				}
				if (score.shapes.indexOf(64) != -1){
					activity23Shape64[1]++;
				}
			}
		}
	}

	var oldDate = new Date(lastDate[0].getFullYear(),lastDate[0].getMonth(),lastDate[0].getDate());
	var now = new Date();
	var newDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	var daysBetween = (newDate-oldDate)/1000/60/60/24;
	activity2activity.push({x:oldDate.getTime(), y:lastDate[1]});
	if (daysBetween > 1){
		for (var i=1; i<daysBetween;i++){
			activity2activity.push({x:new Date(lastDate[0].getFullYear(),lastDate[0].getMonth(),lastDate[0].getDate()+i).getTime(), y:0});
		}
	}

	// for (var i in results){
	// 	if (results[i][0].length == 0){
	// 		results[i][0].push({x:0,y:0});
	// 	}
	// }

    var palette = new Rickshaw.Color.Palette();

	var graph1 = new Rickshaw.Graph( {
	        element: document.querySelector("#chart-1"),
	        renderer: 'lineplot',
	        // interpolation: 'linear',
	        width: $('#chart-1').width(),
	        height: $('#chart-1').width()/3,
	        series: [
	        {name:Session.get('lang').ThreeEdge+" ("+activity13Scores[1]+" "+Session.get('lang').NotFinished+")", data: activity13Scores[0], color: palette.color()},
	        {name:Session.get('lang').TwoEdge+" ("+activity12Scores[1]+" "+Session.get('lang').NotFinished+")", data: activity12Scores[0], color: palette.color()},
	        {name:Session.get('lang').OneEdge+" ("+activity11Scores[1]+" "+Session.get('lang').NotFinished+")", data: activity11Scores[0], color: palette.color()}
    		]
	} );

	var graph2 = new Rickshaw.Graph({
	    element: document.querySelector("#chart-2"),
		renderer: 'lineplot',
        width: $('#chart-1').width(),
        height: $('#chart-1').width()/3,
		series: [
	        {name:"<img src=/shape64.png></img>"+Session.get('lang').ThreeEdge+" ("+activity13Shape64[1]+" "+Session.get('lang').NotFinished+")", data: activity13Shape64[0], color: palette.color()},
	        {name:"<img src=/shape20.png></img>"+Session.get('lang').ThreeEdge+" ("+activity13Shape20[1]+" "+Session.get('lang').NotFinished+")", data: activity13Shape20[0], color: palette.color()},
    		{name:"<img src=/shape6.png></img>"+Session.get('lang').ThreeEdge+" ("+activity13Shape6[1]+" "+Session.get('lang').NotFinished+")", data: activity13Shape6[0], color: palette.color()},
	        {name:"<img src=/shape64.png></img>"+Session.get('lang').TwoEdge+" ("+activity12Shape64[1]+" "+Session.get('lang').NotFinished+")", data: activity12Shape64[0], color: palette.color()},
	        {name:"<img src=/shape20.png></img>"+Session.get('lang').TwoEdge+" ("+activity12Shape20[1]+" "+Session.get('lang').NotFinished+")", data: activity12Shape20[0], color: palette.color()},
    		{name:"<img src=/shape6.png></img>"+Session.get('lang').TwoEdge+" ("+activity12Shape6[1]+" "+Session.get('lang').NotFinished+")", data: activity12Shape6[0], color: palette.color()},
	        {name:"<img src=/shape64.png></img>"+Session.get('lang').OneEdge+" ("+activity11Shape64[1]+" "+Session.get('lang').NotFinished+")", data: activity11Shape64[0], color: palette.color()},
	        {name:"<img src=/shape20.png></img>"+Session.get('lang').OneEdge+" ("+activity11Shape20[1]+" "+Session.get('lang').NotFinished+")", data: activity11Shape20[0], color: palette.color()},
    		{name:"<img src=/shape6.png></img>"+Session.get('lang').OneEdge+" ("+activity11Shape6[1]+" "+Session.get('lang').NotFinished+")", data: activity11Shape6[0], color: palette.color()}
		]
	});
	console.log(activity1activity);

	var graph3 = new Rickshaw.Graph( {
	        element: document.querySelector("#chart-3"),
	        renderer: 'bar',
	        width: $('#chart-1').width(),
	        height: $('#chart-1').width()/3,
	        series: [
	        	{name:"activity", data: activity1activity , color: palette.color()}
    		]
	} );

	var graph4 = new Rickshaw.Graph( {
        element: document.querySelector("#chart-4"),
		renderer: 'lineplot',
        width: $('#chart-4').width(),
        height: $('#chart-4').width()/3,
		series: [
    		{name:Session.get('lang').ThreeObject+" ("+activity23Scores[1]+" "+Session.get('lang').NotFinished+")", data: activity23Scores[0], color: palette.color()},
	        {name:Session.get('lang').TwoObject+" ("+activity22Scores[1]+" "+Session.get('lang').NotFinished+")", data: activity22Scores[0], color: palette.color()},
	        {name:Session.get('lang').OneObject+" ("+activity21Scores[1]+" "+Session.get('lang').NotFinished+")", data: activity21Scores[0], color: palette.color()}
		]
	} );
	
	var graph5 = new Rickshaw.Graph({
	    element: document.querySelector("#chart-5"),
		renderer: 'lineplot',
        width: $('#chart-4').width(),
        height: $('#chart-4').width()/3,
		series: [
	        {name:"<img src=/shape64.png></img>"+Session.get('lang').ThreeObject+" ("+activity23Shape64[1]+" "+Session.get('lang').NotFinished+")", data: activity23Shape64[0], color: palette.color()},
	        {name:"<img src=/shape20.png></img>"+Session.get('lang').ThreeObject+" ("+activity23Shape20[1]+" "+Session.get('lang').NotFinished+")", data: activity23Shape20[0], color: palette.color()},
    		{name:"<img src=/shape6.png></img>"+Session.get('lang').ThreeObject+" ("+activity23Shape6[1]+" "+Session.get('lang').NotFinished+")", data: activity23Shape6[0], color: palette.color()},
	        {name:"<img src=/shape64.png></img>"+Session.get('lang').TwoObject+" ("+activity22Shape64[1]+" "+Session.get('lang').NotFinished+")", data: activity22Shape64[0], color: palette.color()},
	        {name:"<img src=/shape20.png></img>"+Session.get('lang').TwoObject+" ("+activity22Shape20[1]+" "+Session.get('lang').NotFinished+")", data: activity22Shape20[0], color: palette.color()},
    		{name:"<img src=/shape6.png></img>"+Session.get('lang').TwoObject+" ("+activity22Shape6[1]+" "+Session.get('lang').NotFinished+")", data: activity22Shape6[0], color: palette.color()},
	        {name:"<img src=/shape64.png></img>"+Session.get('lang').OneObject+" ("+activity21Shape64[1]+" "+Session.get('lang').NotFinished+")", data: activity21Shape64[0], color: palette.color()},
	        {name:"<img src=/shape20.png></img>"+Session.get('lang').OneObject+" ("+activity21Shape20[1]+" "+Session.get('lang').NotFinished+")", data: activity21Shape20[0], color: palette.color()},
    		{name:"<img src=/shape6.png></img>"+Session.get('lang').OneObject+" ("+activity21Shape6[1]+" "+Session.get('lang').NotFinished+")", data: activity21Shape6[0], color: palette.color()}
		]
	});

	console.log(activity2activity);

	var graph6 = new Rickshaw.Graph( {
	        element: document.querySelector("#chart-6"),
	        renderer: 'bar',
	        width: $('#chart-4').width(),
	        height: $('#chart-4').width()/3,
	        series: [
	        	{name:"activity", data: activity2activity , color: palette.color()}
    		]
	} );

	var legend1 = new Rickshaw.Graph.Legend({
	    graph: graph1,
	    element: document.querySelector('#legend-1')
	});
	var shelving1 = new Rickshaw.Graph.Behavior.Series.Toggle({
    	graph: graph1,
    	legend: legend1
	});
	var highlighter1 = new Rickshaw.Graph.Behavior.Series.Highlight({
	    graph: graph1,
	    legend: legend1
	});
	var hoverDetail1 = new Rickshaw.Graph.HoverDetail( {
	    graph: graph1,
	    xFormatter: function(x) { return x+1; },
	    yFormatter: function(y) { return y + Session.get('lang').Sec }
	});
	var yaxis1 = new Rickshaw.Graph.Axis.Y({
		graph: graph1
	});

	function formatDate(x){
		var date = new Date();
		date.setTime(x);
		return date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear();
	}

	var legend2 = new Rickshaw.Graph.Legend({
	    graph: graph2,
	    element: document.querySelector('#legend-2')
	});
	var shelving2 = new Rickshaw.Graph.Behavior.Series.Toggle({
    	graph: graph2,
    	legend: legend2
	});
	var highlighter2 = new Rickshaw.Graph.Behavior.Series.Highlight({
	    graph: graph2,
	    legend: legend2
	});
	var hoverDetail2 = new Rickshaw.Graph.HoverDetail( {
	    graph: graph2,
	    xFormatter: function(x) { return x+1; },
	    yFormatter: function(y) { return y + Session.get('lang').Sec }
	});
	var yaxis2 = new Rickshaw.Graph.Axis.Y({
		graph: graph2
	});

	var hoverDetail3 = new Rickshaw.Graph.HoverDetail( {
	    graph: graph3,
	    xFormatter: function(x) { return formatDate(x); },
	    yFormatter: function(y) { return y + " " + Session.get('lang').ChallengesTaken }
	});
	var yaxis3 = new Rickshaw.Graph.Axis.Y({
		graph: graph3
	});

	var legend4 = new Rickshaw.Graph.Legend({
	    graph: graph4,
	    element: document.querySelector('#legend-4')
	});
	var shelving4 = new Rickshaw.Graph.Behavior.Series.Toggle({
    	graph: graph4,
    	legend: legend4
	});
	var highlighter4 = new Rickshaw.Graph.Behavior.Series.Highlight({
	    graph: graph4,
	    legend: legend4
	});
	var hoverDetail4 = new Rickshaw.Graph.HoverDetail( {
	    graph: graph4,
	    xFormatter: function(x) { return x+1; },
	    yFormatter: function(y) { return y + Session.get('lang').Sec }
	});
	var yaxis4 = new Rickshaw.Graph.Axis.Y({
		graph: graph4
	});

	var legend5 = new Rickshaw.Graph.Legend({
	    graph: graph5,
	    element: document.querySelector('#legend-5')
	});
	var shelving5 = new Rickshaw.Graph.Behavior.Series.Toggle({
    	graph: graph5,
    	legend: legend5
	});
	var highlighter5 = new Rickshaw.Graph.Behavior.Series.Highlight({
	    graph: graph5,
	    legend: legend5
	});
	var hoverDetail5 = new Rickshaw.Graph.HoverDetail( {
	    graph: graph5,
	    xFormatter: function(x) { return x+1; },
	    yFormatter: function(y) { return y + Session.get('lang').Sec }
	});
	var yaxis5 = new Rickshaw.Graph.Axis.Y({
		graph: graph5
	});

	var hoverDetail6 = new Rickshaw.Graph.HoverDetail( {
	    graph: graph6,
	    xFormatter: function(x) { return formatDate(x); },
	    yFormatter: function(y) { return y + " " + Session.get('lang').ChallengesTaken }
	});
	var yaxis1 = new Rickshaw.Graph.Axis.Y({
		graph: graph6
	});

	graph1.render();
	graph2.render();
	graph3.render();
	graph4.render();
	graph5.render();
	graph6.render();

	var slider1 = new Rickshaw.Graph.RangeSlider({
		graph: graph1,
		element: $('#slider-1')
	});
	var slider2 = new Rickshaw.Graph.RangeSlider({
		graph: graph2,
		element: $('#slider-2')
	});
	var slider3 = new Rickshaw.Graph.RangeSlider({
		graph: graph3,
		element: $('#slider-3')
	});
	var slider4 = new Rickshaw.Graph.RangeSlider({
		graph: graph4,
		element: $('#slider-4')
	});
	var slider5 = new Rickshaw.Graph.RangeSlider({
		graph: graph5,
		element: $('#slider-5')
	});
	var slider6 = new Rickshaw.Graph.RangeSlider({
		graph: graph6,
		element: $('#slider-6')
	});
	
}