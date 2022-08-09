# tnt-MovesApp

# Install
```
yarn install
```


# Run
## iOS
```
Xcode
```
## Android
```
npx react-native run-android --deviceId='emulator-5554'
(or) yarn android 
```


# Build
## iOS
```
Xcode
```
## Android
```
cd android && ./gradlew assembleRelease && cd ..
```
app output apk
E:\AlisamMove-MovesMatter\mobile\android\app\build\outputs\apk\release


# Library 
 1. react-native-health
 2. react-native-device-info
 3. react-native-code-push
 4. react navigation, bottom-tabs, drawer
 
 
# Code Push
 ```
code-push release-react MovesApp-ios ios -d Production -t "1.0"
code-push release-react MovesApp-android android -d Production -t "1.0"
```
