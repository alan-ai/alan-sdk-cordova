# Alan SDK Cordova component

### How to install

#### 1. Run `npm i @alan-ai/cordova-plugin-alan-voice`

#### 2. Add Alan Button view to a template

```javascript 
    <alan-button id="alanBtnEl"
              #alanBtnEl
              alan-key="<YOUR_PROJECT_ID_FROM_ALAN_STUDIO>"></alan-button>
```

#### 3. import alan button to your *.ts file and make a View Child

```javascript
 import "@alan-ai/alan-button";
 
 @ViewChild('alanBtnEl') alanBtnComponent: ElementRef<HTMLAlanButtonElement>;
```

#### 4. You are now ready to interact with Alan!
See more on Alan [homepage](https://alan.app/)


### Other platforms:
* [Native Android](https://github.com/alan-ai/alan-sdk-android)
* [Native iOS](https://github.com/alan-ai/alan-sdk-ios)
* [Web](https://github.com/alan-ai/alan-sdk-web)
* [ReactNative](https://github.com/alan-ai/alan-sdk-reactnative)
* [Flutter](https://pub.dev/packages/alan_voice)

