/*global require, console, process, __dirname */

var path = require('path');
var fs = require('fs');

var glob = require('glob');
var express = require('express');
var app = express();

// lets us use req.body
app.use(express.bodyParser());

// glob
// sends JSON of all the filenames that match the glob pattern
app.get('/lib/weltmeister/api/glob.php', function(req, res) {
  var pattern = req.query.glob[0];

	glob(pattern, function(err, files) {
		if (err) {
			console.error('Glob Error: ', err);
      res.json(500, err);
    }

    res.json(files);
	});
});


// browse
// sends JSON of the directories and files
app.get('/lib/weltmeister/api/browse.php', function(req, res) {
  var root = req.query.dir || '.';
  var type = req.query.type;
  var patterns = {
		images: '*.{png,gif,jpg,jpeg}'
    , scripts: '*.js'
    , files: '*.*'
		, dirs: '*/'
	};
  var result = {
		parent: false
		, dirs: []
		, files: []
	};

  // if we got a dir, set it as the parent
	if (root !== '.') {
    result.parent = root;
	}

	result.dirs = glob.sync(path.join(root, patterns.dirs));
  // weltmeister can't handle the trailing /
  result.dirs = result.dirs.map(function(item) {
		return item.substr(0, item.length-1);
	});
  result.files = glob.sync(path.join(root, patterns[type]));

  res.json(result);
});


// save
// writes the file to disk
app.post('/lib/weltmeister/api/save.php', function(req, res) {
  var filePath = req.body.path;
	var data = req.body.data;

	// Resolve the path
	filePath = path.resolve('.', filePath);

	fs.writeFile(filePath, data, function(err) {
    if (!err) {
			res.json({error: 0});
      return;
		}

    res.json({
			error: 1
			, msg: err
		});
	});
});

// Any other requests just serve the static file
app.use(express.static(__dirname));
app.listen(3000);
console.log('Listening on port 3000');
console.log('ctrl-c to quit');