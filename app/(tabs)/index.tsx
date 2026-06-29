import { Text, View } from "react-native";

export default function Index() {
  console.log(process.env.EXPO_PUBLIC_GEMINI_KEY);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>VisionAI</Text>
    </View>
  );
}
