@import AlanSDK;

#import "AlanVoice.h"
#import "AlanVersion.h"
#import "MainViewController.h"
#import <Cordova/CDV.h>

typedef NS_ENUM(NSUInteger, AlanButtonPosition) {
    AlanButtonPositionLeft = 0,
    AlanButtonPositionRight = 1,
    AlanButtonPositionBottom = 2,
    AlanButtonPositionNone = 3,
};

@interface AlanVoice()
@property (nonatomic) NSInteger left;
@property (nonatomic) NSInteger right;
@property (nonatomic) NSInteger bottom;
@property (nonatomic) NSInteger zIndex;

@property (nonatomic) AlanButton* button;
@property (nonatomic) AlanText* text;
@property (nonatomic) NSString* callbackId;
@end

@implementation AlanVoice

- (NSInteger)getValueFromParam:(NSString*)param andPosition:(AlanButtonPosition)position
{
    if ([param isKindOfClass:[NSNull class]])
     {
        return 0;
    }

    NSInteger result = 0;
    NSString* paramString = [NSString stringWithFormat:@"%@", param];
    if( [paramString containsString:@"px"] )
    {
        paramString = [paramString stringByReplacingOccurrencesOfString:@"px" withString:@""];
        result = [paramString intValue];
    }
    else if( [paramString containsString:@"%"] )
    {
        paramString = [paramString stringByReplacingOccurrencesOfString:@"%" withString:@""];
        result = [paramString intValue];
        CGRect screenRect = [[UIScreen mainScreen] bounds];
        NSInteger screenWidth = (NSInteger) (floor(screenRect.size.width));
        NSInteger screenHeight = (NSInteger) (floor(screenRect.size.height));
        if (position == AlanButtonPositionBottom)
        {
            result = screenHeight * result / 100;
        }
        else
        {
            result = screenWidth * result / 100;
        }
    }
    else
    {
        result = [paramString intValue];
    }
    
    return result;
}

- (void)pluginInitialize
{
}

- (void)dealloc
{
    self.callbackId = nil;
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)addButton:(CDVInvokedUrlCommand *)command
{
    if( self.button != nil )
    {
        return;
    }
    if( command.arguments.count < 1 )
    {
        return;
    }
    if( command.arguments.count > 4 )
    {
        self.zIndex = [self getValueFromParam:[command.arguments objectAtIndex:4] andPosition:AlanButtonPositionNone];
    }
    if( command.arguments.count > 3 )
    {
        self.bottom = [self getValueFromParam:[command.arguments objectAtIndex:3] andPosition:AlanButtonPositionBottom];
    }
    if( command.arguments.count > 2 )
    {
        self.right = [self getValueFromParam:[command.arguments objectAtIndex:2] andPosition:AlanButtonPositionRight];
    }
    if( command.arguments.count > 1 )
    {
        self.left = [self getValueFromParam:[command.arguments objectAtIndex:1] andPosition:AlanButtonPositionLeft];
    }
    
    self.callbackId = nil;
    self.callbackId = [NSString stringWithString:command.callbackId];
    
    NSString* platformVersion = @"unknown";
    if( pluginVersion ) {
        platformVersion = [NSString stringWithFormat:@"%@", pluginVersion];
    }
    
    NSString* key = [command.arguments objectAtIndex:0];
    AlanConfig *config = [[AlanConfig alloc] initWithKey:key platform:@"ionic" platformVersion:platformVersion];
    
    self.button = [[AlanButton alloc] initWithConfig:config];
    [self.button setTranslatesAutoresizingMaskIntoConstraints:NO];
    [self.webView addSubview:self.button];
    
    self.text = [[AlanText alloc] initWithFrame:CGRectZero];
    [self.text setTranslatesAutoresizingMaskIntoConstraints:NO];
    [self.webView addSubview:self.text];
    
    NSMutableArray* buttonConstraints = [NSMutableArray new];
    NSMutableArray* textConstraints = [NSMutableArray new];

    NSLayoutConstraint *wb = [NSLayoutConstraint constraintWithItem:self.button attribute:NSLayoutAttributeWidth relatedBy:NSLayoutRelationEqual toItem:nil attribute:NSLayoutAttributeNotAnAttribute multiplier:1 constant:64.0];
    [buttonConstraints addObject:wb];
    
    NSLayoutConstraint *hb = [NSLayoutConstraint constraintWithItem:self.button attribute:NSLayoutAttributeHeight relatedBy:NSLayoutRelationEqual toItem:nil attribute:NSLayoutAttributeNotAnAttribute multiplier:1 constant:64.0];
    [buttonConstraints addObject:hb];
    
    NSLayoutConstraint *ht = [NSLayoutConstraint constraintWithItem:self.text attribute:NSLayoutAttributeHeight relatedBy:NSLayoutRelationEqual toItem:nil attribute:NSLayoutAttributeNotAnAttribute multiplier:1 constant:64.0];
    [textConstraints addObject:ht];
    
    if( self.left > 0 )
    {
        NSLayoutConstraint *rb = [NSLayoutConstraint constraintWithItem:self.button attribute:NSLayoutAttributeLeft relatedBy:NSLayoutRelationEqual toItem:self.webView attribute:NSLayoutAttributeLeft multiplier:1 constant:self.left];
        [buttonConstraints addObject:rb];
        
        NSLayoutConstraint *lt = [NSLayoutConstraint constraintWithItem:self.text attribute:NSLayoutAttributeLeft relatedBy:NSLayoutRelationEqual toItem:self.webView attribute:NSLayoutAttributeLeft multiplier:1 constant:self.left];
        [textConstraints addObject:lt];
        
        NSLayoutConstraint *rt = [NSLayoutConstraint constraintWithItem:self.text attribute:NSLayoutAttributeRight relatedBy:NSLayoutRelationEqual toItem:self.webView attribute:NSLayoutAttributeRight multiplier:1 constant:-20.0];
        [textConstraints addObject:rt];
        
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
            [[NSNotificationCenter defaultCenter] postNotificationName:@"kAlanSDKAlanButtonPositionNotification"
                                                                object:self.button
                                                              userInfo:@{@"side":@"left"}];
        });
    }
    else if( self.right > 0 )
    {
        NSLayoutConstraint *rb = [NSLayoutConstraint constraintWithItem:self.button attribute:NSLayoutAttributeRight relatedBy:NSLayoutRelationEqual toItem:self.webView attribute:NSLayoutAttributeRight multiplier:1 constant:-self.right];
        [buttonConstraints addObject:rb];
        
        NSLayoutConstraint *lt = [NSLayoutConstraint constraintWithItem:self.text attribute:NSLayoutAttributeLeft relatedBy:NSLayoutRelationEqual toItem:self.webView attribute:NSLayoutAttributeLeft multiplier:1 constant:20.0];
        [textConstraints addObject:lt];
        
        NSLayoutConstraint *rt = [NSLayoutConstraint constraintWithItem:self.text attribute:NSLayoutAttributeRight relatedBy:NSLayoutRelationEqual toItem:self.webView attribute:NSLayoutAttributeRight multiplier:1 constant:-self.right];
        [textConstraints addObject:rt];
    }
    else
    {
        NSLayoutConstraint *rb = [NSLayoutConstraint constraintWithItem:self.button attribute:NSLayoutAttributeRight relatedBy:NSLayoutRelationEqual toItem:self.webView attribute:NSLayoutAttributeRight multiplier:1 constant:-20.0];
        [buttonConstraints addObject:rb];
        
        NSLayoutConstraint *lt = [NSLayoutConstraint constraintWithItem:self.text attribute:NSLayoutAttributeLeft relatedBy:NSLayoutRelationEqual toItem:self.webView attribute:NSLayoutAttributeLeft multiplier:1 constant:20.0];
        [textConstraints addObject:lt];
        
        NSLayoutConstraint *rt = [NSLayoutConstraint constraintWithItem:self.text attribute:NSLayoutAttributeRight relatedBy:NSLayoutRelationEqual toItem:self.webView attribute:NSLayoutAttributeRight multiplier:1 constant:-20.0];
        [textConstraints addObject:rt];
    }
    
    if( self.bottom > 0 )
    {
        CGFloat safeBottom = self.webView.safeAreaInsets.bottom;
        NSLayoutConstraint *bb = [NSLayoutConstraint constraintWithItem:self.button attribute:NSLayoutAttributeBottom relatedBy:NSLayoutRelationEqual toItem:self.webView attribute:NSLayoutAttributeBottom multiplier:1 constant:-self.bottom-safeBottom];
        [buttonConstraints addObject:bb];
        
        NSLayoutConstraint *bt = [NSLayoutConstraint constraintWithItem:self.text attribute:NSLayoutAttributeBottom relatedBy:NSLayoutRelationEqual toItem:self.webView attribute:NSLayoutAttributeBottom multiplier:1 constant:-self.bottom-safeBottom];
        [textConstraints addObject:bt];
    }
    else
    {
        CGFloat safeBottom = self.webView.safeAreaInsets.bottom;
        NSLayoutConstraint *bb = [NSLayoutConstraint constraintWithItem:self.button attribute:NSLayoutAttributeBottom relatedBy:NSLayoutRelationEqual toItem:self.webView attribute:NSLayoutAttributeBottom multiplier:1 constant:-20.0-safeBottom];
        [buttonConstraints addObject:bb];
        
        NSLayoutConstraint *bt = [NSLayoutConstraint constraintWithItem:self.text attribute:NSLayoutAttributeBottom relatedBy:NSLayoutRelationEqual toItem:self.webView attribute:NSLayoutAttributeBottom multiplier:1 constant:-20.0-safeBottom];
        [textConstraints addObject:bt];
    }
    
    [self.webView addConstraints:buttonConstraints];
    [self.webView addConstraints:textConstraints];

    if( self.zIndex > 0 )
    {
        self.button.layer.zPosition = (CGFloat) self.zIndex;
        self.text.layer.zPosition = (CGFloat) self.zIndex;
    }

    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(handleEvent:) name:@"kAlanSDKEventNotification" object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(handleConnectState:) name:@"kAlanSDKConnectStateNotification" object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(handleDialogState:) name:@"kAlanSDKDialogStateNotification" object:nil];
}

- (void)removeButton:(CDVInvokedUrlCommand *)command
{
    self.left = 0.0;
    self.right = 0.0;
    self.bottom = 0.0;
    self.zIndex = 0.0;
    self.callbackId = nil;
    [self.button removeFromSuperview];
    self.button = nil;
    [self.text removeFromSuperview];
    self.text = nil;
    
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)handleConnectState:(NSNotification*)notification
{
    NSDictionary *userInfo = notification.userInfo;
    if( userInfo == nil)
    {
        return;
    }
    NSNumber *state = [userInfo objectForKey:@"onConnectState"];
    //    NSLog(@"onConnectState: %@", state);
    NSString *stateString = nil;
    if( [state integerValue] == 3 )
    {
        stateString = @"connected";
    }
    else
    {
        stateString = @"disconnected";
    }
    NSDictionary *result = @{@"type": @"connectionState", @"data": stateString};
    if( self.callbackId )
    {
        NSLog(@"sending callback dictionary: %@", result);
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:result];
        [pluginResult setKeepCallbackAsBool:YES];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:self.callbackId];
    }
}

- (void)handleDialogState:(NSNotification*)notification
{
    NSDictionary *userInfo = notification.userInfo;
    if( userInfo == nil)
    {
        return;
    }
    NSNumber *stateString = [userInfo objectForKey:@"onDialogState"];
    //    NSLog(@"onDialogState: %@", stateString);
}

- (void)handleEvent:(NSNotification*)notification
{
    NSDictionary *userInfo = notification.userInfo;
    if( userInfo == nil)
    {
        return;
    }
    NSString *jsonString = [userInfo objectForKey:@"jsonString"];
    if( jsonString == nil)
    {
        return;
    }
    NSData *jsonData = [jsonString dataUsingEncoding:NSUTF8StringEncoding];
    
    NSError *error = nil;
    id unwrapped = [NSJSONSerialization JSONObjectWithData:jsonData options:NSJSONReadingMutableContainers error:&error];
    if( error != nil)
    {
        return;
    }
    if( ![unwrapped isKindOfClass:[NSDictionary class]] )
    {
        return;
    }
    NSDictionary *d = [NSDictionary dictionaryWithDictionary:unwrapped];
    NSDictionary *data = [d objectForKey:@"data"];
    if( data == nil )
    {
        return;
    }
    //    NSLog(@"received dictionary: %@", data);
    NSDictionary *result = @{@"type": @"command", @"data": data};
    if( self.callbackId )
    {
        NSLog(@"sending callback dictionary: %@", result);
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:result];
        [pluginResult setKeepCallbackAsBool:YES];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:self.callbackId];
    }
}

- (void)showButton:(CDVInvokedUrlCommand *)command;
{
    if( self.button == nil )
    {
        return;
    }
    self.button.hidden = NO;
}

- (void)hideButton:(CDVInvokedUrlCommand *)command
{
    if( self.button == nil )
    {
        return;
    }
    self.button.hidden = YES;
}

- (void)callProjectApi:(CDVInvokedUrlCommand *)command
{
    if( self.button == nil )
    {
        return;
    }
    if( command.arguments.count < 2 )
    {
        return;
    }
    NSString* method = [command.arguments objectAtIndex:0];
    NSDictionary* params = [command.arguments objectAtIndex:1];
    [self.button callProjectApi:method withData:params callback:^(NSError *error, NSString *object) {
        if( error )
        {
            CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:error.localizedDescription];
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        }
        else
        {
            CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:object];
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        }
    }];
}

- (void)setVisualState:(CDVInvokedUrlCommand *)command
{
    if( self.button == nil )
    {
        return;
    }
    if( command.arguments.count < 1 )
    {
        return;
    }
    NSDictionary* visual = [command.arguments objectAtIndex:0];
    
    NSLog(@"setVisualState: %@", visual);
    [self.button setVisualState:visual];
}

- (void)playText:(CDVInvokedUrlCommand *)command
{
    if( self.button == nil )
    {
        return;
    }
    if( command.arguments.count < 1 )
    {
        return;
    }
    NSString* text = [command.arguments objectAtIndex:0];
    [self.button playText:text];
}

- (void)playCommand:(CDVInvokedUrlCommand *)command
{
    if( self.button == nil )
    {
        return;
    }
    if( command.arguments.count < 1 )
    {
        return;
    }
    NSDictionary* data = [command.arguments objectAtIndex:0];
    [self.button playCommand:data];
}

- (void)activate:(CDVInvokedUrlCommand *)command
{
    if( self.button == nil )
    {
        return;
    }
    [self.button activate];

    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:YES];
    [pluginResult setKeepCallbackAsBool:YES];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:[command callbackId]];
}

- (void)deactivate:(CDVInvokedUrlCommand *)command
{
    if( self.button == nil )
    {
        return;
    }
    [self.button deactivate];
}

- (void)isActive:(CDVInvokedUrlCommand *)command
{
    if( self.button == nil )
    {
        return;
    }
    
    BOOL isActive = [self.button isActive];
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:isActive];
    [pluginResult setKeepCallbackAsBool:YES];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:[command callbackId]];
}

@end
