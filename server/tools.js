Meteor.startup(
  function(){
    var addTool = function(id, markers, secondary_markers,extra_info){
      if ((Tools.find({id: id})).count() == 0) {
        return Tools.insert({
          id: id,
          markers: markers,
          secondary_markers: secondary_markers,
          extra_info: extra_info
        });
      }
    };
    addTool(
      83,
      [
        41,42
      ],
      /*Issue: it should be not null*/
      [40,43,45,39,38],
      {rotationMarkerZ:75,
       //Range distance 38 - 39
       minDistance:40,
       maxDistance:150
    }
     );

  }
);