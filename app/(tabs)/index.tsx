import { StyleSheet, Platform, View, Button } from "react-native";
import { WebView } from "react-native-webview";
import { useRef } from "react";

declare global {
  interface Global {
    nativeModule?: {
      setWebContentsDebuggingEnabled: (enabled: boolean) => void;
    };
  }

  var nativeModule: Global["nativeModule"];
}

export default function TabOneScreen() {
  // webview 참조를 위한 ref 생성
  const webviewRef = useRef<WebView>(null);

  // 안드로이드 에뮬레이터를 위한 URL 처리
  const getWebViewUri = () => {
    global.nativeModule?.setWebContentsDebuggingEnabled(true);
    return Platform.OS === "android"
      ? "웹뷰로 띄울 주소 로컬을 띄우면 IP주소"
      : "http://localhost:3000";
  };

  // 웹뷰와 네이티브 간의 통신을 처리하는 함수
  const onMessage = (event: any) => {
    const data = JSON.parse(event.nativeEvent.data);
    // console.log("웹에서 받은 메시지:", );
    window.alert("웹에서 받은 메시지:" + data);
    // if (data.type === 'GET_DEVICE_INFO') {
    //   webviewRef.current.postMessage(
    //     JSON.stringify({
    //       type: 'DEVICE_INFO',
    //       param: { device: 'Galaxy S23', os: 'Android 13' },
    //     })
    //   );
    // }
  };

  // 웹뷰에 주입할 자바스크립트 코드
  const injectedJavaScript = `
    // 네이티브에 메시지를 보내는 예시
    (function() { window.VideoPortalJS = { sendEvent: (message) => { window.ReactNativeWebView.postMessage(message); } }; })();
    
    // 간단한 디버그 콘솔 추가
    const debugDiv = document.createElement('div');
    debugDiv.id = 'debug-console';
    debugDiv.style.position = 'fixed';
    debugDiv.style.bottom = '0';
    debugDiv.style.left = '0';
    debugDiv.style.right = '0';
    debugDiv.style.backgroundColor = 'rgba(0,0,0,0.8)';
    debugDiv.style.color = 'white';
    debugDiv.style.padding = '10px';
    debugDiv.style.maxHeight = '30%';
    debugDiv.style.overflow = 'auto';
    document.body.appendChild(debugDiv);

    // console.log 오버라이드
    const originalLog = console.log;
    console.log = (...args) => {
      originalLog.apply(console, args);
      const debugDiv = document.getElementById('debug-console');
      if (debugDiv) {
        debugDiv.innerHTML += args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : arg
        ).join(' ') + '<br>';
      }
    };
    true;
  `;

  // 네이티브에서 웹으로 메시지를 보내는 함수
  const sendMessageToWeb = () => {
    const message = {
      type: "NATIVE_MESSAGE",
      data: "네이티브에서 보낸 메시지입니다!",
    };

    webviewRef.current?.postMessage(
      JSON.stringify({
        type: "DEVICE_INFO",
        param: { device: "iPhone 14", os: "iOS 17" },
      })
    );
    webviewRef.current?.postMessage(JSON.stringify(message));
    // webviewRef.current?.injectJavaScript(`
    //   // 웹에서 메시지를 받는 이벤트 리스너가 없다면 생성
    //   if (!window.nativeMessageHandler) {
    //     window.nativeMessageHandler = (message) => {
    //       // 더 명확한 콘솔 로그
    //       console.log('%c 네이티브로부터 메시지 수신 ', 'background: #222; color: #bada55');
    //       console.log('메시지 타입:', message.type);
    //       console.log('메시지 데이터:', message.data);

    //       // 웹 페이지에 시각적으로 표시 (선택사항)
    //       const messageDiv = document.createElement('div');
    //       messageDiv.innerHTML = '네이티브 메시지: ' + message.data;
    //       messageDiv.style.padding = '10px';
    //       messageDiv.style.margin = '10px';
    //       messageDiv.style.backgroundColor = '#f0f0f0';
    //       document.body.appendChild(messageDiv);
    //     };
    //   }
    //   window.nativeMessageHandler(${JSON.stringify(message)});
    //   true;
    // `);
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        source={{ uri: getWebViewUri() }}
        style={styles.webview}
        onMessage={(event) => onMessage(event)}
        injectedJavaScript={injectedJavaScript}
        // 개발 환경에서 안전하지 않은 localhost 접속 허용
        originWhitelist={["*"]}
        // 웹뷰 디버깅 설정 추가
        androidLayerType="hardware"
        setBuiltInZoomControls={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
      />
      <Button title="웹으로 메시지 보내기" onPress={sendMessageToWeb} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
