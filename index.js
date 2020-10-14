const cloudinary = require('cloudinary');
const PubNub = require('pubnub')
var uuid = require('uuid-v4');


var cld_settings;
var pubnub_settings;

exports.config = function (cld, pubnub) {
    this.pubnub_settings = pubnub;
    this.cld_settings = cld;

}

    
exports.explicit = function (public_id, resource_type, type, eagertransformation, callback) {
    eager(this.cld_settings, this.pubnub_settings, public_id, "explicit", resource_type, type, eagertransformation, null, null, callback);
}

exports.update = function (public_id, resource_type, type, eagertransformation, callback) {
    eager(this.cld_settings, this.pubnub_settings, public_id, "update", resource_type, type, eagertransformation, null, null, callback);
}

exports.upload = function (public_id, resource_type, type, eagertransformation, callback) {
    eager(this.cld_settings, this.pubnub_settings, public_id, "upload", resource_type, type, eagertransformation, null, null, callback);
}

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
    eagertransformation,
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
                        eager: eagertransformation
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
                            eager: eagertransformation
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

                        var options = eagertransformation;
                        options.notification_url = pubnubUrl.replace("channel", channel);
                        options.resource_type = resource_type,
                            options.type = type,

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

            if (msg.message.eager && msg.message.eager[0].ignored) {} else {
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