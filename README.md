# 이 프로젝트를 하게 된 계기

웹으로만 구현된 웹 페이지를 네이티브 앱으로 감싼 웹뷰의 형태로 전환하고자 사전에 웹뷰 통신을 위한 설계를 하기 위해 이 프로젝트를 진행하게 되었습니다.

# Local WebView Demo with Expo

이 프로젝트는 엑스포(Expo) 앱에서 `react-native-webview`를 사용하여 로컬 웹사이트와 통신하는 방법을 보여줍니다. 웹뷰를 통해 네이티브와 웹 간의 양방향 통신을 구현합니다.

## 설치 및 실행

### 요구 사항

- Node.js 및 npm이 설치되어 있어야 합니다.
- 엑스포 CLI가 설치되어 있어야 합니다.

### 설치

1. 이 저장소를 클론합니다.

   ```bash
   git clone https://github.com/your-repo/local-webview-demo.git
   cd local-webview-demo
   ```

2. 필요한 패키지를 설치합니다.

   ```bash
   npm install
   ```

3. 엑스포 앱을 실행합니다.

   ```bash
   npx expo start
   ```

4. 엑스포 앱을 실행한 후, 안드로이드 에뮬레이터 또는 iOS 시뮬레이터에서 앱을 실행합니다.

   - 엑스포 개발자 도구에서 "Run on Android device/emulator" 또는 "Run on iOS simulator"를 선택하여 앱을 실행할 수 있습니다.
   - 엑스포 Go 앱을 사용하여 실제 기기에서 테스트할 수도 있습니다.

## 코드 설명

### 주요 파일

- `app/(tabs)/index.tsx`: 웹뷰를 통해 로컬 웹사이트와 통신하는 주요 로직이 포함된 파일입니다.

### 주요 기능

- **웹뷰 설정**: `react-native-webview`를 사용하여 로컬 웹사이트를 로드합니다. 안드로이드와 iOS 환경에 맞게 URL을 설정합니다.

- **네이티브에서 웹으로 메시지 보내기**: 네이티브 앱에서 웹으로 메시지를 보내는 기능을 구현합니다. `postMessage` 메소드를 사용하여 웹으로 데이터를 전송합니다.

- **웹에서 네이티브로 메시지 받기**: 웹에서 네이티브로 메시지를 받을 때 `onMessage` 이벤트 핸들러를 사용합니다. 웹에서 보낸 메시지를 수신하고, 이를 처리합니다.

### 웹과의 통신

#### 웹에서 네이티브로 메시지 보내기

웹에서는 `window.ReactNativeWebView.postMessage`를 사용하여 네이티브로 메시지를 보냅니다. 이 메시지는 네이티브의 `onMessage` 핸들러에서 수신됩니다.

```javascript
// 웹사이트의 JavaScript 코드
window.ReactNativeWebView.postMessage(
  JSON.stringify({
    type: "WEB_MESSAGE",
    data: "웹에서 보낸 메시지입니다!",
  })
);
```

#### 네이티브에서 웹으로 메시지 보내기

네이티브에서는 `webviewRef.current?.postMessage`를 사용하여 웹으로 메시지를 보냅니다. 웹에서는 이 메시지를 수신하여 처리할 수 있습니다.

```typescript
// 네이티브 코드 (app/(tabs)/index.tsx)
const sendMessageToWeb = () => {
  const message = {
    type: "NATIVE_MESSAGE",
    data: "네이티브에서 보낸 메시지입니다!",
  };

  webviewRef.current?.postMessage(JSON.stringify(message));
};
```

웹에서는 다음과 같이 메시지를 받을 수 있습니다:

```javascript
// 웹사이트의 JavaScript 코드
window.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  console.log("네이티브로부터 받은 메시지:", message);
});
```

#### 커스텀 웹뷰 통신

네이티브에서 `injectedJavaScript`를 통해 웹뷰에 JavaScript 코드를 주입하여 통신을 커스텀할 수 있습니다. 예를 들어, `VideoPortalJS` 객체를 사용하여 메시지를 보낼 수 있습니다:

```typescript
// 네이티브 코드 (app/(tabs)/index.tsx)
const injectedJavaScript = `
  (function () {
    window.VideoPortalJS = {
      sendEvent: (message) => {
        window.ReactNativeWebView.postMessage(message);
      },
    };
  })();
  true;
`;
```

이렇게 하면 웹사이트의 다른 부분에서 `VideoPortalJS.sendEvent`를 호출하여 네이티브로 메시지를 보낼 수 있습니다.

```typescript
// 웹사이트의 JavaScript 코드
if ((window as any).VideoPortalJS) {
  (window as any).VideoPortalJS.sendEvent(JSON.stringify(event));
}
```

### 디버깅

- **디버그 콘솔**: 웹뷰 내에서 간단한 디버그 콘솔을 추가하여 웹에서 발생하는 로그를 시각적으로 확인할 수 있습니다.

## 주의사항

- 실제 기기에서 테스트할 경우, 같은 네트워크에 있는 컴퓨터의 로컬 IP 주소를 사용해야 합니다.

## 기여

기여를 원하신다면, 이 저장소를 포크하고 풀 리퀘스트를 보내주세요. 버그 리포트나 기능 요청도 환영합니다.
