#import <React/RCTBridgeDelegate.h>
#import <React/RCTLinkingManager.h>
#import <UIKit/UIKit.h>

@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate>

@property (nonatomic, strong) UIWindow *window;

//- (BOOL)application:(UIApplication *)application
//   openURL:(NSURL *)url
//   options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
//{
//  return [RCTLinkingManager application:application openURL:url options:options];
//  //   if ([RCTLinkingManager application:application
//  //                            openURL:url
//  //                  sourceApplication:nil
//  //                         annotation:nil]) {
//  //   return YES;
//  // }
//  //   if ( [[GIDSignIn sharedInstance] handleURL:url
//  //                                    sourceApplication:options[UIApplicationOpenURLOptionsSourceApplicationKey]
//  //                                 annotation:options[UIApplicationOpenURLOptionsAnnotationKey]] ) {
//  //   return YES;
//  // }
//
//  // if ([[FBSDKApplicationDelegate sharedInstance] application:application
//  //     openURL:url
//  //     sourceApplication:options[UIApplicationOpenURLOptionsSourceApplicationKey]
//  //     annotation:options[UIApplicationOpenURLOptionsAnnotationKey]]) {
//  //   return YES;
//  // }
//
//  // return [RCTLinkingManager application:application
//  //                               openURL:url
//  //                     sourceApplication:nil
//  //                            annotation:nil];
//}

//- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity
// restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler
//{
// return [RCTLinkingManager application:application
//                  continueUserActivity:userActivity
//                    restorationHandler:restorationHandler];
//}
// - (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity restorationHandler:(void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler
// {
//   return [super application:application continueUserActivity:userActivity restorationHandler:restorationHandler];
// }
@end
