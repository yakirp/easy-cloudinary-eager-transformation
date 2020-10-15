const cloudinary = require('cloudinary');
const PubNub = require('pubnub')
var uuid = require('uuid-v4');

var cld_settings;
var pubnub_settings;

exports.config = function (cld, pubnub) {
    this.pubnub_settings = pubnub;
    this.cld_settings = cld;
    cloudinary.config(this.cld_settings);
}

exports.getCloudinary = cloudinary;
    
 /**
  * The explicit method is used to apply actions to already uploaded assets to Cloudinary
  *
  * @function explicit
  * @param {string} public_id - The identifier of the uploaded asset or the URL of the remote asset.
  * @param {string} resource_type - The type of asset. Valid values: image, raw, and video
  * @param {string} type - The delivery type of the asset.
  * @param {string} eager_transformation - Transformations to create for the uploaded asset.
  * @param {function} callback - A callback to run contain all the result details for the action that triggered it 
  */
exports.explicit = function (public_id, resource_type, type, eager_transformation, callback) {
    eager(this.cld_settings, this.pubnub_settings, public_id, "explicit", resource_type, type, eager_transformation, null, null, callback);
}
 
/**
  * Update one or more of the attributes associated with a specified resource (asset).
  *
  * @function Update
  * @param {string} public_id - The identifier of the uploaded asset or the URL of the remote asset.
  * @param {string} resource_type - The type of asset. Valid values: image, raw, and video
  * @param {string} type - The delivery type of the asset.
  * @param {string} eager_transformation - Transformations to create for the uploaded asset.
  * @param {function} callback - A callback to run contain all the result details for the action that triggered it 
  */
exports.update = function (public_id, resource_type, type, eager_transformation, callback) {
    eager(this.cld_settings, this.pubnub_settings, public_id, "update", resource_type, type, eager_transformation, null, null, callback);
}

/**
  * The upload method is used to upload assets to Cloudinary.
  *
  * @function upload
  * @param {string} public_id - The identifier of the uploaded asset or the URL of the remote asset.
  * @param {string} resource_type - The type of asset. Valid values: image, raw, and video
  * @param {string} type - The delivery type of the asset.
  * @param {string} eager_transformation - Transformations to create for the uploaded asset.
  * @param {function} callback - A callback to run contain all the result details for the action that triggered it 
  */
exports.upload = function (public_id, resource_type, type, eager_transformation, callback) {
    eager(this.cld_settings, this.pubnub_settings, public_id, "upload", resource_type, type, eager_transformation, null, null, callback);
}

/**
  * The multi method creates either a single animated image (GIF, PNG or WebP), video (MP4 or WebM) or a single PDF from all image assets that have been assigned a specified tag. Each asset is included as a single frame of the resulting animated image/video, or a page of the PDF (sorted alphabetically by their Public ID).
  *
  * @function multi
  * @param {string} tag - The animated GIF or PDF is created from all images with this tag.
  * @param {function} callback - A callback to run contain all the result details for the action that triggered it 
  */
exports.multi = function (tag, options = {}, callback) {
    eager(
        this.cld_settings,
        this.pubnub_settings,
        null,
        "multi",
        null,
        null,
        null,
        tag,
        options,
        callback);
}

function eager(
    cld_settings,
    pubnub_settings,
    public_id,
    method,
    resource_type,
    type,
    eager_transformation,
    tag,
    multi_optios = {},
    callback) {


    var pubnubUrl = "https://ps.pndsn.com/publish/" + pubnub_settings.publishKey + "/" + pubnub_settings.subscribeKey + "/0/channel/0/";
    var pubnub = new PubNub(pubnub_settings)

    cloudinary.config(cld_settings);

    var channel = uuid();
    var error = false;
    var results;

    var pubnubListener = {
        status: function (statusEvent) {
            if (statusEvent.operation === "PNUnsubscribeOperation") {
                pubnub.removeListener(pubnubListener)
                pubnub.disconnect();
                if (error) {
                    callback(results)
                } else {
                    callback(null, results)
                }

            };

            if (statusEvent.operation === "PNSubscribeOperation") {
                switch (method) {
                    case "upload":
                    cloudinary.v2.uploader.upload(public_id, {
                        eager_notification_url: pubnubUrl.replace("channel", channel),
                        eager_async: true,
                        notification_url : pubnubUrl.replace("channel", channel),
                        resource_type: resource_type,
                        type: type,
                        eager: eager_transformation
                    }, function (err, data) {
                        
                        if (err) {
                            error = true;
                            results = err;
                            pubnub.unsubscribe({
                                channels: [channel]
                            });

                        }
                    });
                    break;
                    case "multi":
                        multi_optios.async = true;
                        multi_optios.notification_url = pubnubUrl.replace("channel", channel);

                        cloudinary.v2.uploader.multi(tag, options, function (err, data) {

                            if (err) {
                                error = true;
                                results = err;
                                pubnub.unsubscribe({
                                    channels: [channel]
                                });

                            }
                        });
                        break;


                    case "explicit":

                        cloudinary.v2.uploader.explicit(public_id, {
                            eager_notification_url: pubnubUrl.replace("channel", channel),
                            eager_async: true,
                            resource_type: resource_type,
                            type: type,
                            eager: eager_transformation
                        }, function (err, data) {

                            if (err) {
                                error = true;
                                results = err;
                                pubnub.unsubscribe({
                                    channels: [channel]
                                });

                            }
                        });
                        break;

                    case "update":

                        var options = eager_transformation;
                        options.notification_url = pubnubUrl.replace("channel", channel);
                        options.resource_type = resource_type;
                        options.type = type;

                        cloudinary.v2.api.update(public_id, options, function (err, data) {
                                 if (err) {
                                    error = true;
                                    results = err;
                                    pubnub.unsubscribe({
                                        channels: [channel]
                                    });

                                }
                            });
                        break;
                }

            }
        },
        message: function (msg) {

            if (msg.message.eager && msg.message.eager[0].ignored) {//ignore? 
            
            } else {
                results = msg.message;
                pubnub.unsubscribe({
                    channels: [channel]
                });
            }
        }
    }

    pubnub.addListener(pubnubListener);
    pubnub.subscribe({
        channels: [channel]
    });

}