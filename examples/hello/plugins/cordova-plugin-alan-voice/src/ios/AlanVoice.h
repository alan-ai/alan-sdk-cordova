#import <Cordova/CDVPlugin.h>

@interface AlanVoice : CDVPlugin

- (void)addButton:(CDVInvokedUrlCommand *)command;
- (void)removeButton:(CDVInvokedUrlCommand *)command;
- (void)showButton:(CDVInvokedUrlCommand *)command;
- (void)hideButton:(CDVInvokedUrlCommand *)command;
- (void)callProjectApi:(CDVInvokedUrlCommand *)command;
- (void)setVisualState:(CDVInvokedUrlCommand *)command;
- (void)playText:(CDVInvokedUrlCommand *)command;
- (void)playCommand:(CDVInvokedUrlCommand *)command;
- (void)activate:(CDVInvokedUrlCommand *)command;
- (void)deactivate:(CDVInvokedUrlCommand *)command;
- (void)isActive:(CDVInvokedUrlCommand *)command;

@end
