
This module allows you to work with async options on [Cloudinary](https://cloudinary.com/) without the need for a backend component. 

This gives you the option to run async option on the localhost, Docker, or any serverless function.

The module utilizes [PubNub](https://www.pubnub.com/) to link all the webhook from Cloudinary to a specific random channel in your code.






### Installation

Please make sure to open a [Cloudinary](https://cloudinary.com/) account and [PubNub](https://www.pubnub.com/) account, both has free plan.
 
```sh
npm install easy-cloudinary-eager-transformation
```

## Code Examples
----

#### Remove imgage background

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

 
easy_cld.update("image_public_id" , "image", "upload", {
        background_removal: "cloudinary_ai:fine_edges"
    }, function (err, data) {
        console.log(err, data)
    });
        
})
```
