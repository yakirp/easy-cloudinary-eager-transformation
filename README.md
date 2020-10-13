 
### Installation

Please make sure to open a [Cloudinary](https://cloudinary.com/) account and [Pubnub](https://www.pubnub.com/) account, both has free plan.
 
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
