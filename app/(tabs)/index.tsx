import { StyleSheet, Platform, View, Button, Alert } from "react-native";
import { WebView } from "react-native-webview";
import { useRef, useEffect, useState } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import * as WebBrowser from "expo-web-browser";

declare global {
  interface Global {
    nativeModule?: {
      setWebContentsDebuggingEnabled: (enabled: boolean) => void;
    };
  }

  var nativeModule: Global["nativeModule"];
}

// 알림 핸들러 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function TabOneScreen() {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const webviewRef = useRef<WebView>(null);
  const [pendingNotification, setPendingNotification] = useState<any>(null);
  const [initialNotification, setInitialNotification] = useState<any>(null);

  useEffect(() => {
    // registerForPushNotificationsAsync().then((token) =>
    //   setExpoPushToken(token)
    // );
    // // 알림 수신 리스너
    // notificationListener.current =
    //   Notifications.addNotificationReceivedListener((notification) => {
    //     console.log("알림 수신:", notification);
    //   });
    // // 알림 응답 리스너
    // responseListener.current =
    //   Notifications.addNotificationResponseReceivedListener((response) => {
    //     console.log("알림 응답:", response);
    //     // 알림이 클릭되었을 때 웹뷰로 메시지 전달
    //     const notificationData = {
    //       type: "web_external_call",
    //       param: {
    //         id: response.notification.request.identifier,
    //         title: response.notification.request.content.title,
    //         body: response.notification.request.content.body,
    //         data: response.notification.request.content.data,
    //         actionId: response.actionIdentifier,
    //       },
    //     };
    //     // 웹뷰가 준비되었을 때 메시지 전송
    //     if (webviewRef.current) {
    //       webviewRef.current.postMessage(JSON.stringify(notificationData));
    //     } else {
    //       // 웹뷰가 아직 준비되지 않았다면 나중에 전송하기 위해 저장
    //       // 예: 상태 변수에 저장하고 웹뷰가 로드될 때 전송
    //       setPendingNotification(notificationData);
    //     }
    //   });
    // 컴포넌트 마운트 시 초기 알림 데이터 확인
    // Notifications.getLastNotificationResponseAsync().then((response) => {
    // if (response) {
    //   console.log("앱이 푸시 알림으로 시작됨:", response);
    //   // 알림 데이터 저장
    //   const notificationData = {
    //     type: "web_external_call",
    //     param: {
    //       id: response.notification.request.identifier,
    //       title: response.notification.request.content.title,
    //       body: response.notification.request.content.body,
    //       data: response.notification.request.content.data,
    //       actionId: response.actionIdentifier,
    //     },
    //   };
    //   setInitialNotification(notificationData);
    //   setPendingNotification(notificationData);
    // }
  });

  // return () => {
  //   if (notificationListener.current) {
  //     Notifications.removeNotificationSubscription(
  //       notificationListener.current
  //     );
  //   }
  //   if (responseListener.current) {
  //     Notifications.removeNotificationSubscription(responseListener.current);
  //   }
  // };
  // }, []);

  // 푸시 알림 권한 요청 및 토큰 가져오기
  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    // if (Device.isDevice) {
    //   const { status: existingStatus } =
    //     await Notifications.getPermissionsAsync();
    //   let finalStatus = existingStatus;

    //   if (existingStatus !== "granted") {
    //     const { status } = await Notifications.requestPermissionsAsync();
    //     finalStatus = status;
    //   }

    //   if (finalStatus !== "granted") {
    //     Alert.alert(
    //       "알림 권한이 필요합니다",
    //       "앱 설정에서 알림 권한을 허용해주세요."
    //     );
    //     return;
    //   }

    //   token = (await Notifications.getExpoPushTokenAsync()).data;
    // } else {
    //   Alert.alert("실제 기기에서만 푸시 알림을 사용할 수 있습니다");
    // }

    // return token;
  }

  // 로컬 푸시 알림 보내기
  const sendLocalPushNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "로컬 푸시 알림",
        body: "이것은 로컬에서 보낸 푸시 알림입니다.",
        data: { data: "로컬 알림 데이터" },
      },
      trigger: null,
    });

    Alert.alert("알림 예약됨", "2초 후에 알림이 표시됩니다.");
  };

  // 안드로이드 에뮬레이터를 위한 URL 처리
  const getWebViewUri = () => {
    global.nativeModule?.setWebContentsDebuggingEnabled(true);
    return Platform.OS === "android"
      ? "http://192.168.50.139:3000"
      : "http://localhost:3000";
  };

  // 웹뷰와 네이티브 간의 통신을 처리하는 함수
  const onMessage = (event: any) => {
    const data = JSON.parse(event.nativeEvent.data);
    console.log("웹에서 받은 메시지:", data);

    if (data.type === "OPEN_SOCIAL_LOGIN") {
      openAuthWithCustomTabs();
    }
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

    // 소셜 로그인 버튼 클릭 이벤트 가로채기
    document.addEventListener('click', (e) => {
      const loginButton = e.target.closest('a[href*="/api/auth/signin"]');
      if (loginButton) {
        e.preventDefault();
        console.log('소셜 로그인 버튼 클릭됨');
        // 원래 링크 대신 직접 처리
        window.location.href = loginButton.href;
      }
    }, true);
    
    true;
  `;

  // 네이티브에서 웹으로 메시지를 보내는 함수
  const sendMessageToWeb = () => {
    const message = {
      type: "DEVICE_INFO",
      param: "네이티브에서 보낸 메시지입니다!",
    };

    webviewRef.current?.postMessage(JSON.stringify(message));
  };

  // 웹뷰 로드 완료 핸들러 수정
  const handleWebViewLoad = () => {
    console.log("웹뷰 로드 완료");

    // 대기 중인 알림이 있으면 전송
    if (pendingNotification) {
      console.log("대기 중인 알림 전송:", pendingNotification);

      // 약간의 지연 후 메시지 전송 (웹뷰가 완전히 준비되도록)
      setTimeout(() => {
        webviewRef.current?.postMessage(JSON.stringify(pendingNotification));
        setPendingNotification(null);
      }, 1000);
    }
  };

  // 소셜 로그인을 위한 Chrome Custom Tabs 열기
  const openAuthWithCustomTabs = async () => {
    // try {
    // 개발 서버의 실제 IP 주소 사용
    const serverIP = "dev-uplustv.lguplus.com"; // 개발 서버의 IP 주소
    const redirectUri = `http://${serverIP}/api/auth/callback/signin`;

    // NextAuth 소셜 로그인 URL
    const loginUrl = `https://groot-gw.accountd.lguplusdev.com/oauth2/authorize?client_id=yh5YHBudkKiUcnzWfBmLbz2gOXVcfYlA&redirect_uri=${redirectUri}&response_type=code&scope=openid+email+profile`;

    // Chrome Custom Tabs로 열기
    const result = await WebBrowser.openAuthSessionAsync(loginUrl, redirectUri);

    console.log("인증 결과:", result);

    //   if (result.type === "success") {
    //     // URL에서 토큰이나 인증 코드 추출
    //     const { url } = result;

    //     // 인증 코드 추출 (URL 형식에 따라 다를 수 있음)
    //     const code = url.includes("code=")
    //       ? url.split("code=")[1].split("&")[0]
    //       : null;

    //     if (code) {
    //       // 코드를 사용하여 토큰 교환 (서버 측에서 처리하거나 웹뷰에 전달)
    //       const authMessage = {
    //         type: "AUTH_CODE_RECEIVED",
    //         param: { '1jL1ZF9elzsMFsqIqV_tXvVRiHHL8XW-sGtDcH5oM9z_Ui3qIPQKzzxiaCfFec-jRd8yZ2gXZAgSU2gEjTrQVPb6_ERGXsV7FLdd30i2S7IbdIn0WQOGFx8e2TkZzMQl' },
    //       };
    //       webviewRef.current?.postMessage(JSON.stringify(authMessage));
    //     }
    //   }
    // } catch (error) {
    //   console.error("인증 오류:", error);
    // }
  };

  const messageToWeb = () => {
    const authMessage = {
      type: "AUTH_CODE_RECEIVED",
      param: {
        code: "dTIqoQM6ulvk1oTpH3dt4oYR8WGjVhnasuWVlsXl-kwYehhSfG6SAJKbNVSGSBsfVi5bn3NtiqNxr5cpYS1WqpL_l6Pm4J-RY95xzn6mkHDAp7B8_5dN4CeiiCWbyR9a",
      },
    };
    webviewRef.current?.postMessage(JSON.stringify(authMessage));
  };

  const clearAuthSession = async () => {
    try {
      await WebBrowser.coolDownAsync();
      console.log("인증 세션이 성공적으로 지워졌습니다.");
    } catch (error) {
      console.error("인증 세션 지우기 실패:", error);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        source={{ uri: getWebViewUri() }}
        style={styles.webview}
        onMessage={(event) => onMessage(event)}
        injectedJavaScript={injectedJavaScript}
        originWhitelist={["*"]}
        androidLayerType="hardware"
        setBuiltInZoomControls={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        onLoad={handleWebViewLoad}
      />
      <View style={styles.buttonContainer}>
        <Button title="로그아웃" onPress={clearAuthSession} />
        {/* <Button title="웹으로 메시지 보내기" onPress={sendMessageToWeb} /> */}
        <Button title="푸시 알림 보내기" onPress={sendLocalPushNotification} />
        <Button title="소셜 로그인" onPress={openAuthWithCustomTabs} />
        <Button title="코드 전달" onPress={messageToWeb} />
      </View>
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
  buttonContainer: {
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-around",
  },
});
