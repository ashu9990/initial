'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    FeatureModel = mongoose.model('Feature'),
    _ = require('lodash'),
    uuid = require('node-uuid'),
    multiparty = require('multiparty'),
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp');

module.exports = function (FeatureCtrl) {

    return {
         /**
          * Find Feature by id
          */

        feature: function (req, res, next, id) {
            FeatureModel.load(id, function (err, feature) {
                if (err) {
                    return next(err);
                }
                if (!feature) {
                    return next(new Error('Failed to load role ' + id));
                }
                req.feature = feature;
                next();
            });
        },

         /**
          * Create the Feature
          */

        create: function (req, res) {
            var feature = new FeatureModel(req.body);
            req.assert('name', 'You must enter a Name').notEmpty();
            req.assert('description', 'You must enter description').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            feature.save(function (err) {
                if (err) {
					switch (err.code) {
                        case 11000:
                        case 11001:
                            res.status(400).json([{
                                msg : ' Feature already exists',
                                param : 'name'
                            }]);
                        break;
                        default:
                        var modelErrors = [];
                        if (err.errors) {
                            for (var x in err.errors) {
                                modelErrors.push({
                                    param: x,
                                    msg: err.errors[x].message,
                                    value: err.errors[x].value
                                });
                            }
                            res.status(400).json(modelErrors);
                        }
                    }
                    return res.status(400);
                }
                res.json(feature);
            });
        },

        /** Update the Feature*/
        update: function (req, res) {
            var feature = req.feature;
            req.assert('name', 'You must enter a Name').notEmpty();
            req.assert('url', 'You must enter a URL').notEmpty();
            feature = _.extend(feature, req.body);
            feature.save(function (err) {
                if (err) {
					switch (err.code) {
                        case 11000:
                        case 11001:
                            res.status(400).json([{
                                msg : ' Role already exists',
                                param : 'name'
                            }]);
                        break;
                        default:
                            var modelErrors = [];
                        if (err.errors) {
                            for (var x in err.errors) {
                                modelErrors.push({
                                    param: x,
                                    msg: err.errors[x].message,
                                    value: err.errors[x].value
                                });
                            }
                            res.status(400).json(modelErrors);
                        }
                    }
                    return res.status(400);
                }
                res.json(feature);
            });
        },


         /**
          * Delete the Feature
          */
        destroy: function (req, res) {
            var feature = req.feature;
            feature.remove(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the feature'
                    });
                }
                res.json(feature);
            });
        },

         /**
          * Show the Feature
          */
         show: function (req, res) {
            res.json(req.feature);
        },

         /**
          * List of Features
         */
        all: function (req, res) {
            FeatureModel.find().sort({ name: 'asc' }).exec(function (err, features) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the features'
                    });
                }
                res.json(features);
            });
        },

        /**
         * Image Upload
         */
        postImage: function(req, res) {
            var form = new multiparty.Form();
            form.parse(req, function(err, fields, files) {
                var file = files.file[0];
                var contentType = file.headers['content-type'];
                var tmpPath = file.path;
                var extIndex = tmpPath.lastIndexOf('.');
                var extension = (extIndex < 0) ? '' : tmpPath.substr(extIndex);
                // uuid is for generating unique filenames. 
                var fileName = uuid.v4() + extension;
                mkdirp('packages/contrib/meanio-system/public/assets/img/feature', function (err) {
                    if (err) console.error(err)
                });
                
                var destPath = path.resolve(__dirname, '../../../../contrib/meanio-system/public/assets/img/feature');
                destPath = destPath + '/'  + fileName;
                var destPathResponse = '/system/assets/img/feature/' + fileName;

                // Server side file type checker.
                if (contentType !== 'image/png' && contentType !== 'image/jpeg') {
                    fs.unlink(tmpPath);
                    return res.status(400).send('Unsupported file type.');
                }
                // console.log(destPath);
                var is = fs.createReadStream(tmpPath);
                var os = fs.createWriteStream(destPath);

                if(is.pipe(os)) {
                    fs.unlink(tmpPath, function (err) { //To unlink the file from temp path after copy
                        if (err) {
                            return console.error(err);
                        }
                    });
                    return res.json(destPathResponse);
                } else {
                    return res.json('File not uploaded');
                }
            });
        },
    };
}