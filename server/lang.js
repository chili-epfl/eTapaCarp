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
    add('Activity', 'Activité', 'Activity', 'Aktivität');
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
    add('Activity2', 'Placement', 'Find the placement', 'Find the placement');
    add('Activity2Desc','Vous devrez reproduire le placement correspondant au vues de face et de côté.',
      'You will need to reproduce the placement according to the front and side views.',
      'You will need to reproduce the placement according to the front and side views.'
      );
    add('Activity3', 'Déplacement', 'Find the movement','Find the movement');
    add('Activity3Desc','Vous devrez reproduire le déplacement correspondant au vues de face et de côté.','You will need to reproduce the movement according to the front and side views.','You will need to reproduce the movement according to the front and side views.');
    add('Activity4', 'Activité de coupe', 'Cut activity', 'Cut activity');
    add('Activity4Desc',
      'Vous devrez créer des plans de coupes correspondant à un objet 3D.',
      'You will need to create cutting plans according to a 3D object.',
      'You will need to create cutting plans according to a 3D object.'
      );
    add('ActivityInfo', 'Ici vous pouvez simplement bouger vos objets sur la zone de travail pour vérifier que l\'interface est correctement installée.',
      'Here you can simply try to put the shapes you build before and move them on the workspace to see everything is working fine.',
      'Here you can simply try to put the shapes you build before and move them on the workspace to see everything is working fine.');
    add('AddEdge', 'Ajouter une arête', 'Add an edge', 'Add an edge');
    add('AddFace', 'Ajouter une face', 'Add a face', 'Add a face');
    add('AddMarker', 'Ajouter le marker', 'Add the marker', 'Add the marker');
    add('AddPoint', 'Ajouter un point', 'Add a point', 'Add a point');
    add('Axis', 'Axes', 'Axis', 'Axis');

    add('BlueRectangle', 'Rectangle bleu', 'Blue rectangle', 'Blue rectangle');

    add('Calibration', 'Calibration', 'Calibration', 'Calibration');
    add('CameraAngle', 'Angle de la caméra', 'Camera angle', 'Camera angle');
    add('CameraDistance', 'Distance de la caméra', 'Camera distance', 'Camera distance');
    add('ChallengesTaken', 'Challenges effectués', 'Challenges taken', 'Challenges taken');
    add('Coordinates', 'Coordonnées', 'Coordinates', 'Coordinates');
    add('CornersVisibility', 'Visibilité des coins (rouge signifie mauvais et vert signifie bon)',
      'Corners visibility (red means bad, green means OK)',
      'Corners visibility (red means bad, green means OK)');
    add('Correct', 'Correct!', 'Correct!', 'Correct!');
    add('CreateAnObject', 'Créer un objet', 'Create an object', 'Create an object');

    add('Delete', 'Supprimer', 'Delete', 'Delete');
    add('Details', 'Détails', 'Details', 'Details');
    add('Detected', 'Détecté', 'Detected', 'Detected');

    add('Edges', 'Arêtes', 'Edges', 'Edges');
    add('Errors', 'erreur(s)', 'error(s)', 'error(s)');
    add('Evaluation', 'Evaluation', 'Evaluation', 'Evaluation');

    add('Faces', 'Faces', 'Faces', 'Faces');
    add('Feedback', 'Feedback', 'Feedback', 'Feedback');
    add('FileFormatError', 'Ce format de fichier n\'est pas accepté', 'This file format is not supported', 'This file format is not supported');
    add('FrontView', 'Vue de face', 'Front view', 'Front View');

    add('GetReady', 'Préparez-vous', 'Get ready', 'Get ready');

    add('Home', 'Home', 'Home', 'Home');

    add('Import', 'Importer', 'Import', 'Import');
    add('ImportFile', 'Importer un fichier', 'Import a file', 'Import a file');
    add('ImportObjectFromFile', 'Importer un object à partir d\'un fichier', 'Import an object from a file', 'Import an object from a file');
    add('InputNotValid', 'Entrée non valide', 'Input not valid', 'Input not valid');

    add('Level', 'Niveau', 'Level', 'Level');
    add('LevelDifficulty', 'Niveau de difficulté', 'Difficulty level', 'Difficulty level');
    add('LimitObject', 'Vous ne pouvez créer que 3 objets.', 'You can only create 3 objects.', 'You can only create 3 objects.');
    add('Loading', 'Chargement...', 'Loading...', 'Loading...');

    add('Manually', 'Manuellement', 'Manually', 'Manually');
    add('MyAccount', 'Mon compte', 'My account', 'My account');

    add('NewChallenge', 'Nouveau challenge', 'New challenge', 'New challenge');
    add('NoObjectDetected', 'Aucun object détecté', 'No object detected', 'No object detected');
    add('NoPlaceFound', 'Aucun endroit trouvé pour le marker', 'No place found for the marker', 'No place found for the marker');
    add('NotFinished', 'non terminé(s)', 'not finished', 'not finished');
    add('NumEdges', 'Nombre d\'arêtes', 'Number of edges', 'Number of edges');
    add('NumObjects', 'Nombre d\'objects', 'Number of objects', 'Number of objects');

    add('Object', 'Objet', 'Object', 'Object');
    add('ObjectDetected', 'Objet detecté', 'Object detected', 'Object detected');
    add('OneEdge', 'Une arête', 'One edge', 'One edge');
    add('OneObject', 'Un objet', 'One object', 'One object');

    add('PerspectiveView', 'Vue en perspective', 'Perspective view', 'Perspective view');
    add('PlaceMarker', 'Placer le marker', 'Place the marker', 'Place the marker');
    add('Points', 'Points', 'Points', 'Points');
    add('Position', 'Position', 'Position', 'Position');
    add('Practice', 'Entrainement', 'Practice', 'Practice');

    add('Recalibrate', '<b>Attention: </b>Votre caméra ou votre zone de travail a bougé!<br>Essayez de <a id="calibrationButton" href="#calibration" data-toggle="modal" style="margin-top: 10px;">recalibrer</a>.<button class="close">&times;</button>',
        '<b>Warning: </b>Your camera or workspace may have moved!<br>Try to <a id="calibrationButton" href="#calibration" data-toggle="modal" style="margin-top: 10px;">recalibrate</a>.<button class="close">&times;</button>',
        '<b>Warning: </b>Your camera or workspace may have moved!<br>Try to <a id="calibrationButton" href="#calibration" data-toggle="modal" style="margin-top: 10px;">recalibrate</a>.<button class="close">&times;</button>'
        );
    add('RedRectangle', 'Rectangle rouge', 'Red rectangle', 'Red rectangle');
    add('Rotation', 'Rotation', 'Rotation', 'Rotation');

    add('SaveObject', 'Sauvegarder l\'object', 'Save the object', 'Save the object');
    add('Sec', 'sec.', 'sec.', 'sec.');
    add('Scale', 'Echelle', 'Scale', 'Scale');
    add('Shapes', 'Formes', 'Shapes', 'Shapes');
    add('SideView', 'Vue de côté', 'Side view', 'Side view');
    add('Start', 'Commencer', 'Start', 'Start');

    add('ThreeEdge', 'Trois arêtes', 'Three edges', 'Three edges');
    add('ThreeObject', 'Trois objets', 'Three objects', 'Three objects');
    add('Time', 'Temps', 'Time', 'Time');
    add('TopView', 'Vue en plan', 'Top view', 'Top view');
    add('Transparency', 'Transparence', 'Transparency', 'Transparency');
    add('TwoEdge', 'Deux arêtes', 'Two edges', 'Two edges');
    add('TwoObject', 'Deux objets', 'Two objects', 'Two objects');

    add('Wrong', 'Faux!', 'Wrong!','Falsch!');
  }
);
