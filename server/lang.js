Meteor.startup(
  function(){
    var add = function(word, fr, en, de) {
      if ((Lang.find({word: word})).count() > 0) {
        return console.log('BootstrapLang: word already added: ' + word);
      }
      else{
        return Lang.insert({
          word: word,
          fr: fr,
          en: en,
          de: de
        });
      }
    };
    Lang.remove({});

    add('About', 'A propos', 'About', 'Über');
    add('Activities', 'Activités', 'Activities', 'Aktivitäten');
    add('Activity1',
      'Trouver l\'arête',
      'Find the edge',
      'Find the edge'
      );
    add('Activity1Desc',
      'Vous devrez identitifier des arêtes dans les différentes vues orthographiques.',
      'Here you will try to identitify edges on the orthographics views.',
      'Here you will try to identitify edges on the orthographics views.'
      );
    add('Activity2',
      'Placement',
      'Find the placement',
      'Find the placement'
      );
    add('Activity2Desc',
      'Vous devrez reproduire le placement correspondant au vues de face et de côté.',
      'You will need to reproduce the placement according to the front and side views.',
      'You will need to reproduce the placement according to the front and side views.'
      );
    add('Activity3',
      'Déplacement',
      'Find the movement',
      'Find the movement'
      );
    add('Activity3Desc',
      'Vous devrez reproduire le déplacement correspondant au vues de face et de côté.',
      'You will need to reproduce the movement according to the front and side views.',
      'You will need to reproduce the movement according to the front and side views.'
      );
    add('Activity4',
      'Activité de coupe',
      'Cut activity',
      'Cut activity'
      );
    add('Activity4Desc',
      'Vous devrez créer des plans de coupes correspondant à un objet 3D.',
      'You will need to create cutting plans according to a 3D object.',
      'You will need to create cutting plans according to a 3D object.'
      );
    add('ActivityInfo', 'Ici vous pouvez simplement bouger vos objets sur la zone de travail pour vérifier que l\'interface est correctement installée.',
      'Here you can simply try to put the shapes you build before and move them on the workspace to see everything is working fine.',
      'Here you can simply try to put the shapes you build before and move them on the workspace to see everything is working fine.');
    add('Axis', 'Axes', 'Axis', 'Axis');

    add('BlueRectangle', 'Rectangle bleu', 'Blue rectangle', 'Blue rectangle');

    add('CameraAngle', 'Angle de la caméra', 'Camera angle', 'Camera angle');
    add('CameraDistance', 'Distance de la caméra', 'Camera distance', 'Camera distance');
    add('CornersVisibility', 'Visibilité des coins (rouge signifie mauvais et vert signifie bon)',
      'Corners visibility (red means bad, green means OK)',
      'Corners visibility (red means bad, green means OK)');
    add('Correct', 'Correct!', 'Correct!', 'Correct!');

    add('Details', 'Détails', 'Details', 'Details');
    add('Detected', 'Détecté', 'Detected', 'Detected');

    add('Errors', 'erreur(s)', 'error(s)', 'error(s)');

    add('Feedback', 'Feedback', 'Feedback', 'Feedback');
    add('FrontView', 'Vue de face', 'Front view', 'Front View');

    add('Home', 'Home', 'Home', 'Home');

    add('Level', 'Niveau', 'Level', 'Level');
    add('Loading', 'Chargement...', 'Loading...', 'Loading...');

    add('NewChallenge', 'Nouveau challenge', 'New challenge', 'New challenge');
    add('NumEdges', 'Nombre d\'arêtes', 'Number of edges', 'Number of edges');
    add('NumObjects', 'Nombre d\'objects', 'Number of objects', 'Number of objects');

    add('Object', 'Objet', 'Object', 'Object');

    add('PerspectiveView', 'Vue en perspective', 'Perspective view', 'Perspective view');
    add('Position', 'Position', 'Position', 'Position');

    add('Recalibrate', '<b>Attention: </b>Votre caméra ou votre zone de travail a bougé!<br>Essayez de <a id="calibrationButton" href="#calibration" data-toggle="modal" style="margin-top: 10px;">recalibrer</a>.<button class="close">&times;</button>',
        '<b>Warning: </b>Your camera or workspace may have moved!<br>Try to <a id="calibrationButton" href="#calibration" data-toggle="modal" style="margin-top: 10px;">recalibrate</a>.<button class="close">&times;</button>',
        '<b>Warning: </b>Your camera or workspace may have moved!<br>Try to <a id="calibrationButton" href="#calibration" data-toggle="modal" style="margin-top: 10px;">recalibrate</a>.<button class="close">&times;</button>'
        );
    add('RedRectangle', 'Rectangle rouge', 'Red rectangle', 'Red rectangle');
    add('Rotation', 'Rotation', 'Rotation', 'Rotation');

    add('SideView', 'Vue de côté', 'Side view', 'Side view');

    add('TopView', 'Vue en plan', 'Top view', 'Top view');
    add('Transparency', 'Transparence', 'Transparency', 'Transparency');

    add('Wrong', 'Faux!', 'Wrong!','Wrong!');
  }
);
