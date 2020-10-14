
## Introduction

This module allows you to work with async options on [Cloudinary](https://cloudinary.com/) without the need for a backend component listening to Cloudinary webhooks. 

This module utilizes [PubNub](https://www.pubnub.com/) to link all webhooks from Cloudinary to a specific random channel in your code.

## Pre-requirements

Please make sure to open a [Cloudinary](https://cloudinary.com/) account and [PubNub](https://www.pubnub.com/) account, both has free plan.
 
## Install

```sh
npm install easy-cloudinary-eager-transformation --save
```
## Configuration

```js
var easy_cld = require("easy-cloudinary-eager-transformation")

var pubnub = {
    subscribeKey: "",
    publishKey: "",
    ssl: true
}

var cld = {
    cloud_name: "",
    api_key: "",
    api_secret: ""
}

easy_cld.config(cld, pubnub)
```

## Examples

#### AI Background Removal
The Cloudinary [AI Background Removal add-on](https://cloudinary.com/documentation/cloudinary_ai_background_removal_addon#:~:text=The%20Cloudinary%20AI%20Background%20Removal,in%20a%20matter%20of%20seconds.) combines a variety of deep-learning algorithms to recognize the primary foreground object(s) in a photo and accurately remove the background in a matter of seconds

```js
easy_cld.update("image_public_id" , "image", "upload", {
        background_removal: "cloudinary_ai:fine_edges"
    }, function (err, data) {
        console.log(err, data)
    });
```

#### AI-based Video Preview
Cloudinary offers [intelligent automatic generation of video previews](https://cloudinary.com/blog/auto_generate_video_previews_with_great_results_every_time) to give viewers a preliminary look at the most interesting content. 

```js
easy_cld.explicit("video_public_id" , "video", "upload", {
        effect: "preview"
    }, function (err, data) {
        console.log(err, data)
    });
```

#### Google Automatic Video Tagging
The [Google Automatic Video Tagging add-on](https://cloudinary.com/documentation/google_automatic_video_tagging_addon) integrates Google's automatic video tagging capabilities with Cloudinary's complete video management and manipulation pipeline. Google analyzes video data to automatically identify scenes and suggest tags.

```js
easy_cld.update("video_public_id" , "video", "upload", {
        resource_type: "video",
        categorization: "google_video_tagging"
    }, function (err, data) {
        console.log(err, data)
});
```

### APIs

TBD

Author
------
[**Yakir Perlin**](https://www.linkedin.com/in/yakirperlin/)

License
-------
MIT License (Expat). See [LICENSE.md](https://github.com/yakirp/easy-cloudinary-eager-transformation/blob/main/LICENSE) for details.

