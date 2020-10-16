# Alan SDK Cordova component

[Alan Platform](https://alan.app/) • [Alan Studio](https://studio.alan.app/register) • [Docs](https://alan.app/docs) • [FAQ](https://alan.app/docs/usage/additional/faq) •
[Blog](https://alan.app/blog/) • [Twitter](https://twitter.com/alanvoiceai)

Add a voice assistant to your application. With no or minimal changes to the existing UI.

## How to start:

1. Run `npm i @alan-ai/cordova-plugin-alan-voice`

2. Add the Alan button view to a template.

```javascript 
<alan-button id="alanBtnEl"
             #alanBtnEl
             alan-key="<YOUR_PROJECT_ID_FROM_ALAN_STUDIO>"></alan-button>
```

3. Import the Alan button to your *.ts file and make a View Child.

```javascript
import "@alan-ai/alan-button";

@ViewChild('alanBtnEl') alanBtnComponent: ElementRef<HTMLAlanButtonElement>;
```

4. You are now ready to interact with Alan!

## Have questions?

If you have any questions or if something is missing in the documentation, please [contact us](mailto:support@alan.app), or tweet us [@alanvoiceai](https://twitter.com/alanvoiceai). We love hearing from you!)

